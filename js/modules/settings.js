(function() {
  'use strict';

  /* ── Screen 26: Hearing Profile Settings ── */
  SB.registerScreen('screen-settings-hearing', {
    title: 'Hearing Profile',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() {
      return `
        <div class="screen-content flex-col gap-lg">
          <p class="text-secondary mb-sm">Update your hearing profile to help SoundBridge adapt to your needs.</p>
          
          <div class="input-group">
            <label class="input-label">Hearing Loss Severity</label>
            <div class="flex-col gap-sm" id="severity-options">
              <div class="radio-card" data-val="mild">
                <div class="radio-card-icon">🔉</div>
                <div class="radio-card-content">
                  <div class="radio-card-title">Mild</div>
                  <div class="radio-card-desc">I miss some words in noisy places</div>
                </div>
                <div class="radio-card-dot"></div>
              </div>
              <div class="radio-card" data-val="moderate">
                <div class="radio-card-icon">🔇</div>
                <div class="radio-card-content">
                  <div class="radio-card-title">Moderate</div>
                  <div class="radio-card-desc">I struggle in most noisy environments</div>
                </div>
                <div class="radio-card-dot"></div>
              </div>
              <div class="radio-card" data-val="severe">
                <div class="radio-card-icon">👁️</div>
                <div class="radio-card-content">
                  <div class="radio-card-title">Severe</div>
                  <div class="radio-card-desc">I rely heavily on visual cues</div>
                </div>
                <div class="radio-card-dot"></div>
              </div>
            </div>
          </div>
          
          <div class="input-group mt-base">
            <label class="input-label">Preferred Communication</label>
            <div class="flex flex-wrap gap-sm" id="comm-style-options">
              <div class="chip chip-outline" data-val="text">Text / Captions</div>
              <div class="chip chip-outline" data-val="cards">Quick Reply Cards</div>
              <div class="chip chip-outline" data-val="audio">Enhanced Audio</div>
            </div>
          </div>
          
          <div class="mt-auto pt-xl">
            <button id="btn-save-hearing" class="btn btn-primary btn-block btn-lg">Save Changes</button>
          </div>
        </div>
      `;
    },
    onShow: function() {
      const profile = SB.Storage.getProfile();
      let currentSeverity = profile.severity || 'moderate';
      let currentComm = profile.commStyle || 'text';

      // Set initial state
      document.querySelectorAll('#severity-options .radio-card').forEach(card => {
        if (card.dataset.val === currentSeverity) card.classList.add('selected');
        card.addEventListener('click', () => {
          document.querySelectorAll('#severity-options .radio-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          currentSeverity = card.dataset.val;
        });
      });

      document.querySelectorAll('#comm-style-options .chip').forEach(chip => {
        if (chip.dataset.val === currentComm) chip.classList.add('active');
        chip.addEventListener('click', () => {
          document.querySelectorAll('#comm-style-options .chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentComm = chip.dataset.val;
        });
      });

      document.getElementById('btn-save-hearing').addEventListener('click', () => {
        SB.Storage.setProfile({ severity: currentSeverity, commStyle: currentComm });
        SB.showToast('Hearing profile updated', 'success');
        SB.back();
      });
    }
  });

  /* ── Screen 27: Notification Settings ── */
  SB.registerScreen('screen-settings-notif', {
    title: 'Notifications',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() {
      return `
        <div class="screen-content flex-col gap-lg pb-xl">
          
          <div class="input-group">
            <div class="flex-between">
              <label class="input-label">Vibration Intensity</label>
              <span id="lbl-vib-int" class="text-sm font-medium">Strong</span>
            </div>
            <input type="range" id="vib-intensity" class="range-slider" min="1" max="3" step="1">
            <div class="flex-between text-xs text-tertiary mt-2xs">
              <span>Light</span><span>Medium</span><span>Strong</span>
            </div>
          </div>

          <div class="input-group mt-sm">
            <div class="flex-between">
              <label class="input-label">Alert Duration</label>
              <span id="lbl-alert-dur" class="text-sm font-medium">10s</span>
            </div>
            <input type="range" id="alert-duration" class="range-slider" min="5" max="30" step="5">
          </div>

          <div class="divider mt-base mb-base"></div>
          
          <label class="input-label mb-0">Do Not Disturb</label>
          <div class="flex gap-base">
            <div class="input-group flex-1">
              <span class="text-xs text-tertiary">Start</span>
              <input type="time" id="dnd-start" class="input-field p-sm">
            </div>
            <div class="input-group flex-1">
              <span class="text-xs text-tertiary">End</span>
              <input type="time" id="dnd-end" class="input-field p-sm">
            </div>
          </div>

          <div class="card mt-sm flex-between items-center px-base py-sm">
            <div>
              <div class="font-medium text-base">Emergency Override</div>
              <div class="text-xs text-secondary">Always alert for smoke detectors and sirens</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="emergency-override" class="toggle-input">
              <div class="toggle-slider"></div>
            </label>
          </div>

        </div>
      `;
    },
    onShow: function() {
      const settings = SB.Storage.getSettings();
      const alertSettings = SB.Storage.getAlertSettings();
      
      const rngVib = document.getElementById('vib-intensity');
      const lblVib = document.getElementById('lbl-vib-int');
      const vibMap = { '1': 'light', '2': 'medium', '3': 'strong' };
      const vibRevMap = { 'light': '1', 'medium': '2', 'strong': '3' };
      
      rngVib.value = vibRevMap[alertSettings.vibrationIntensity || 'strong'];
      lblVib.textContent = alertSettings.vibrationIntensity || 'strong';
      
      rngVib.addEventListener('change', () => {
        const val = vibMap[rngVib.value];
        lblVib.textContent = val;
        alertSettings.vibrationIntensity = val;
        SB.Storage.setAlertSettings(alertSettings);
        // vibrate to preview
        if(val === 'light') SB.vibrate([100]);
        if(val === 'medium') SB.vibrate([150, 50, 150]);
        if(val === 'strong') SB.vibrate([250, 100, 250, 100, 250]);
      });

      const rngDur = document.getElementById('alert-duration');
      const lblDur = document.getElementById('lbl-alert-dur');
      rngDur.value = settings.alertDuration || 10;
      lblDur.textContent = rngDur.value + 's';
      rngDur.addEventListener('change', () => {
        lblDur.textContent = rngDur.value + 's';
        SB.Storage.updateSettings({ alertDuration: parseInt(rngDur.value, 10) });
      });

      const dndStart = document.getElementById('dnd-start');
      const dndEnd = document.getElementById('dnd-end');
      dndStart.value = settings.dndStart || '22:00';
      dndEnd.value = settings.dndEnd || '07:00';
      dndStart.addEventListener('change', () => SB.Storage.updateSettings({ dndStart: dndStart.value }));
      dndEnd.addEventListener('change', () => SB.Storage.updateSettings({ dndEnd: dndEnd.value }));

      const chkOverride = document.getElementById('emergency-override');
      chkOverride.checked = settings.emergencyOverride !== false;
      chkOverride.addEventListener('change', () => {
        SB.Storage.updateSettings({ emergencyOverride: chkOverride.checked });
      });
    }
  });

  /* ── Screen 28: Accessibility Settings ── */
  SB.registerScreen('screen-settings-access', {
    title: 'Accessibility',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() {
      return `
        <div class="screen-content flex-col gap-lg pb-xl">
          
          <div class="card p-base mb-sm">
            <h3 class="mb-sm">Preview</h3>
            <p>This is how text will look with your current accessibility settings applied. SoundBridge adapts to make reading comfortable for you.</p>
          </div>

          <div class="input-group">
            <label class="input-label">Theme</label>
            <div class="flex gap-sm">
              <button class="btn btn-secondary flex-1" id="theme-light">Light</button>
              <button class="btn btn-secondary flex-1" id="theme-dark">Dark</button>
            </div>
          </div>

          <div class="flex-between items-center py-sm">
            <div>
              <div class="font-medium">High Contrast</div>
              <div class="text-sm text-secondary">Maximize text legibility</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-contrast" class="toggle-input">
              <div class="toggle-slider"></div>
            </label>
          </div>
          
          <div class="divider"></div>

          <div class="input-group">
            <label class="input-label">App Font Size</label>
            <div class="flex flex-wrap gap-sm" id="font-scale-opts">
              <div class="chip chip-outline" data-val="small">Small</div>
              <div class="chip chip-outline" data-val="normal">Normal</div>
              <div class="chip chip-outline" data-val="large">Large</div>
              <div class="chip chip-outline" data-val="xl">Extra Large</div>
            </div>
          </div>

        </div>
      `;
    },
    onShow: function() {
      const settings = SB.Storage.getSettings();
      
      const btnLight = document.getElementById('theme-light');
      const btnDark = document.getElementById('theme-dark');
      
      function updateThemeBtns(t) {
        if(t==='dark') {
          btnDark.classList.replace('btn-secondary', 'btn-primary');
          btnLight.classList.replace('btn-primary', 'btn-secondary');
        } else {
          btnLight.classList.replace('btn-secondary', 'btn-primary');
          btnDark.classList.replace('btn-primary', 'btn-secondary');
        }
      }
      updateThemeBtns(settings.theme || 'light');
      
      btnLight.addEventListener('click', () => {
        SB.Storage.updateSettings({ theme: 'light' });
        updateThemeBtns('light');
      });
      btnDark.addEventListener('click', () => {
        SB.Storage.updateSettings({ theme: 'dark' });
        updateThemeBtns('dark');
      });

      const chkContrast = document.getElementById('toggle-contrast');
      chkContrast.checked = (settings.contrast === 'high');
      chkContrast.addEventListener('change', () => {
        SB.Storage.updateSettings({ contrast: chkContrast.checked ? 'high' : 'normal' });
      });

      const currentScale = settings.fontScale || 'normal';
      document.querySelectorAll('#font-scale-opts .chip').forEach(chip => {
        if(chip.dataset.val === currentScale) chip.classList.add('active');
        chip.addEventListener('click', () => {
          document.querySelectorAll('#font-scale-opts .chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          SB.Storage.updateSettings({ fontScale: chip.dataset.val });
        });
      });
    }
  });

  /* ── Screen 29: Profile & Settings Hub ── */
  SB.registerScreen('screen-settings-profile', {
    title: 'Settings',
    showHeader: true,
    showBack: false,
    showNav: true,
    html: function() {
      return `
        <div class="screen-content flex-col gap-base pb-xl">
          
          <div class="flex-col items-center justify-center p-xl gap-sm">
            <div class="icon-circle-xl" style="background: var(--gradient-primary); color: white;">
              <span class="material-symbols-rounded" style="font-size:48px">person</span>
            </div>
            <div class="text-center">
              <h2 id="profile-name-disp" class="mb-2xs">User</h2>
              <p class="text-sm text-secondary" id="profile-severity-disp">Hearing Profile: Not set</p>
            </div>
          </div>

          <div class="flex-col gap-sm">
            <div class="list-item bg-surface card-interactive" data-target="screen-settings-hearing">
              <div class="list-item-icon"><span class="material-symbols-rounded">hearing</span></div>
              <div class="list-item-content">
                <div class="list-item-title">Hearing Profile</div>
                <div class="list-item-subtitle">Severity & preferences</div>
              </div>
              <div class="list-item-action"><span class="material-symbols-rounded">chevron_right</span></div>
            </div>

            <div class="list-item bg-surface card-interactive" data-target="screen-settings-notif">
              <div class="list-item-icon"><span class="material-symbols-rounded">notifications</span></div>
              <div class="list-item-content">
                <div class="list-item-title">Notifications</div>
                <div class="list-item-subtitle">Vibration & alerts</div>
              </div>
              <div class="list-item-action"><span class="material-symbols-rounded">chevron_right</span></div>
            </div>

            <div class="list-item bg-surface card-interactive" data-target="screen-settings-access">
              <div class="list-item-icon"><span class="material-symbols-rounded">accessibility_new</span></div>
              <div class="list-item-content">
                <div class="list-item-title">Accessibility</div>
                <div class="list-item-title text-sm text-secondary mt-2xs" style="margin-top:2px;">Theme, contrast, text size</div>
              </div>
              <div class="list-item-action"><span class="material-symbols-rounded">chevron_right</span></div>
            </div>

            <div class="list-item bg-surface card-interactive" data-target="screen-media-settings">
              <div class="list-item-icon"><span class="material-symbols-rounded">closed_caption</span></div>
              <div class="list-item-content">
                <div class="list-item-title">Caption Settings</div>
                <div class="list-item-subtitle">Media caption styles</div>
              </div>
              <div class="list-item-action"><span class="material-symbols-rounded">chevron_right</span></div>
            </div>
            
            <div class="list-item bg-surface card-interactive" data-target="screen-help">
              <div class="list-item-icon"><span class="material-symbols-rounded">help</span></div>
              <div class="list-item-content">
                <div class="list-item-title">Help & Support</div>
                <div class="list-item-subtitle">FAQ & tutorials</div>
              </div>
              <div class="list-item-action"><span class="material-symbols-rounded">chevron_right</span></div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="list-item card-interactive" id="btn-reset-data">
            <div class="list-item-icon" style="color: var(--color-alert); background: rgba(var(--color-alert-rgb),0.1)">
              <span class="material-symbols-rounded">delete_forever</span>
            </div>
            <div class="list-item-content">
              <div class="list-item-title text-alert">Reset App Data</div>
            </div>
          </div>

          <div class="text-center text-xs text-tertiary mt-lg mb-xl">
            SoundBridge v1.0.0<br>Built for HCI Assignments 3 & 4
          </div>

        </div>
      `;
    },
    onShow: function() {
      const profile = SB.Storage.getProfile();
      document.getElementById('profile-name-disp').textContent = profile.name || 'Guest User';
      const severityMap = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' };
      document.getElementById('profile-severity-disp').textContent = `Hearing Profile: ${severityMap[profile.severity] || 'Not set'}`;

      document.querySelectorAll('[data-target]').forEach(el => {
        el.addEventListener('click', () => {
          SB.navigate(el.dataset.target);
        });
      });

      document.getElementById('btn-reset-data').addEventListener('click', () => {
        SB.confirm('Reset All Data?', 'This will erase all your transcripts, custom cards, and settings. This cannot be undone.', 'Reset Data', () => {
          localStorage.clear();
          window.location.reload();
        });
      });
    }
  });

  /* ── Screen 30: Help & Support ── */
  SB.registerScreen('screen-help', {
    title: 'Help & Support',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() {
      return `
        <div class="screen-content flex-col gap-lg pb-xl">
          
          <div>
            <h3 class="mb-sm">Frequently Asked Questions</h3>
            
            <div class="accordion-item">
              <div class="accordion-header">
                How does Live Caption work?
                <span class="material-symbols-rounded">expand_more</span>
              </div>
              <div class="accordion-body">
                <div class="accordion-body-inner">
                  SoundBridge uses your device microphone and the browser's Web Speech API to convert speech to text in real-time. All processing happens securely on your device.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <div class="accordion-header">
                What sounds can be detected?
                <span class="material-symbols-rounded">expand_more</span>
              </div>
              <div class="accordion-body">
                <div class="accordion-body-inner">
                  SoundBridge can simulate detection for doorbells, alarms, baby cries, dog barks, smoke detectors, and sirens using advanced audio processing algorithms.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <div class="accordion-header">
                Is my audio data stored?
                <span class="material-symbols-rounded">expand_more</span>
              </div>
              <div class="accordion-body">
                <div class="accordion-body-inner">
                  No. SoundBridge processes audio locally on your device. No audio data is ever sent to external servers or stored permanently without your explicit action (like saving a transcript).
                </div>
              </div>
            </div>
          </div>

          <div class="card p-base bg-surface mt-sm">
            <h3 class="mb-sm">Need more help?</h3>
            <button id="btn-contact-support" class="btn btn-secondary btn-block mb-sm">
              <span class="material-symbols-rounded">mail</span> Contact Support
            </button>
            <button class="btn btn-ghost btn-block" onclick="SB.navigate('screen-splash')">
              <span class="material-symbols-rounded">replay</span> Replay Onboarding
            </button>
          </div>

        </div>
      `;
    },
    onShow: function() {
      document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', (e) => {
          const item = e.currentTarget.parentElement;
          item.classList.toggle('open');
        });
      });

      document.getElementById('btn-contact-support').addEventListener('click', () => {
        SB.showToast('Email draft opened to support@soundbridge.app', 'info');
      });
    }
  });

})();
