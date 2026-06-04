/* ============================================================
   SoundBridge — Live Caption Module (Screens 10–13)
   Uses Web Speech API for real-time speech-to-text
   ============================================================ */
(function () {
  'use strict';

  /* ---- module-level state ---- */
  let recognition = null;
  let isRecognizing = false;
  let isPaused = false;
  let timerInterval = null;
  let elapsedSeconds = 0;
  let transcriptParts = [];      // final transcript segments
  let interimText = '';
  let animFrameId = null;

  /* ---- helpers ---- */
  function fmtTimer(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function fullTranscript() {
    return transcriptParts.join(' ').trim();
  }

  function stopRecognitionSafe() {
    try { if (recognition) { isRecognizing = false; recognition.abort(); } } catch (_) { /* */ }
  }

  function clearTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  /* ==========================================================
     Screen 10 — Caption Ready
     ========================================================== */
  SB.registerScreen('screen-caption-ready', {
    title: 'Live Caption',
    showHeader: true,
    showBack: true,
    showNav: true,

    html() {
      return `
<style>
  /* ---- Caption Ready ---- */
  .caption-ready-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - var(--header-height) - var(--nav-height) - 32px);padding:var(--space-xl) var(--screen-padding);text-align:center;gap:var(--space-lg)}
  .caption-mic-btn{position:relative;width:96px;height:96px;border-radius:var(--radius-full);background:var(--gradient-primary);color:#fff;border:none;font-size:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:1;box-shadow:var(--shadow-lg);transition:transform var(--transition-base) var(--ease-spring)}
  .caption-mic-btn:active{transform:scale(.92)}
  .caption-mic-btn::before{content:'';position:absolute;inset:-14px;border-radius:var(--radius-full);border:3px solid var(--color-primary);opacity:.45;animation:captionPulseRing 2s var(--ease-out) infinite}
  .caption-mic-btn::after{content:'';position:absolute;inset:-26px;border-radius:var(--radius-full);border:2px solid var(--color-primary);opacity:.2;animation:captionPulseRing 2s .5s var(--ease-out) infinite}
  @keyframes captionPulseRing{0%{transform:scale(.85);opacity:.5}100%{transform:scale(1.25);opacity:0}}
  .caption-ready-timer{font-variant-numeric:tabular-nums}
  .caption-ready-footer{width:100%;max-width:340px;margin-top:auto;padding-bottom:var(--space-lg)}
</style>
<div class="caption-ready-wrap animate-fade-in">
  <button class="caption-mic-btn" id="captionStartBtn" aria-label="Start listening">
    <span class="material-symbols-rounded">mic</span>
  </button>
  <p class="text-lg font-medium mb-0">Tap to Start Listening</p>
  <p class="caption-ready-timer text-secondary text-sm">00:00</p>
  <p class="text-sm text-tertiary" style="max-width:260px">Captions will appear as text in real-time</p>
  <div class="caption-ready-footer">
    <button class="btn btn-ghost btn-block" id="captionHistoryBtn">
      <span class="material-symbols-rounded">history</span> View History
    </button>
  </div>
</div>`;
    },

    onShow() {
      const startBtn = document.getElementById('captionStartBtn');
      const histBtn = document.getElementById('captionHistoryBtn');
      if (startBtn) startBtn.addEventListener('click', () => SB.navigate('screen-caption-active'));
      if (histBtn) histBtn.addEventListener('click', () => SB.navigate('screen-caption-history'));
    }
  });

  /* ==========================================================
     Screen 11 — Caption Active
     ========================================================== */
  SB.registerScreen('screen-caption-active', {
    title: 'Live Caption',
    showHeader: true,
    showBack: true,
    showNav: false,

    headerActions() {
      return `<button class="btn btn-ghost btn-icon" id="captionFontToggle" aria-label="Font size"><span class="material-symbols-rounded">text_fields</span></button>`;
    },

    html() {
      const settings = SB.Storage.getSettings();
      const fontSize = (settings && settings.captionFontSize) || 20;
      return `
<style>
  .caption-active-wrap{display:flex;flex-direction:column;height:calc(100vh - var(--header-height));overflow:hidden}
  .caption-status{display:flex;align-items:center;gap:var(--space-xs);padding:var(--space-sm) var(--screen-padding);font-size:var(--text-sm)}
  .caption-status-dot{width:10px;height:10px;border-radius:var(--radius-full);background:var(--color-alert);flex-shrink:0}
  .caption-status-dot.active{animation:captionDotPulse 1.2s ease-in-out infinite}
  .caption-status-dot.paused{background:var(--color-warning);animation:none}
  @keyframes captionDotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
  .caption-text-area{flex:1;overflow-y:auto;padding:var(--space-base) var(--screen-padding);margin:0 var(--screen-padding);background:var(--color-surface-elevated);border-radius:var(--radius-xl);line-height:1.8;-webkit-overflow-scrolling:touch}
  .caption-text-area .placeholder{color:var(--color-text-tertiary);font-style:italic}
  .caption-text-area .interim{color:var(--color-text-tertiary);opacity:.6}
  .caption-text-area .final{color:var(--color-text)}
  .caption-timer-bar{text-align:center;padding:var(--space-xs) 0;font-variant-numeric:tabular-nums;color:var(--color-text-secondary);font-size:var(--text-sm)}
  .caption-actions{display:flex;align-items:center;justify-content:center;gap:var(--space-sm);padding:var(--space-sm) var(--screen-padding) var(--space-lg);background:var(--color-surface);border-top:1px solid var(--color-divider);flex-shrink:0}
  .caption-actions .btn{min-height:var(--touch-min)}
  .caption-font-popup{position:absolute;top:calc(var(--header-height) + 4px);right:var(--screen-padding);background:var(--color-surface-elevated);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);padding:var(--space-sm);display:none;z-index:100;animation:captionPopIn .2s var(--ease-out)}
  .caption-font-popup.show{display:flex;gap:var(--space-xs);align-items:center}
  @keyframes captionPopIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  .caption-font-popup .size-label{min-width:38px;text-align:center;font-variant-numeric:tabular-nums;font-weight:600;font-size:var(--text-sm)}
</style>
<div class="caption-active-wrap">
  <div class="caption-status" id="captionStatus">
    <span class="caption-status-dot active" id="captionDot"></span>
    <span id="captionStatusText">Listening...</span>
  </div>
  <div class="caption-text-area" id="captionTextArea" style="font-size:${fontSize}px">
    <span class="placeholder" id="captionPlaceholder">Start speaking… your words will appear here</span>
    <span class="final" id="captionFinal"></span><span class="interim" id="captionInterim"></span>
  </div>
  <div class="caption-timer-bar" id="captionTimerBar">00:00</div>
  <div class="caption-actions">
    <button class="btn btn-ghost btn-icon" id="captionFontDown" aria-label="Decrease font"><span class="material-symbols-rounded">text_decrease</span></button>
    <button class="btn btn-secondary" id="captionPauseBtn" style="min-width:110px">
      <span class="material-symbols-rounded" id="captionPauseIcon">pause</span>
      <span id="captionPauseLabel">Pause</span>
    </button>
    <button class="btn btn-alert" id="captionStopBtn" style="min-width:110px">
      <span class="material-symbols-rounded">stop</span> Stop
    </button>
    <button class="btn btn-ghost btn-icon" id="captionFontUp" aria-label="Increase font"><span class="material-symbols-rounded">text_increase</span></button>
  </div>
  <div class="caption-font-popup" id="captionFontPopup">
    <button class="btn btn-ghost btn-sm btn-icon" id="captionPopFontDown"><span class="material-symbols-rounded">remove</span></button>
    <span class="size-label" id="captionFontSizeLabel">${fontSize}px</span>
    <button class="btn btn-ghost btn-sm btn-icon" id="captionPopFontUp"><span class="material-symbols-rounded">add</span></button>
  </div>
</div>`;
    },

    onShow() {
      const textArea     = document.getElementById('captionTextArea');
      const finalEl      = document.getElementById('captionFinal');
      const interimEl    = document.getElementById('captionInterim');
      const placeholder  = document.getElementById('captionPlaceholder');
      const timerBar     = document.getElementById('captionTimerBar');
      const pauseBtn     = document.getElementById('captionPauseBtn');
      const pauseIcon    = document.getElementById('captionPauseIcon');
      const pauseLabel   = document.getElementById('captionPauseLabel');
      const stopBtn      = document.getElementById('captionStopBtn');
      const fontUpBtn    = document.getElementById('captionFontUp');
      const fontDownBtn  = document.getElementById('captionFontDown');
      const dot          = document.getElementById('captionDot');
      const statusText   = document.getElementById('captionStatusText');
      const fontToggle   = document.getElementById('captionFontToggle');
      const fontPopup    = document.getElementById('captionFontPopup');
      const popFontDown  = document.getElementById('captionPopFontDown');
      const popFontUp    = document.getElementById('captionPopFontUp');
      const fontLabel    = document.getElementById('captionFontSizeLabel');

      /* reset state */
      transcriptParts = [];
      interimText = '';
      elapsedSeconds = 0;
      isPaused = false;
      isRecognizing = false;

      let currentFontSize = parseInt(textArea.style.fontSize) || 20;
      let manualStop = false;

      /* ---- timer ---- */
      timerBar.textContent = '00:00';
      timerInterval = setInterval(() => {
        if (!isPaused) {
          elapsedSeconds++;
          timerBar.textContent = fmtTimer(elapsedSeconds);
        }
      }, 1000);

      /* ---- font helpers ---- */
      function applyFontSize(delta) {
        currentFontSize = Math.max(14, Math.min(36, currentFontSize + delta));
        textArea.style.fontSize = currentFontSize + 'px';
        if (fontLabel) fontLabel.textContent = currentFontSize + 'px';
        SB.Storage.updateSettings({ captionFontSize: currentFontSize });
      }

      fontUpBtn  && fontUpBtn.addEventListener('click',  () => applyFontSize(2));
      fontDownBtn && fontDownBtn.addEventListener('click', () => applyFontSize(-2));
      popFontUp  && popFontUp.addEventListener('click',  () => applyFontSize(2));
      popFontDown && popFontDown.addEventListener('click', () => applyFontSize(-2));

      if (fontToggle && fontPopup) {
        fontToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          fontPopup.classList.toggle('show');
        });
        document.addEventListener('click', function _closePop(e) {
          if (!fontPopup.contains(e.target)) fontPopup.classList.remove('show');
        });
      }

      /* ---- Speech Recognition ---- */
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        SB.showToast('Speech recognition not supported in this browser', 'warning');
        if (placeholder) {
          placeholder.innerHTML = '⚠️ Speech recognition is not available.<br><br>' +
            '<span style="font-size:14px;font-style:normal;color:var(--color-text-secondary);">' +
            '• Use <b>Google Chrome</b> or <b>Microsoft Edge</b><br>' +
            '• Make sure you are on <b>HTTPS</b> (not http://)<br>' +
            '• Allow microphone access when prompted</span>';
          placeholder.style.fontStyle = 'normal';
        }
        if (dot) { dot.classList.remove('active'); dot.style.background = 'var(--color-warning)'; }
        if (statusText) statusText.textContent = 'Not supported';
        return;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = function() {
        isRecognizing = true;
        if (dot) { dot.classList.add('active'); dot.classList.remove('paused'); }
        if (statusText) statusText.textContent = 'Listening...';
      };

      recognition.onresult = function (event) {
        let interimPart = '';
        let finalPart = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          var t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPart += t + ' ';
          } else {
            interimPart += t;
          }
        }
        if (finalPart) {
          transcriptParts.push(finalPart.trim());
        }
        interimText = interimPart;

        /* render immediately */
        if (placeholder) placeholder.style.display = 'none';
        if (finalEl) finalEl.textContent = fullTranscript() + ' ';
        if (interimEl) interimEl.textContent = interimText;
        if (textArea) textArea.scrollTop = textArea.scrollHeight;
      };

      recognition.onerror = function (event) {
        if (event.error === 'not-allowed') {
          SB.showToast('Microphone access denied — please allow mic in browser settings', 'error');
          if (statusText) statusText.textContent = 'Mic blocked';
          if (dot) { dot.classList.remove('active'); dot.style.background = 'var(--color-alert)'; }
        } else if (event.error === 'network') {
          SB.showToast('Network error — speech recognition needs internet', 'warning');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          SB.showToast('Recognition error: ' + event.error, 'error');
        }
      };

      recognition.onend = function () {
        isRecognizing = false;
        /* Quick auto-restart with tiny buffer so browser can release mic */
        if (!manualStop && !isPaused) {
          setTimeout(function() {
            if (manualStop || isPaused) return;
            try {
              recognition.start();
            } catch (e) {
              /* If start fails, create a fresh instance and retry */
              try {
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                recognition.maxAlternatives = 1;
                recognition.onstart = handleStart;
                recognition.onresult = handleResult;
                recognition.onerror = handleError;
                recognition.onend = handleEnd;
                recognition.start();
              } catch (_) { /* give up */ }
            }
          }, 50);
        }
      };
      /* Store handlers so we can re-bind on fresh instance */
      var handleStart = recognition.onstart;
      var handleResult = recognition.onresult;
      var handleError = recognition.onerror;
      var handleEnd = recognition.onend;

      /* Start immediately — no getUserMedia pre-check overhead */
      try {
        recognition.start();
      } catch (e) {
        SB.showToast('Could not start: ' + e.message, 'error');
      }

      /* ---- Pause / Resume ---- */
      pauseBtn && pauseBtn.addEventListener('click', () => {
        if (isPaused) {
          /* resume */
          isPaused = false;
          try { recognition.start(); } catch (_) { /* */ }
          pauseIcon.textContent = 'pause';
          pauseLabel.textContent = 'Pause';
          dot.classList.remove('paused');
          dot.classList.add('active');
          statusText.textContent = 'Listening...';
        } else {
          /* pause */
          isPaused = true;
          stopRecognitionSafe();
          pauseIcon.textContent = 'play_arrow';
          pauseLabel.textContent = 'Resume';
          dot.classList.remove('active');
          dot.classList.add('paused');
          statusText.textContent = 'Paused';
        }
      });

      /* ---- Stop ---- */
      stopBtn && stopBtn.addEventListener('click', () => {
        manualStop = true;
        stopRecognitionSafe();
        clearTimer();

        const text = fullTranscript();
        if (text.length > 0) {
          SB.Storage.addTranscript({
            text: text,
            duration: elapsedSeconds,
            date: new Date().toISOString(),
            preview: text.substring(0, 100)
          });
          SB.showToast('Transcript saved!', 'success');
        }
        SB.back();
      });
    },

    onHide() {
      stopRecognitionSafe();
      clearTimer();
      recognition = null;
    }
  });

  /* ==========================================================
     Screen 12 — Caption History
     ========================================================== */
  SB.registerScreen('screen-caption-history', {
    title: 'History',
    showHeader: true,
    showBack: true,
    showNav: true,

    html() {
      return `
<style>
  .caption-history-wrap{padding:var(--space-base) var(--screen-padding)}
  .caption-search{display:flex;align-items:center;gap:var(--space-sm);background:var(--color-surface-elevated);border-radius:var(--radius-lg);padding:0 var(--space-base);margin-bottom:var(--space-lg);border:1px solid var(--color-border);transition:border-color var(--transition-fast)}
  .caption-search:focus-within{border-color:var(--color-primary)}
  .caption-search input{flex:1;border:none;background:transparent;height:var(--touch-min);font-size:var(--text-base);color:var(--color-text);outline:none}
  .caption-search input::placeholder{color:var(--color-text-tertiary)}
  .caption-search .material-symbols-rounded{color:var(--color-text-tertiary);font-size:22px}
  .caption-hist-list{display:flex;flex-direction:column;gap:var(--space-xs)}
  .caption-hist-item{display:flex;align-items:center;gap:var(--space-base);padding:var(--space-base);background:var(--color-surface-elevated);border-radius:var(--radius-lg);cursor:pointer;transition:transform var(--transition-fast),box-shadow var(--transition-fast)}
  .caption-hist-item:active{transform:scale(.98)}
  .caption-hist-icon{width:44px;height:44px;border-radius:var(--radius-full);background:var(--color-primary-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--color-primary)}
  .caption-hist-content{flex:1;min-width:0}
  .caption-hist-preview{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--text-base);color:var(--color-text)}
  .caption-hist-meta{font-size:var(--text-xs);color:var(--color-text-tertiary);margin-top:2px;display:flex;gap:var(--space-sm)}
  .caption-hist-action{color:var(--color-text-tertiary);flex-shrink:0}
  .caption-hist-delete{background:none;border:none;color:var(--color-alert);padding:var(--space-xs);border-radius:var(--radius-full);cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.6;transition:opacity var(--transition-fast)}
  .caption-hist-delete:hover,.caption-hist-delete:active{opacity:1}
</style>
<div class="caption-history-wrap animate-fade-in">
  <div class="caption-search">
    <span class="material-symbols-rounded">search</span>
    <input type="text" id="captionSearchInput" placeholder="Search transcripts…" />
  </div>
  <div class="caption-hist-list" id="captionHistList"></div>
  <div class="empty-state hidden" id="captionHistEmpty" style="padding:var(--space-3xl) 0;text-align:center">
    <span class="material-symbols-rounded" style="font-size:56px;color:var(--color-text-tertiary)">subtitles_off</span>
    <p class="text-lg font-medium" style="margin-top:var(--space-base)">No transcripts yet</p>
    <p class="text-sm text-tertiary">Saved captions will appear here</p>
  </div>
</div>`;
    },

    onShow() {
      const list = document.getElementById('captionHistList');
      const empty = document.getElementById('captionHistEmpty');
      const searchInput = document.getElementById('captionSearchInput');

      function renderList(filter) {
        const transcripts = SB.Storage.getTranscripts() || [];
        const filtered = filter
          ? transcripts.filter(t => (t.text || t.preview || '').toLowerCase().includes(filter.toLowerCase()))
          : transcripts;

        if (filtered.length === 0) {
          list.innerHTML = '';
          empty.classList.remove('hidden');
          return;
        }
        empty.classList.add('hidden');

        list.innerHTML = filtered.map(t => {
          const preview = (t.preview || t.text || '').substring(0, 80);
          const date = t.date ? SB.formatDate(t.date) : '';
          const dur = t.duration ? SB.formatDuration(t.duration) : '';
          return `
<div class="caption-hist-item" data-id="${t.id}">
  <div class="caption-hist-icon"><span class="material-symbols-rounded">description</span></div>
  <div class="caption-hist-content">
    <div class="caption-hist-preview">${preview || 'Empty transcript'}</div>
    <div class="caption-hist-meta"><span>${date}</span>${dur ? '<span>· ' + dur + '</span>' : ''}</div>
  </div>
  <button class="caption-hist-delete" data-delete="${t.id}" aria-label="Delete transcript"><span class="material-symbols-rounded">delete</span></button>
  <span class="caption-hist-action"><span class="material-symbols-rounded">chevron_right</span></span>
</div>`;
        }).join('');
      }

      renderList('');

      /* search */
      searchInput && searchInput.addEventListener('input', (e) => renderList(e.target.value));

      /* delegation */
      list.addEventListener('click', (e) => {
        /* delete */
        const delBtn = e.target.closest('[data-delete]');
        if (delBtn) {
          e.stopPropagation();
          const id = delBtn.getAttribute('data-delete');
          SB.Storage.deleteTranscript(id);
          SB.showToast('Transcript deleted', 'info');
          renderList(searchInput.value);
          return;
        }
        /* open detail */
        const item = e.target.closest('.caption-hist-item');
        if (item) {
          SB.navigate('screen-caption-detail', { id: item.getAttribute('data-id') });
        }
      });
    }
  });

  /* ==========================================================
     Screen 13 — Caption Detail
     ========================================================== */
  SB.registerScreen('screen-caption-detail', {
    title: 'Transcript',
    showHeader: true,
    showBack: true,
    showNav: false,

    headerActions() {
      return `
<button class="btn btn-ghost btn-icon" id="captionDetailShare" aria-label="Share"><span class="material-symbols-rounded">share</span></button>
<button class="btn btn-ghost btn-icon" id="captionDetailDelete" aria-label="Delete"><span class="material-symbols-rounded">delete</span></button>`;
    },

    html() {
      return `
<style>
  .caption-detail-wrap{display:flex;flex-direction:column;height:calc(100vh - var(--header-height))}
  .caption-detail-chips{display:flex;gap:var(--space-sm);padding:var(--space-base) var(--screen-padding);flex-wrap:wrap}
  .caption-detail-chips .chip{display:inline-flex;align-items:center;gap:var(--space-2xs);padding:var(--space-xs) var(--space-base);background:var(--color-surface-elevated);border-radius:var(--radius-full);font-size:var(--text-sm);color:var(--color-text-secondary)}
  .caption-detail-body{flex:1;overflow-y:auto;padding:var(--space-base) var(--screen-padding);line-height:1.8;font-size:var(--text-lg);color:var(--color-text);-webkit-overflow-scrolling:touch}
  .caption-detail-actions{display:flex;gap:var(--space-sm);padding:var(--space-base) var(--screen-padding) var(--space-xl);border-top:1px solid var(--color-divider);flex-shrink:0}
  .caption-detail-actions .btn{flex:1;min-height:var(--touch-min)}
</style>
<div class="caption-detail-wrap animate-fade-in">
  <div class="caption-detail-chips" id="captionDetailChips"></div>
  <div class="caption-detail-body" id="captionDetailBody"></div>
  <div class="caption-detail-actions">
    <button class="btn btn-secondary" id="captionCopyBtn"><span class="material-symbols-rounded">content_copy</span> Copy</button>
    <button class="btn btn-primary" id="captionShareBtn"><span class="material-symbols-rounded">share</span> Share</button>
    <button class="btn btn-ghost text-alert" id="captionDeleteBtn"><span class="material-symbols-rounded">delete</span> Delete</button>
  </div>
</div>`;
    },

    onShow(params) {
      if (!params || !params.id) { SB.back(); return; }

      const transcripts = SB.Storage.getTranscripts() || [];
      const t = transcripts.find(tr => tr.id === params.id);
      if (!t) { SB.showToast('Transcript not found', 'error'); SB.back(); return; }

      const chips = document.getElementById('captionDetailChips');
      const body = document.getElementById('captionDetailBody');

      chips.innerHTML = `
        <span class="chip"><span class="material-symbols-rounded" style="font-size:16px">calendar_today</span> ${t.date ? SB.formatDate(t.date) : 'Unknown date'}</span>
        ${t.duration ? '<span class="chip"><span class="material-symbols-rounded" style="font-size:16px">timer</span> ' + SB.formatDuration(t.duration) + '</span>' : ''}
      `;
      body.textContent = t.text || 'No content';

      /* copy */
      const copyBtn = document.getElementById('captionCopyBtn');
      copyBtn && copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(t.text || '').then(() => SB.showToast('Copied to clipboard', 'success')).catch(() => SB.showToast('Failed to copy', 'error'));
      });

      /* share */
      function doShare() {
        if (navigator.share) {
          navigator.share({ title: 'Transcript', text: t.text || '' }).catch(() => {});
        } else {
          navigator.clipboard.writeText(t.text || '').then(() => SB.showToast('Copied to clipboard (share unavailable)', 'info')).catch(() => {});
        }
      }
      const shareBtn = document.getElementById('captionShareBtn');
      const shareHdr = document.getElementById('captionDetailShare');
      shareBtn && shareBtn.addEventListener('click', doShare);
      shareHdr && shareHdr.addEventListener('click', doShare);

      /* delete */
      function doDelete() {
        SB.showModal(`
          <div style="padding:var(--space-xl);text-align:center">
            <span class="material-symbols-rounded" style="font-size:48px;color:var(--color-alert)">delete_forever</span>
            <p class="text-lg font-medium" style="margin:var(--space-base) 0">Delete this transcript?</p>
            <p class="text-sm text-secondary" style="margin-bottom:var(--space-lg)">This action cannot be undone.</p>
            <div style="display:flex;gap:var(--space-sm)">
              <button class="btn btn-secondary" style="flex:1" onclick="SB.hideModal()">Cancel</button>
              <button class="btn btn-alert" style="flex:1" id="captionConfirmDelete">Delete</button>
            </div>
          </div>
        `);
        setTimeout(() => {
          const confirm = document.getElementById('captionConfirmDelete');
          confirm && confirm.addEventListener('click', () => {
            SB.Storage.deleteTranscript(params.id);
            SB.hideModal();
            SB.showToast('Transcript deleted', 'success');
            SB.back();
          });
        }, 50);
      }
      const deleteBtn = document.getElementById('captionDeleteBtn');
      const deleteHdr = document.getElementById('captionDetailDelete');
      deleteBtn && deleteBtn.addEventListener('click', doDelete);
      deleteHdr && deleteHdr.addEventListener('click', doDelete);
    }
  });

})();
