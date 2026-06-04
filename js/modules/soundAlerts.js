/* ============================================================
   SoundBridge — Sound Alerts Module (Screens 14–16)
   Simulated sound detection with test & vibration support
   ============================================================ */
(function () {
  'use strict';

  /* ---- colour map for alert types ---- */
  const ALERT_TYPES = {
    doorbell:       { label: 'Doorbell',         icon: 'doorbell',        color: 'var(--color-primary)',  bg: 'var(--gradient-primary)' },
    alarm:          { label: 'Alarm',             icon: 'alarm',           color: 'var(--color-alert)',    bg: 'var(--gradient-alert)' },
    babyCry:        { label: 'Baby Cry',          icon: 'child_care',      color: 'var(--color-purple)',   bg: 'var(--gradient-purple)' },
    dogBark:        { label: 'Dog Bark',          icon: 'pets',            color: 'var(--color-warning)',  bg: 'var(--gradient-warm)' },
    smokeDetector:  { label: 'Smoke Detector',    icon: 'detector_smoke',  color: 'var(--color-alert)',    bg: 'var(--gradient-alert)' },
    siren:          { label: 'Emergency Siren',   icon: 'emergency',       color: 'var(--color-alert)',    bg: 'var(--gradient-alert)' }
  };

  const ALERT_ORDER = ['doorbell', 'alarm', 'babyCry', 'dogBark', 'smokeDetector', 'siren'];

  /* ==========================================================
     Screen 14 — Alert Setup
     ========================================================== */
  SB.registerScreen('screen-alert-setup', {
    title: 'Sound Monitor',
    showHeader: true,
    showBack: true,
    showNav: true,

    html() {
      return `
<style>
  .alert-setup-wrap{padding:var(--space-base) var(--screen-padding);padding-bottom:var(--space-3xl)}
  .alert-setup-desc{margin-bottom:var(--space-lg);color:var(--color-text-secondary);font-size:var(--text-base);line-height:1.6}
  .alert-toggle-list{display:flex;flex-direction:column;gap:var(--space-xs);margin-bottom:var(--space-xl)}
  .alert-toggle-item{display:flex;align-items:center;gap:var(--space-base);padding:var(--space-base);background:var(--color-surface-elevated);border-radius:var(--radius-lg);transition:box-shadow var(--transition-fast)}
  .alert-toggle-item:hover{box-shadow:var(--shadow-sm)}
  .alert-toggle-icon{width:44px;height:44px;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:22px}
  .alert-toggle-label{flex:1;font-size:var(--text-base);font-weight:500;color:var(--color-text)}
  .alert-section-title{font-size:var(--text-sm);font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-tertiary);margin-bottom:var(--space-sm);margin-top:var(--space-lg)}
  .alert-vib-chips{display:flex;gap:var(--space-sm);margin-bottom:var(--space-xl)}
  .alert-vib-chip{flex:1;text-align:center;padding:var(--space-sm) var(--space-base);border-radius:var(--radius-full);border:2px solid var(--color-border);background:transparent;cursor:pointer;font-size:var(--text-sm);font-weight:500;color:var(--color-text-secondary);transition:all var(--transition-fast);min-height:var(--touch-min);display:flex;align-items:center;justify-content:center}
  .alert-vib-chip.active{border-color:var(--color-primary);background:var(--color-primary-light);color:var(--color-primary);font-weight:600}
  .alert-btns{display:flex;flex-direction:column;gap:var(--space-sm)}
</style>
<div class="alert-setup-wrap animate-fade-in">
  <p class="alert-setup-desc">Enable alerts for sounds you want to be notified about</p>
  <div class="alert-toggle-list" id="alertToggleList"></div>

  <p class="alert-section-title">Vibration Intensity</p>
  <div class="alert-vib-chips" id="alertVibChips">
    <button class="alert-vib-chip" data-vib="light">Light</button>
    <button class="alert-vib-chip" data-vib="medium">Medium</button>
    <button class="alert-vib-chip" data-vib="strong">Strong</button>
  </div>

  <div class="alert-btns">
    <button class="btn btn-secondary btn-block" id="alertTestBtn">
      <span class="material-symbols-rounded">notifications_active</span> Test Alert
    </button>
    <button class="btn btn-ghost btn-block" id="alertHistoryBtn">
      <span class="material-symbols-rounded">history</span> Alert History
    </button>
  </div>
</div>`;
    },

    onShow() {
      const listEl = document.getElementById('alertToggleList');
      const settings = SB.Storage.getAlertSettings() || {};
      const appSettings = SB.Storage.getSettings() || {};
      const currentVib = appSettings.vibrationIntensity || 'medium';

      /* ---- render toggles ---- */
      listEl.innerHTML = ALERT_ORDER.map(key => {
        const a = ALERT_TYPES[key];
        const checked = settings[key] ? 'checked' : '';
        return `
<div class="alert-toggle-item">
  <div class="alert-toggle-icon" style="background:${a.color}">
    <span class="material-symbols-rounded">${a.icon}</span>
  </div>
  <span class="alert-toggle-label">${a.label}</span>
  <label class="toggle">
    <input type="checkbox" class="toggle-input" data-alert-key="${key}" ${checked} />
    <span class="toggle-slider"></span>
  </label>
</div>`;
      }).join('');

      /* bind toggles */
      listEl.addEventListener('change', (e) => {
        const input = e.target.closest('.toggle-input');
        if (!input) return;
        const key = input.getAttribute('data-alert-key');
        const current = SB.Storage.getAlertSettings() || {};
        current[key] = input.checked;
        SB.Storage.setAlertSettings(current);
      });

      /* ---- vibration chips ---- */
      const vibChips = document.getElementById('alertVibChips');
      vibChips.querySelectorAll('.alert-vib-chip').forEach(chip => {
        if (chip.getAttribute('data-vib') === currentVib) chip.classList.add('active');
      });

      vibChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.alert-vib-chip');
        if (!chip) return;
        vibChips.querySelectorAll('.alert-vib-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.getAttribute('data-vib');
        SB.Storage.updateSettings({ vibrationIntensity: val });

        /* tactile preview */
        const patterns = { light: [80], medium: [150, 50, 150], strong: [200, 100, 200, 100, 400] };
        SB.vibrate(patterns[val] || [100]);
      });

      /* ---- test alert ---- */
      document.getElementById('alertTestBtn').addEventListener('click', () => {
        const currentSettings = SB.Storage.getAlertSettings() || {};
        const enabledKeys = ALERT_ORDER.filter(key => currentSettings[key]);
        if (enabledKeys.length === 0) {
          SB.showToast('Enable at least one alert to test', 'warning');
          return;
        }
        const randomKey = enabledKeys[Math.floor(Math.random() * enabledKeys.length)];
        const alertInfo = ALERT_TYPES[randomKey];
        SB.navigate('screen-alert-active', {
          type: randomKey,
          label: alertInfo.label + ' Detected',
          icon: alertInfo.icon
        });
      });

      /* ---- history ---- */
      document.getElementById('alertHistoryBtn').addEventListener('click', () => {
        SB.navigate('screen-alert-history');
      });
    }
  });

  /* ==========================================================
     Screen 15 — Alert Active (Full-screen)
     ========================================================== */
  SB.registerScreen('screen-alert-active', {
    title: '',
    showHeader: false,
    showNav: false,
    showBack: false,

    html(params) {
      const p = params || {};
      const icon = p.icon || 'notifications';
      const label = (p.label || 'Sound Detected').toUpperCase();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
<style>
  .alert-active-screen{position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--color-bg);animation:alertBorderPulse 1.4s ease-in-out infinite;padding:var(--space-xl)}
  @keyframes alertBorderPulse{
    0%,100%{box-shadow:inset 0 0 0 6px rgba(239,68,68,.7)}
    50%{box-shadow:inset 0 0 0 6px rgba(239,68,68,.15)}
  }
  .alert-active-screen::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(239,68,68,.06) 0%,transparent 70%);animation:alertOverlayPulse 2s ease-in-out infinite;pointer-events:none}
  @keyframes alertOverlayPulse{0%,100%{opacity:1}50%{opacity:.3}}
  .alert-icon-xl{width:96px;height:96px;border-radius:var(--radius-full);background:var(--gradient-alert);display:flex;align-items:center;justify-content:center;color:#fff;font-size:48px;box-shadow:0 0 40px rgba(239,68,68,.35);animation:alertIconBounce .6s var(--ease-spring)}
  @keyframes alertIconBounce{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  .alert-label{font-size:var(--text-3xl);font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-align:center;margin-top:var(--space-xl);color:var(--color-text);animation:alertFadeUp .5s .2s both}
  .alert-time{font-size:var(--text-lg);color:var(--color-text-secondary);margin-top:var(--space-sm);animation:alertFadeUp .5s .35s both}
  .alert-sub{font-size:var(--text-sm);color:var(--color-text-tertiary);margin-top:var(--space-xs);animation:alertFadeUp .5s .45s both}
  @keyframes alertFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .alert-dismiss-area{margin-top:auto;width:100%;max-width:360px;animation:alertFadeUp .5s .55s both}
</style>
<div class="alert-active-screen" id="alertActiveScreen">
  <div class="alert-icon-xl">
    <span class="material-symbols-rounded">${icon}</span>
  </div>
  <p class="alert-label">${label}</p>
  <p class="alert-time">${timeStr}</p>
  <p class="alert-sub">Sound identified at ${timeStr}</p>
  <div class="alert-dismiss-area">
    <button class="btn btn-primary btn-block btn-lg" id="alertDismissBtn">
      <span class="material-symbols-rounded">close</span> Dismiss
    </button>
  </div>
</div>`;
    },

    onShow(params) {
      const p = params || {};

      /* vibration */
      SB.vibrate([200, 100, 200, 100, 400]);

      /* save to history */
      SB.Storage.addAlertEvent({
        type: p.type || 'unknown',
        label: p.label || 'Sound Detected',
        icon: p.icon || 'notifications',
        time: new Date().toISOString()
      });

      /* dismiss */
      const dismissBtn = document.getElementById('alertDismissBtn');
      dismissBtn && dismissBtn.addEventListener('click', () => SB.back());

      /* auto-dismiss after 30 s */
      const autoDismiss = setTimeout(() => SB.back(), 30000);
      this._autoDismiss = autoDismiss;
    },

    onHide() {
      if (this._autoDismiss) clearTimeout(this._autoDismiss);
    }
  });

  /* ==========================================================
     Screen 16 — Alert History
     ========================================================== */
  SB.registerScreen('screen-alert-history', {
    title: 'Alert History',
    showHeader: true,
    showBack: true,
    showNav: true,

    html() {
      return `
<style>
  .alert-hist-wrap{padding:var(--space-base) var(--screen-padding);padding-bottom:var(--space-3xl)}
  .alert-hist-filters{display:flex;gap:var(--space-xs);overflow-x:auto;padding-bottom:var(--space-base);-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .alert-hist-filters::-webkit-scrollbar{display:none}
  .alert-filter-chip{white-space:nowrap;padding:var(--space-xs) var(--space-base);border-radius:var(--radius-full);border:1.5px solid var(--color-border);background:transparent;cursor:pointer;font-size:var(--text-sm);color:var(--color-text-secondary);transition:all var(--transition-fast);min-height:var(--touch-min);display:flex;align-items:center;justify-content:center}
  .alert-filter-chip.active{border-color:var(--color-primary);background:var(--color-primary-light);color:var(--color-primary);font-weight:600}
  .alert-hist-timeline{display:flex;flex-direction:column;gap:var(--space-xs);margin-top:var(--space-sm)}
  .alert-hist-item{display:flex;align-items:center;gap:var(--space-base);padding:var(--space-base);background:var(--color-surface-elevated);border-radius:var(--radius-lg)}
  .alert-hist-item-icon{width:42px;height:42px;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:20px}
  .alert-hist-item-content{flex:1;min-width:0}
  .alert-hist-item-label{font-size:var(--text-base);font-weight:500;color:var(--color-text)}
  .alert-hist-item-time{font-size:var(--text-xs);color:var(--color-text-tertiary);margin-top:2px}
  .alert-clear-wrap{margin-top:var(--space-xl);text-align:center}
</style>
<div class="alert-hist-wrap animate-fade-in">
  <div class="alert-hist-filters" id="alertHistFilters">
    <button class="alert-filter-chip active" data-filter="all">All</button>
    <button class="alert-filter-chip" data-filter="doorbell">Doorbell</button>
    <button class="alert-filter-chip" data-filter="alarm">Alarm</button>
    <button class="alert-filter-chip" data-filter="babyCry">Baby</button>
    <button class="alert-filter-chip" data-filter="siren">Emergency</button>
  </div>
  <div class="alert-hist-timeline" id="alertHistTimeline"></div>
  <div class="empty-state hidden" id="alertHistEmpty" style="padding:var(--space-3xl) 0;text-align:center">
    <span class="material-symbols-rounded" style="font-size:56px;color:var(--color-text-tertiary)">notifications_off</span>
    <p class="text-lg font-medium" style="margin-top:var(--space-base)">No alerts detected yet</p>
    <p class="text-sm text-tertiary">When sounds are detected, they'll appear here</p>
  </div>
  <div class="alert-clear-wrap" id="alertClearWrap">
    <button class="btn btn-ghost text-alert" id="alertClearBtn">
      <span class="material-symbols-rounded">delete_sweep</span> Clear History
    </button>
  </div>
</div>`;
    },

    onShow() {
      const timeline = document.getElementById('alertHistTimeline');
      const empty = document.getElementById('alertHistEmpty');
      const clearWrap = document.getElementById('alertClearWrap');
      const filtersEl = document.getElementById('alertHistFilters');
      let activeFilter = 'all';

      function colorFor(type) {
        const a = ALERT_TYPES[type];
        return a ? a.color : 'var(--color-text-tertiary)';
      }

      function renderTimeline() {
        const history = SB.Storage.getAlertHistory() || [];
        const filtered = activeFilter === 'all' ? history : history.filter(h => h.type === activeFilter);

        if (filtered.length === 0) {
          timeline.innerHTML = '';
          empty.classList.remove('hidden');
          clearWrap.style.display = 'none';
          return;
        }
        empty.classList.add('hidden');
        clearWrap.style.display = '';

        timeline.innerHTML = filtered.map(h => {
          const info = ALERT_TYPES[h.type] || { icon: 'notifications', label: h.label || 'Sound', color: 'var(--color-text-tertiary)' };
          const time = h.time ? SB.formatTime(h.time) : '';
          const date = h.time ? SB.formatDate(h.time) : '';
          return `
<div class="alert-hist-item">
  <div class="alert-hist-item-icon" style="background:${info.color}">
    <span class="material-symbols-rounded">${h.icon || info.icon}</span>
  </div>
  <div class="alert-hist-item-content">
    <div class="alert-hist-item-label">${h.label || info.label}</div>
    <div class="alert-hist-item-time">${time}${date ? ' · ' + date : ''}</div>
  </div>
</div>`;
        }).join('');
      }

      renderTimeline();

      /* filter chips */
      filtersEl.addEventListener('click', (e) => {
        const chip = e.target.closest('.alert-filter-chip');
        if (!chip) return;
        filtersEl.querySelectorAll('.alert-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter');
        renderTimeline();
      });

      /* clear */
      document.getElementById('alertClearBtn').addEventListener('click', () => {
        SB.showModal(`
          <div style="padding:var(--space-xl);text-align:center">
            <span class="material-symbols-rounded" style="font-size:48px;color:var(--color-alert)">delete_sweep</span>
            <p class="text-lg font-medium" style="margin:var(--space-base) 0">Clear all alert history?</p>
            <p class="text-sm text-secondary" style="margin-bottom:var(--space-lg)">This cannot be undone.</p>
            <div style="display:flex;gap:var(--space-sm)">
              <button class="btn btn-secondary" style="flex:1" onclick="SB.hideModal()">Cancel</button>
              <button class="btn btn-alert" style="flex:1" id="alertConfirmClear">Clear</button>
            </div>
          </div>
        `);
        setTimeout(() => {
          const confirm = document.getElementById('alertConfirmClear');
          confirm && confirm.addEventListener('click', () => {
            /* clear history by overwriting with empty array */
            const hist = SB.Storage.getAlertHistory() || [];
            hist.forEach(h => { try { /* best effort */ } catch (_) {} });
            /* use storage key directly if possible, otherwise delete each */
            try { localStorage.setItem('sb_alert_history', '[]'); } catch (_) {}
            SB.hideModal();
            SB.showToast('History cleared', 'success');
            renderTimeline();
          });
        }, 50);
      });
    }
  });

})();
