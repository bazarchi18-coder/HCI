/* ===================================================
   SoundBridge — Storage Layer
   localStorage wrapper with full CRUD API
   =================================================== */
(function() {
  'use strict';

  window.SB = window.SB || {};

  const PREFIX = 'sb_';

  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Storage read error:', key, e);
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', key, e);
    }
  }

  SB.Storage = {

    /* ── Generic ── */
    get: get,
    set: set,
    remove(key) { localStorage.removeItem(PREFIX + key); },

    /* ── Hearing Profile ── */
    getProfile() {
      return get('profile') || {
        severity: 'moderate',
        alertStyle: 'both',
        name: '',
        email: '',
        commStyle: 'text'
      };
    },
    setProfile(data) {
      const current = this.getProfile();
      set('profile', { ...current, ...data });
    },

    /* ── Onboarding ── */
    isOnboarded() { return get('onboarded') === true; },
    setOnboarded(val) { set('onboarded', !!val); },

    /* ── Transcripts ── */
    getTranscripts() { return get('transcripts') || []; },
    addTranscript(data) {
      const list = this.getTranscripts();
      data.id = data.id || SB.generateId();
      data.date = data.date || new Date().toISOString();
      data.preview = (data.text || '').substring(0, 80);
      list.unshift(data);
      if (list.length > 100) list.length = 100;
      set('transcripts', list);
      return data;
    },
    deleteTranscript(id) {
      set('transcripts', this.getTranscripts().filter(t => t.id !== id));
    },
    clearTranscripts() { set('transcripts', []); },

    /* ── Quick Reply Cards ── */
    getCards() {
      const cards = get('cards');
      if (cards && cards.length) return cards;
      const defaults = [
        { id: 'c1', text: 'Please Repeat',          emoji: '🔁', category: 'common',  color: '#1A6B8A' },
        { id: 'c2', text: 'I Have Hearing Loss',     emoji: '👂', category: 'inform',  color: '#2E86AB' },
        { id: 'c3', text: 'Please Speak Slowly',     emoji: '🐢', category: 'common',  color: '#8B5CF6' },
        { id: 'c4', text: 'Can You Write It Down?',  emoji: '✍️', category: 'common',  color: '#E63946' },
        { id: 'c5', text: 'One Moment Please',       emoji: '✋', category: 'social',  color: '#F7B731' },
        { id: 'c6', text: 'Please Call Me Instead',  emoji: '📞', category: 'social',  color: '#2DC653' }
      ];
      set('cards', defaults);
      return defaults;
    },
    addCard(data) {
      const list = this.getCards();
      data.id = data.id || SB.generateId();
      list.push(data);
      set('cards', list);
      return data;
    },
    updateCard(id, data) {
      set('cards', this.getCards().map(c => c.id === id ? { ...c, ...data } : c));
    },
    deleteCard(id) {
      set('cards', this.getCards().filter(c => c.id !== id));
    },
    reorderCards(ids) {
      const cards = this.getCards();
      const map = {};
      cards.forEach(c => map[c.id] = c);
      const reordered = ids.map(id => map[id]).filter(Boolean);
      // Add any cards not in the list at the end
      cards.forEach(c => { if (!ids.includes(c.id)) reordered.push(c); });
      set('cards', reordered);
    },

    /* ── Sound Alert Settings ── */
    getAlertSettings() {
      return get('alertSettings') || {
        doorbell: true,
        alarm: true,
        babyCry: true,
        dogBark: false,
        smokeDetector: true,
        siren: true,
        vibrationIntensity: 'strong'
      };
    },
    setAlertSettings(data) { set('alertSettings', data); },

    /* ── Alert History ── */
    getAlertHistory() { return get('alertHistory') || []; },
    addAlertEvent(data) {
      const list = this.getAlertHistory();
      data.id = data.id || SB.generateId();
      data.time = data.time || new Date().toISOString();
      list.unshift(data);
      if (list.length > 50) list.length = 50;
      set('alertHistory', list);
      return data;
    },
    clearAlertHistory() { set('alertHistory', []); },

    /* ── App Settings ── */
    getSettings() {
      return get('settings') || {
        theme: 'light',
        contrast: 'normal',
        fontScale: 'normal',
        colorBlindMode: 'none',
        captionFontSize: 20,
        captionBgOpacity: 0.8,
        captionTextColor: '#FFFFFF',
        captionLineDelay: 0,
        dndStart: '22:00',
        dndEnd: '07:00',
        emergencyOverride: true
      };
    },
    updateSettings(partial) {
      const settings = { ...this.getSettings(), ...partial };
      set('settings', settings);
      // Apply theme attributes to document
      if (partial.theme !== undefined) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
      if (partial.contrast !== undefined) {
        document.documentElement.setAttribute('data-contrast', settings.contrast);
      }
      if (partial.fontScale !== undefined) {
        document.documentElement.setAttribute('data-font-scale', settings.fontScale);
      }
      return settings;
    },

    /* ── Ambient Meter History ── */
    getMeterHistory() { return get('meterHistory') || []; },
    addMeterReading(data) {
      const list = this.getMeterHistory();
      data.time = data.time || new Date().toISOString();
      list.push(data);
      if (list.length > 300) list.splice(0, list.length - 300);
      set('meterHistory', list);
    },
    clearMeterHistory() { set('meterHistory', []); }
  };

})();
