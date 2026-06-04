/* ===================================================
   SoundBridge — Application Core
   SPA Router · Screen Manager · Toast · Modal · Init
   =================================================== */
(function() {
  'use strict';

  window.SB = window.SB || {};

  /* ── Internal State ── */
  const _screens = {};
  const _elements = {};
  const _history = [];
  let _current = null;
  let _transitioning = false;

  /* ── Utilities ── */
  SB.generateId = () => '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36).slice(-4);

  SB.formatTime = (d) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  SB.formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000 && now.getDate() === date.getDate()) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  SB.formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* ── Screen Registration ── */
  SB.registerScreen = function(id, config) {
    _screens[id] = config;
  };

  /* ── Navigate ── */
  SB.navigate = function(screenId, params, _isBack) {
    if (_transitioning) return;
    const config = _screens[screenId];
    if (!config) {
      console.error('[SB] Screen not found:', screenId);
      return;
    }

    _transitioning = true;
    const container = document.getElementById('screen-container');

    /* Hide current screen */
    if (_current && _elements[_current]) {
      const curConfig = _screens[_current];
      if (curConfig && curConfig.onHide) {
        try { curConfig.onHide(); } catch(e) { console.error('[SB] onHide error:', e); }
      }
      const curEl = _elements[_current];
      curEl.classList.remove('screen-active');
      curEl.classList.add(_isBack ? 'screen-exit-right' : 'screen-exit');
      curEl.removeAttribute('id'); // Prevent ID collision with the incoming screen
      
      setTimeout(() => {
        if (curEl && curEl.parentNode) {
          curEl.parentNode.removeChild(curEl);
        }
      }, 380);
    }

    /* Push history */
    if (!_isBack && _current && _current !== screenId) {
      _history.push(_current);
      if (_history.length > 30) _history.shift();
    }

    _current = screenId;

    /* Create new screen */
    const el = document.createElement('section');
    el.id = screenId;
    el.className = 'screen ' + (_isBack ? 'screen-enter-left' : 'screen-enter');
    el.setAttribute('role', 'main');
    el.setAttribute('aria-label', config.title || screenId);

    try {
      el.innerHTML = typeof config.html === 'function' ? config.html(params) : config.html;
    } catch(e) {
      console.error('[SB] html() error for', screenId, e);
      el.innerHTML = '<div class="screen-content flex-center"><p>Error loading screen</p></div>';
    }

    container.appendChild(el);
    _elements[screenId] = el;

    /* Animate in */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('screen-enter', 'screen-enter-left');
        el.classList.add('screen-active');
        _transitioning = false;
      });
    });

    /* Update chrome */
    _updateHeader(config);
    _updateNav(config, screenId);

    /* Callback */
    if (config.onShow) {
      setTimeout(() => {
        try { config.onShow(params); } catch(e) { console.error('[SB] onShow error:', e); }
      }, 80);
    }
  };

  /* ── Back ── */
  SB.back = function() {
    if (_history.length === 0) return;
    const prev = _history.pop();
    SB.navigate(prev, null, true);
  };

  /* ── Header ── */
  function _updateHeader(config) {
    const header = document.getElementById('app-header');
    const backBtn = document.getElementById('btn-back');
    const title = document.getElementById('header-title');
    const actions = document.getElementById('header-actions');

    if (config.showHeader) {
      header.classList.remove('hidden');
      title.textContent = config.title || '';
      backBtn.classList.toggle('hidden', !config.showBack);
      actions.innerHTML = (config.headerActions ? config.headerActions() : '') || '';
    } else {
      header.classList.add('hidden');
    }
  }

  /* ── Bottom Nav ── */
  function _updateNav(config, screenId) {
    const nav = document.getElementById('bottom-nav');
    if (config.showNav) {
      nav.classList.remove('hidden');
      const navScreenMap = {
        'screen-dashboard': 'screen-dashboard',
        'screen-caption-ready': 'screen-caption-ready',
        'screen-caption-active': 'screen-caption-ready',
        'screen-caption-history': 'screen-caption-ready',
        'screen-reply-home': 'screen-reply-home',
        'screen-meter': 'screen-meter',
        'screen-meter-history': 'screen-meter',
        'screen-settings-profile': 'screen-settings-profile',
        'screen-settings-hearing': 'screen-settings-profile',
        'screen-settings-notif': 'screen-settings-profile',
        'screen-settings-access': 'screen-settings-profile',
        'screen-alert-setup': 'screen-dashboard',
        'screen-alert-history': 'screen-dashboard',
        'screen-media-home': 'screen-dashboard',
        'screen-help': 'screen-settings-profile'
      };
      const activeNav = navScreenMap[screenId] || screenId;
      nav.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === activeNav);
      });
    } else {
      nav.classList.add('hidden');
    }
  }

  /* ── Toast ── */
  SB.showToast = function(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const iconMap = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    toast.innerHTML =
      '<span class="material-symbols-rounded toast-icon">' + (iconMap[type] || 'info') + '</span>' +
      '<span class="toast-message">' + message + '</span>';

    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('toast-visible');
      });
    });

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  };

  /* ── Vibrate ── */
  SB.vibrate = function(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch(e) { /* ignore */ }
  };

  /* ── Modal ── */
  SB.showModal = function(html) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = html;
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('modal-visible');
      });
    });
  };

  SB.hideModal = function() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('modal-visible');
    setTimeout(() => overlay.classList.add('hidden'), 320);
  };

  /* ── Confirm Dialog Helper ── */
  SB.confirm = function(title, message, confirmText, onConfirm) {
    SB.showModal(
      '<div class="text-center flex flex-col gap-lg">' +
        '<h3>' + title + '</h3>' +
        '<p class="text-sm text-secondary">' + message + '</p>' +
        '<div class="flex gap-sm">' +
          '<button class="btn btn-ghost flex-1" onclick="SB.hideModal()">Cancel</button>' +
          '<button class="btn btn-alert flex-1" id="sb-modal-confirm">' + (confirmText || 'Confirm') + '</button>' +
        '</div>' +
      '</div>'
    );
    setTimeout(() => {
      const btn = document.getElementById('sb-modal-confirm');
      if (btn) {
        btn.addEventListener('click', () => {
          SB.hideModal();
          if (onConfirm) onConfirm();
        });
      }
    }, 50);
  };

  /* ── Init ── */
  SB.init = function() {
    /* Apply saved settings */
    const settings = SB.Storage.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    document.documentElement.setAttribute('data-contrast', settings.contrast || 'normal');
    document.documentElement.setAttribute('data-font-scale', settings.fontScale || 'normal');

    /* Back button */
    document.getElementById('btn-back').addEventListener('click', (e) => {
      e.preventDefault();
      SB.back();
    });

    /* Bottom nav */
    document.getElementById('bottom-nav').addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      const target = item.dataset.screen;
      if (target && target !== _current) {
        SB.navigate(target);
      }
    });

    /* Modal overlay click-to-close */
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') SB.hideModal();
    });

    /* Browser back button */
    window.addEventListener('popstate', () => {
      if (_history.length > 0) {
        SB.back();
      }
    });

    /* Start app */
    if (SB.Storage.isOnboarded()) {
      SB.navigate('screen-dashboard');
    } else {
      SB.navigate('screen-splash');
    }
  };

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SB.init());
  } else {
    SB.init();
  }

})();
