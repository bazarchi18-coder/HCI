/* ============================================================
   SoundBridge — Ambient Meter Module (Screens 21–22)
   Real-time dB measurement via Web Audio API
   ============================================================ */
(function () {
  'use strict';

  /* ---- module-level state ---- */
  let audioCtx = null;
  let analyser = null;
  let mediaStream = null;
  let animFrameId = null;
  let saveInterval = null;
  let demoMode = false;
  let currentDb = 0;

  /* ---- helpers ---- */
  function dbColor(db) {
    if (db < 40) return '#22c55e';   /* green  */
    if (db < 70) return '#eab308';   /* yellow */
    return '#ef4444';                 /* red    */
  }

  function dbLabel(db) {
    if (db < 40) return { emoji: '🟢', text: 'Quiet — Good for conversation' };
    if (db < 70) return { emoji: '🟡', text: 'Moderate — You may need captions' };
    return { emoji: '🔴', text: 'Loud — Captions recommended' };
  }

  function cleanup() {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (saveInterval) { clearInterval(saveInterval); saveInterval = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
    analyser = null;
    demoMode = false;
  }

  /* ==========================================================
     Screen 21 — Ambient Meter
     ========================================================== */
  SB.registerScreen('screen-meter', {
    title: 'Ambient Meter',
    showHeader: true,
    showBack: true,
    showNav: true,

    html() {
      return `
<style>
  .meter-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - var(--header-height) - var(--nav-height) - 32px);padding:var(--space-xl) var(--screen-padding);gap:var(--space-lg);text-align:center}

  /* ---- Circular gauge ---- */
  .meter-gauge{position:relative;width:220px;height:220px}
  .meter-gauge-ring{width:100%;height:100%;border-radius:var(--radius-full);position:relative;display:flex;align-items:center;justify-content:center}
  .meter-gauge-ring::before{
    content:'';position:absolute;inset:0;border-radius:var(--radius-full);
    background:conic-gradient(from 220deg,#22c55e 0%,#22c55e 28%,#eab308 28%,#eab308 50%,#ef4444 50%,#ef4444 78%,transparent 78%);
    mask:radial-gradient(farthest-side,transparent calc(100% - 10px),#000 calc(100% - 10px));-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 10px),#000 calc(100% - 10px));
    opacity:.18
  }
  .meter-gauge-fill{
    position:absolute;inset:0;border-radius:var(--radius-full);
    transition:background .15s;
    mask:radial-gradient(farthest-side,transparent calc(100% - 10px),#000 calc(100% - 10px));-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 10px),#000 calc(100% - 10px))
  }
  .meter-gauge-center{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .meter-db-value{font-size:52px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;transition:color .25s}
  .meter-db-unit{font-size:var(--text-lg);font-weight:500;color:var(--color-text-secondary);margin-top:var(--space-2xs)}

  /* ---- Label ---- */
  .meter-label{font-size:var(--text-base);font-weight:500;min-height:28px;transition:color .25s}
  .meter-demo-badge{font-size:var(--text-xs);background:var(--color-surface-elevated);border-radius:var(--radius-full);padding:var(--space-2xs) var(--space-base);color:var(--color-text-tertiary)}

  /* ---- Needle indicator dot ---- */
  .meter-needle{position:absolute;width:12px;height:12px;background:#fff;border-radius:var(--radius-full);box-shadow:0 0 8px rgba(0,0,0,.3);transition:transform .15s;z-index:3;top:4px;left:50%;margin-left:-6px;transform-origin:6px 104px}

  .meter-footer{width:100%;max-width:340px;margin-top:auto;padding-bottom:var(--space-lg)}
</style>
<div class="meter-wrap animate-fade-in">
  <div class="meter-gauge" id="meterGauge">
    <div class="meter-gauge-ring">
      <div class="meter-gauge-fill" id="meterGaugeFill"></div>
      <div class="meter-needle" id="meterNeedle"></div>
      <div class="meter-gauge-center">
        <span class="meter-db-value" id="meterDbValue">0</span>
        <span class="meter-db-unit">dB</span>
      </div>
    </div>
  </div>
  <p class="meter-label" id="meterLabel">🟢 Quiet — Good for conversation</p>
  <span class="meter-demo-badge hidden" id="meterDemoBadge">Demo Mode</span>
  <div class="meter-footer">
    <button class="btn btn-ghost btn-block" id="meterHistBtn">
      <span class="material-symbols-rounded">show_chart</span> View History
    </button>
  </div>
</div>`;
    },

    onShow() {
      const dbVal    = document.getElementById('meterDbValue');
      const label    = document.getElementById('meterLabel');
      const fill     = document.getElementById('meterGaugeFill');
      const needle   = document.getElementById('meterNeedle');
      const demoBadge = document.getElementById('meterDemoBadge');
      const histBtn  = document.getElementById('meterHistBtn');

      histBtn && histBtn.addEventListener('click', () => SB.navigate('screen-meter-history'));

      /* ---- Update UI with dB value ---- */
      function updateGauge(db) {
        db = Math.max(0, Math.min(100, Math.round(db)));
        currentDb = db;

        dbVal.textContent = db;
        dbVal.style.color = dbColor(db);

        const info = dbLabel(db);
        label.textContent = info.emoji + ' ' + info.text;

        /* gauge fill: 280deg arc starting at 220deg */
        const pct = db / 100;
        const fillDeg = pct * 280;
        const col = dbColor(db);
        fill.style.background = `conic-gradient(from 220deg, ${col} 0deg, ${col} ${fillDeg}deg, transparent ${fillDeg}deg)`;

        /* needle rotation: 0dB = -140deg, 100dB = +140deg relative to top */
        const angle = -140 + pct * 280;
        needle.style.transform = `rotate(${angle}deg)`;
      }

      /* ---- Real Audio Pipeline ---- */
      function startAudio(stream) {
        mediaStream = stream;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.fftSize);

        function tick() {
          analyser.getByteTimeDomainData(buffer);
          /* RMS calculation */
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buffer.length);
          /* Map RMS to approximate dB (0-100 scale) */
          const db = Math.min(100, Math.max(0, rms * 200));
          updateGauge(db);
          animFrameId = requestAnimationFrame(tick);
        }
        tick();
      }

      /* ---- Demo mode (fallback) ---- */
      function startDemo() {
        demoMode = true;
        demoBadge.classList.remove('hidden');
        let demoDb = 30;
        function tick() {
          demoDb += (Math.random() - 0.45) * 6;
          demoDb = Math.max(8, Math.min(95, demoDb));
          updateGauge(demoDb);
          animFrameId = requestAnimationFrame(tick);
        }
        tick();
      }

      /* ---- Request mic ---- */
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(startAudio)
          .catch(() => {
            SB.showToast('Microphone not available — showing demo', 'info');
            startDemo();
          });
      } else {
        SB.showToast('Microphone API not supported — showing demo', 'info');
        startDemo();
      }

      /* ---- Save reading every 30s ---- */
      saveInterval = setInterval(() => {
        const info = dbLabel(currentDb);
        SB.Storage.addMeterReading({
          time: new Date().toISOString(),
          db: currentDb,
          label: info.text
        });
      }, 30000);

      updateGauge(0);
    },

    onHide() {
      cleanup();
    }
  });

  /* ==========================================================
     Screen 22 — Noise History (canvas graph)
     ========================================================== */
  SB.registerScreen('screen-meter-history', {
    title: 'Noise History',
    showHeader: true,
    showBack: true,
    showNav: true,

    html() {
      return `
<style>
  .meter-hist-wrap{padding:var(--space-base) var(--screen-padding);padding-bottom:var(--space-3xl)}
  .meter-hist-canvas-wrap{position:relative;width:100%;aspect-ratio:16/9;background:var(--color-surface-elevated);border-radius:var(--radius-xl);overflow:hidden;margin-bottom:var(--space-lg)}
  .meter-hist-canvas-wrap canvas{width:100%;height:100%;display:block}
  .meter-hist-section-title{font-size:var(--text-sm);font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-tertiary);margin-bottom:var(--space-sm)}
  .meter-hist-list{display:flex;flex-direction:column;gap:var(--space-xs)}
  .meter-hist-item{display:flex;align-items:center;gap:var(--space-base);padding:var(--space-sm) var(--space-base);background:var(--color-surface-elevated);border-radius:var(--radius-lg)}
  .meter-hist-item-dot{width:10px;height:10px;border-radius:var(--radius-full);flex-shrink:0}
  .meter-hist-item-db{font-weight:700;font-variant-numeric:tabular-nums;min-width:46px}
  .meter-hist-item-time{flex:1;font-size:var(--text-sm);color:var(--color-text-tertiary);text-align:right}
</style>
<div class="meter-hist-wrap animate-fade-in">
  <div class="meter-hist-canvas-wrap">
    <canvas id="meterHistCanvas"></canvas>
  </div>
  <p class="meter-hist-section-title">Recent Readings</p>
  <div class="meter-hist-list" id="meterHistList"></div>
  <div class="empty-state hidden" id="meterHistEmpty" style="padding:var(--space-3xl) 0;text-align:center">
    <span class="material-symbols-rounded" style="font-size:56px;color:var(--color-text-tertiary)">show_chart</span>
    <p class="text-lg font-medium" style="margin-top:var(--space-base)">No readings yet</p>
    <p class="text-sm text-tertiary">Start monitoring to see noise history</p>
  </div>
</div>`;
    },

    onShow() {
      const canvas = document.getElementById('meterHistCanvas');
      const listEl = document.getElementById('meterHistList');
      const emptyEl = document.getElementById('meterHistEmpty');
      const history = SB.Storage.getMeterHistory() || [];

      if (history.length === 0) {
        emptyEl.classList.remove('hidden');
        canvas.parentElement.style.display = 'none';
        listEl.innerHTML = '';
        return;
      }
      emptyEl.classList.add('hidden');

      /* ---- draw canvas graph ---- */
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      const pad = { top: 16, right: 12, bottom: 32, left: 38 };
      const gW = W - pad.left - pad.right;
      const gH = H - pad.top - pad.bottom;

      /* colour zones */
      const zones = [
        { min: 0,  max: 40,  color: 'rgba(34,197,94,0.12)' },
        { min: 40, max: 70,  color: 'rgba(234,179,8,0.12)' },
        { min: 70, max: 100, color: 'rgba(239,68,68,0.12)' }
      ];
      zones.forEach(z => {
        const y1 = pad.top + gH - (z.max / 100) * gH;
        const y2 = pad.top + gH - (z.min / 100) * gH;
        ctx.fillStyle = z.color;
        ctx.fillRect(pad.left, y1, gW, y2 - y1);
      });

      /* grid lines */
      ctx.strokeStyle = 'rgba(128,128,128,0.15)';
      ctx.lineWidth = 1;
      [0, 20, 40, 60, 80, 100].forEach(v => {
        const y = pad.top + gH - (v / 100) * gH;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + gW, y); ctx.stroke();
        ctx.fillStyle = 'rgba(128,128,128,0.5)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(v + '', pad.left - 6, y + 3);
      });

      /* data line */
      const pts = history.slice(-50);
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        /* gradient stroke */
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gH);
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(0.4, '#eab308');
        grad.addColorStop(1, '#22c55e');
        ctx.strokeStyle = grad;

        pts.forEach((p, i) => {
          const x = pad.left + (i / (pts.length - 1)) * gW;
          const y = pad.top + gH - (Math.min(100, p.db || 0) / 100) * gH;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        /* area fill under curve */
        const lastX = pad.left + gW;
        ctx.lineTo(lastX, pad.top + gH);
        ctx.lineTo(pad.left, pad.top + gH);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gH);
        areaGrad.addColorStop(0, 'rgba(239,68,68,0.1)');
        areaGrad.addColorStop(0.4, 'rgba(234,179,8,0.07)');
        areaGrad.addColorStop(1, 'rgba(34,197,94,0.04)');
        ctx.fillStyle = areaGrad;
        ctx.fill();

        /* dots */
        pts.forEach((p, i) => {
          const x = pad.left + (i / (pts.length - 1)) * gW;
          const y = pad.top + gH - (Math.min(100, p.db || 0) / 100) * gH;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = dbColor(p.db || 0);
          ctx.fill();
        });
      }

      /* x-axis labels (first, middle, last) */
      ctx.fillStyle = 'rgba(128,128,128,0.5)';
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      [0, Math.floor(pts.length / 2), pts.length - 1].forEach(idx => {
        if (!pts[idx]) return;
        const x = pad.left + (idx / Math.max(1, pts.length - 1)) * gW;
        const t = pts[idx].time ? new Date(pts[idx].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        ctx.fillText(t, x, H - 8);
      });

      /* ---- recent readings list ---- */
      const recent = history.slice(-20).reverse();
      listEl.innerHTML = recent.map(r => {
        const col = dbColor(r.db || 0);
        const time = r.time ? SB.formatTime(r.time) : '';
        return `
<div class="meter-hist-item">
  <span class="meter-hist-item-dot" style="background:${col}"></span>
  <span class="meter-hist-item-db" style="color:${col}">${Math.round(r.db || 0)} dB</span>
  <span class="meter-hist-item-time">${time}</span>
</div>`;
      }).join('');
    }
  });

})();
