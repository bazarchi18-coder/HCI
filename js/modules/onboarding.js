(function () {
  /* =========================================================
   *  SoundBridge — Onboarding Module  (screens 01-08)
   * ========================================================= */

  // ── Screen 01 : Splash ──────────────────────────────────
  SB.registerScreen('screen-splash', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      return `
        <style>
          .splash-screen {
            background: var(--gradient-splash);
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-lg);
            padding: var(--screen-padding);
            overflow: hidden;
          }

          /* Wave bars ------------------------------------------------ */
          .splash-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            opacity: 0;
            transform: scale(0.6);
            animation: splashLogoIn 0.8s var(--ease-spring) forwards;
          }
          .splash-bar {
            width: 8px;
            border-radius: var(--radius-full);
            background: rgba(255, 255, 255, 0.92);
            animation: splashWave 1.2s ease-in-out infinite;
          }
          .splash-bar:nth-child(1) { height: 24px; animation-delay: 0s; }
          .splash-bar:nth-child(2) { height: 40px; animation-delay: 0.15s; }
          .splash-bar:nth-child(3) { height: 56px; animation-delay: 0.3s; }
          .splash-bar:nth-child(4) { height: 36px; animation-delay: 0.45s; }

          @keyframes splashWave {
            0%, 100% { transform: scaleY(1); }
            50%      { transform: scaleY(1.6); }
          }
          @keyframes splashLogoIn {
            to { opacity: 1; transform: scale(1); }
          }

          /* Text ----------------------------------------------------- */
          .splash-title {
            font-size: 2.4rem;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.5px;
            opacity: 0;
            animation: splashTextIn 0.7s ease forwards 0.6s;
          }
          .splash-tagline {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.78);
            opacity: 0;
            animation: splashTextIn 0.7s ease forwards 1s;
          }
          @keyframes splashTextIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        </style>

        <div class="splash-screen">
          <div class="splash-logo">
            <div class="splash-bar"></div>
            <div class="splash-bar"></div>
            <div class="splash-bar"></div>
            <div class="splash-bar"></div>
          </div>
          <div class="splash-title">SoundBridge</div>
          <div class="splash-tagline">Bridging Sound, Connecting Lives</div>
        </div>
      `;
    },

    onShow() {
      this._timer = setTimeout(() => SB.navigate('screen-welcome'), 2500);
    },
    onHide() {
      clearTimeout(this._timer);
    }
  });

  // ── Screen 02 : Welcome ─────────────────────────────────
  SB.registerScreen('screen-welcome', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      return `
        <style>
          .welcome-screen {
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--space-3xl) var(--screen-padding) var(--space-2xl);
            background: var(--color-bg);
          }

          .welcome-logo-wrap {
            width: 88px; height: 88px;
            border-radius: var(--radius-full);
            background: var(--gradient-primary);
            display: flex; align-items: center; justify-content: center;
            gap: 4px;
            box-shadow: var(--shadow-lg);
            margin-bottom: var(--space-lg);
            opacity: 0;
            animation: wFadeUp 0.6s var(--ease-out) forwards 0.1s;
          }
          .welcome-logo-bar {
            width: 5px; border-radius: var(--radius-full);
            background: rgba(255,255,255,0.9);
            animation: splashWave 1.4s ease-in-out infinite;
          }
          .welcome-logo-bar:nth-child(1) { height: 14px; animation-delay: 0s; }
          .welcome-logo-bar:nth-child(2) { height: 22px; animation-delay: 0.15s; }
          .welcome-logo-bar:nth-child(3) { height: 30px; animation-delay: 0.3s; }
          .welcome-logo-bar:nth-child(4) { height: 18px; animation-delay: 0.45s; }

          @keyframes splashWave {
            0%, 100% { transform: scaleY(1); }
            50%      { transform: scaleY(1.5); }
          }

          .welcome-brand {
            font-size: 1.75rem; font-weight: 700;
            color: var(--color-text);
            margin-bottom: var(--space-xs);
            opacity: 0;
            animation: wFadeUp 0.6s var(--ease-out) forwards 0.25s;
          }
          .welcome-tagline {
            font-size: 1.15rem; font-weight: 500;
            color: var(--color-primary);
            margin-bottom: var(--space-base);
            opacity: 0;
            animation: wFadeUp 0.6s var(--ease-out) forwards 0.35s;
          }
          .welcome-desc {
            text-align: center;
            font-size: 0.95rem; line-height: 1.6;
            color: var(--color-text-secondary);
            max-width: 340px;
            margin-bottom: auto;
            opacity: 0;
            animation: wFadeUp 0.6s var(--ease-out) forwards 0.45s;
          }

          .welcome-actions {
            width: 100%; max-width: 360px;
            display: flex; flex-direction: column;
            gap: var(--space-sm);
            margin-top: var(--space-2xl);
            opacity: 0;
            animation: wFadeUp 0.6s var(--ease-out) forwards 0.6s;
          }
          .welcome-guest-btn {
            font-size: 0.85rem !important;
          }

          @keyframes wFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        </style>

        <div class="welcome-screen">
          <div class="welcome-logo-wrap">
            <div class="welcome-logo-bar"></div>
            <div class="welcome-logo-bar"></div>
            <div class="welcome-logo-bar"></div>
            <div class="welcome-logo-bar"></div>
          </div>
          <div class="welcome-brand">SoundBridge</div>
          <h2 class="welcome-tagline">Your Communication Companion</h2>
          <p class="welcome-desc">
            Designed for people with partial hearing loss. Real-time captions,
            sound alerts, and communication tools — all in one place.
          </p>

          <div class="welcome-actions">
            <button class="btn btn-primary btn-block btn-lg" id="wb-get-started">Get Started</button>
            <button class="btn btn-secondary btn-block" id="wb-sign-in">Sign In</button>
            <button class="btn btn-ghost btn-block welcome-guest-btn" id="wb-guest">Continue as Guest</button>
          </div>
        </div>
      `;
    },

    onShow() {
      document.getElementById('wb-get-started')
        .addEventListener('click', () => SB.navigate('screen-onboard-1'));
      document.getElementById('wb-sign-in')
        .addEventListener('click', () => SB.navigate('screen-signin'));
      document.getElementById('wb-guest')
        .addEventListener('click', () => {
          SB.Storage.setOnboarded(true);
          SB.navigate('screen-dashboard');
        });
    }
  });

  // ── Helper: progress dots ─────────────────────────────
  function progressDots(active) {
    return `<div class="ob-dots">
      ${[1, 2, 3].map(i =>
        `<span class="ob-dot${i === active ? ' ob-dot--active' : ''}"></span>`
      ).join('')}
    </div>`;
  }

  // Shared onboarding styles (injected once with screen-onboard-1)
  const obSharedStyles = `
    .ob-screen {
      min-height: 100vh; min-height: 100dvh;
      display: flex; flex-direction: column;
      align-items: center;
      padding: var(--space-3xl) var(--screen-padding) var(--space-2xl);
      background: var(--color-bg);
    }

    /* Dots */
    .ob-dots {
      display: flex; gap: 8px;
      margin-bottom: var(--space-3xl);
    }
    .ob-dot {
      width: 10px; height: 10px;
      border-radius: var(--radius-full);
      background: var(--color-divider);
      transition: var(--transition-base);
    }
    .ob-dot--active {
      width: 28px;
      background: var(--color-primary);
    }

    /* Icon circle */
    .ob-icon-circle {
      width: 110px; height: 110px;
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
      margin-bottom: var(--space-2xl);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.15s;
    }

    .ob-headline {
      font-size: 1.6rem; font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-sm);
      text-align: center;
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.25s;
    }
    .ob-desc {
      font-size: 0.95rem; line-height: 1.6;
      color: var(--color-text-secondary);
      text-align: center;
      max-width: 340px;
      margin-bottom: auto;
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.35s;
    }

    .ob-actions {
      width: 100%; max-width: 360px;
      display: flex; flex-direction: column;
      gap: var(--space-sm);
      margin-top: var(--space-2xl);
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.45s;
    }
    .ob-skip {
      font-size: 0.85rem !important;
    }

    /* Radio cards */
    .ob-radio-cards {
      display: flex; flex-direction: column;
      gap: var(--space-sm);
      width: 100%; max-width: 360px;
      margin-bottom: auto;
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.35s;
    }
    .radio-card {
      display: flex; align-items: center;
      gap: var(--space-base);
      padding: var(--space-base) var(--space-lg);
      border-radius: var(--radius-lg);
      border: 2px solid var(--color-border);
      background: var(--color-surface);
      cursor: pointer;
      min-height: var(--touch-min);
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      user-select: none;
      -webkit-user-select: none;
    }
    .radio-card:active { transform: scale(0.98); }
    .radio-card.selected {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
      box-shadow: var(--shadow-glow);
    }
    .radio-card-icon {
      font-size: 1.8rem;
      flex-shrink: 0;
    }
    .radio-card-text { flex: 1; }
    .radio-card-title {
      font-weight: 600;
      color: var(--color-text);
      font-size: 1rem;
    }
    .radio-card-desc {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }
    .radio-card-check {
      width: 22px; height: 22px;
      border-radius: var(--radius-full);
      border: 2px solid var(--color-border);
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition-fast);
    }
    .radio-card.selected .radio-card-check {
      border-color: var(--color-primary);
      background: var(--color-primary);
    }
    .radio-card.selected .radio-card-check::after {
      content: '';
      width: 8px; height: 8px;
      border-radius: var(--radius-full);
      background: #fff;
    }

    /* Perm screens */
    .perm-screen {
      min-height: 100vh; min-height: 100dvh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: var(--space-3xl) var(--screen-padding) var(--space-2xl);
      background: var(--color-bg);
    }
    .perm-icon-circle {
      width: 120px; height: 120px;
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-2xl);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      animation: wFadeUp 0.6s var(--ease-out) forwards 0.1s;
    }
    .perm-icon-circle .material-symbols-rounded {
      font-size: 3rem;
      color: #fff;
    }
    .perm-headline {
      font-size: 1.5rem; font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-sm);
      text-align: center;
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.25s;
    }
    .perm-desc {
      font-size: 0.92rem; line-height: 1.65;
      color: var(--color-text-secondary);
      text-align: center;
      max-width: 340px;
      margin-bottom: var(--space-3xl);
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.35s;
    }
    .perm-actions {
      width: 100%; max-width: 360px;
      display: flex; flex-direction: column;
      gap: var(--space-sm);
      opacity: 0;
      animation: wFadeUp 0.5s var(--ease-out) forwards 0.5s;
    }

    /* Sign-in */
    .signin-screen {
      display: flex; flex-direction: column;
      align-items: center;
      padding: var(--space-2xl) var(--screen-padding) var(--space-2xl);
      background: var(--color-bg);
    }
    .signin-icon {
      width: 88px; height: 88px;
      border-radius: var(--radius-full);
      background: var(--gradient-primary);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-2xl);
      box-shadow: var(--shadow-md);
    }
    .signin-icon .material-symbols-rounded {
      font-size: 2.4rem; color: #fff;
    }
    .signin-form {
      width: 100%; max-width: 360px;
      display: flex; flex-direction: column;
      gap: var(--space-base);
    }
    .signin-forgot {
      background: none; border: none;
      color: var(--color-primary);
      font-size: 0.85rem;
      cursor: pointer;
      text-align: center;
      padding: var(--space-xs) 0;
      min-height: var(--touch-min);
      display: flex; align-items: center; justify-content: center;
    }
    .signin-divider {
      display: flex; align-items: center;
      gap: var(--space-base);
      color: var(--color-text-tertiary);
      font-size: 0.82rem;
      margin: var(--space-xs) 0;
    }
    .signin-divider::before,
    .signin-divider::after {
      content: '';
      flex: 1; height: 1px;
      background: var(--color-divider);
    }

    @keyframes wFadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  // ── Screen 03 : Onboard Step 1 ──────────────────────────
  SB.registerScreen('screen-onboard-1', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      return `
        <style>${obSharedStyles}</style>

        <div class="ob-screen">
          ${progressDots(1)}

          <div class="ob-icon-circle" style="background: var(--gradient-primary);">
            🎧
          </div>

          <h1 class="ob-headline">Hear What Matters</h1>
          <p class="ob-desc">
            SoundBridge helps you catch every word with real-time captions
            and smart sound alerts.
          </p>

          <div class="ob-actions">
            <button class="btn btn-primary btn-block btn-lg" id="ob1-next">Next</button>
            <button class="btn btn-ghost btn-block ob-skip" id="ob1-skip">Skip</button>
          </div>
        </div>
      `;
    },

    onShow() {
      document.getElementById('ob1-next')
        .addEventListener('click', () => SB.navigate('screen-onboard-2'));
      document.getElementById('ob1-skip')
        .addEventListener('click', () => {
          SB.Storage.setOnboarded(true);
          SB.navigate('screen-dashboard');
        });
    }
  });

  // ── Screen 04 : Onboard Step 2 — Hearing Profile ───────
  SB.registerScreen('screen-onboard-2', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      const cards = [
        { value: 'mild',     icon: '🔉', title: 'Mild',     desc: 'I miss some words in noisy places' },
        { value: 'moderate', icon: '🔇', title: 'Moderate', desc: 'I struggle in most noisy environments' },
        { value: 'severe',   icon: '👁️', title: 'Severe',   desc: 'I rely heavily on visual cues' }
      ];

      return `
        <div class="ob-screen">
          ${progressDots(2)}

          <h1 class="ob-headline" style="animation-delay:0.1s">Your Hearing Profile</h1>
          <p class="ob-desc" style="animation-delay:0.2s; margin-bottom: var(--space-2xl);">
            Help us personalize your experience
          </p>

          <div class="ob-radio-cards" id="ob2-cards" style="animation-delay:0.25s">
            ${cards.map(c => `
              <div class="radio-card${c.value === 'moderate' ? ' selected' : ''}" data-value="${c.value}">
                <span class="radio-card-icon">${c.icon}</span>
                <div class="radio-card-text">
                  <div class="radio-card-title">${c.title}</div>
                  <div class="radio-card-desc">${c.desc}</div>
                </div>
                <div class="radio-card-check"></div>
              </div>
            `).join('')}
          </div>

          <div class="ob-actions">
            <button class="btn btn-primary btn-block btn-lg" id="ob2-next">Next</button>
            <button class="btn btn-ghost btn-block ob-skip" id="ob2-back">Back</button>
          </div>
        </div>
      `;
    },

    onShow() {
      let selected = 'moderate';
      const container = document.getElementById('ob2-cards');

      container.addEventListener('click', function (e) {
        const card = e.target.closest('.radio-card');
        if (!card) return;
        container.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selected = card.dataset.value;
      });

      document.getElementById('ob2-next').addEventListener('click', () => {
        SB.Storage.setProfile({ severity: selected });
        SB.navigate('screen-onboard-3');
      });

      document.getElementById('ob2-back').addEventListener('click', () => SB.back());
    }
  });

  // ── Screen 05 : Onboard Step 3 — Alert Preferences ────
  SB.registerScreen('screen-onboard-3', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      const cards = [
        { value: 'visual', icon: '💡', title: 'Visual Only',          desc: 'Flash & color alerts on screen' },
        { value: 'haptic', icon: '📳', title: 'Vibration Only',       desc: 'Haptic feedback patterns' },
        { value: 'both',   icon: '✨', title: 'Both (Recommended)',   desc: 'Visual alerts + vibration' }
      ];

      return `
        <div class="ob-screen">
          ${progressDots(3)}

          <h1 class="ob-headline" style="animation-delay:0.1s">Alert Preferences</h1>
          <p class="ob-desc" style="animation-delay:0.2s; margin-bottom: var(--space-2xl);">
            How should we notify you about important sounds?
          </p>

          <div class="ob-radio-cards" id="ob3-cards" style="animation-delay:0.25s">
            ${cards.map(c => `
              <div class="radio-card${c.value === 'both' ? ' selected' : ''}" data-value="${c.value}">
                <span class="radio-card-icon">${c.icon}</span>
                <div class="radio-card-text">
                  <div class="radio-card-title">${c.title}</div>
                  <div class="radio-card-desc">${c.desc}</div>
                </div>
                <div class="radio-card-check"></div>
              </div>
            `).join('')}
          </div>

          <div class="ob-actions">
            <button class="btn btn-primary btn-block btn-lg" id="ob3-next">Continue</button>
            <button class="btn btn-ghost btn-block ob-skip" id="ob3-back">Back</button>
          </div>
        </div>
      `;
    },

    onShow() {
      let selected = 'both';
      const container = document.getElementById('ob3-cards');

      container.addEventListener('click', function (e) {
        const card = e.target.closest('.radio-card');
        if (!card) return;
        container.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selected = card.dataset.value;
      });

      document.getElementById('ob3-next').addEventListener('click', () => {
        SB.Storage.setProfile({ alertStyle: selected });
        SB.navigate('screen-perm-mic');
      });

      document.getElementById('ob3-back').addEventListener('click', () => SB.back());
    }
  });

  // ── Screen 06 : Microphone Permission ──────────────────
  SB.registerScreen('screen-perm-mic', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      return `
        <div class="perm-screen">
          <div class="perm-icon-circle" style="background: var(--gradient-primary);">
            <span class="material-symbols-rounded">mic</span>
          </div>

          <h1 class="perm-headline">Microphone Access</h1>
          <p class="perm-desc">
            SoundBridge needs your microphone to provide real-time captions and
            detect sounds. Your audio is processed locally and never sent to
            external servers.
          </p>

          <div class="perm-actions">
            <button class="btn btn-primary btn-block btn-lg" id="perm-mic-allow">Allow Microphone</button>
            <button class="btn btn-ghost btn-block" id="perm-mic-skip">Not Now</button>
          </div>
        </div>
      `;
    },

    onShow() {
      document.getElementById('perm-mic-allow').addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
          SB.showToast('Microphone access granted', 'success');
        } catch (_) {
          SB.showToast('Microphone access denied', 'warning');
        }
        SB.navigate('screen-perm-notif');
      });

      document.getElementById('perm-mic-skip').addEventListener('click', () => {
        SB.navigate('screen-perm-notif');
      });
    }
  });

  // ── Screen 07 : Notification Permission ────────────────
  SB.registerScreen('screen-perm-notif', {
    title: '',
    showHeader: false,
    showNav: false,

    html() {
      return `
        <div class="perm-screen">
          <div class="perm-icon-circle" style="background: var(--gradient-warm);">
            <span class="material-symbols-rounded">notifications</span>
          </div>

          <h1 class="perm-headline">Stay Alerted</h1>
          <p class="perm-desc">
            Get notified when important sounds like doorbells or alarms
            are detected.
          </p>

          <div class="perm-actions">
            <button class="btn btn-primary btn-block btn-lg" id="perm-notif-allow">Allow Notifications</button>
            <button class="btn btn-ghost btn-block" id="perm-notif-skip">Not Now</button>
          </div>
        </div>
      `;
    },

    onShow() {
      document.getElementById('perm-notif-allow').addEventListener('click', async () => {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            SB.showToast('Notifications enabled', 'success');
          } else {
            SB.showToast('Notifications not enabled', 'warning');
          }
        } catch (_) {
          SB.showToast('Notification permission error', 'warning');
        }
        SB.Storage.setOnboarded(true);
        SB.navigate('screen-dashboard');
      });

      document.getElementById('perm-notif-skip').addEventListener('click', () => {
        SB.Storage.setOnboarded(true);
        SB.navigate('screen-dashboard');
      });
    }
  });

  // ── Screen 08 : Sign In ────────────────────────────────
  SB.registerScreen('screen-signin', {
    title: 'Sign In',
    showHeader: true,
    showBack: true,
    showNav: false,

    html() {
      return `
        <div class="signin-screen">
          <div class="signin-icon">
            <span class="material-symbols-rounded">person</span>
          </div>

          <form class="signin-form" id="sb-signin-form" autocomplete="off">
            <div class="input-group">
              <label class="input-label" for="sb-signin-email">Email</label>
              <input class="input-field" type="email" id="sb-signin-email"
                     placeholder="you@example.com" autocomplete="email">
            </div>

            <div class="input-group">
              <label class="input-label" for="sb-signin-password">Password</label>
              <input class="input-field" type="password" id="sb-signin-password"
                     placeholder="Enter your password" autocomplete="current-password">
            </div>

            <button type="button" class="btn btn-primary btn-block btn-lg" id="sb-signin-btn">
              Sign In
            </button>

            <button type="button" class="signin-forgot" id="sb-forgot-btn">
              Forgot Password?
            </button>

            <div class="signin-divider">or</div>

            <button type="button" class="btn btn-ghost btn-block" id="sb-guest-btn">
              Continue as Guest
            </button>
          </form>
        </div>
      `;
    },

    onShow() {
      document.getElementById('sb-signin-btn').addEventListener('click', () => {
        const email = document.getElementById('sb-signin-email').value.trim();
        const pass  = document.getElementById('sb-signin-password').value.trim();

        if (!email || !pass) {
          SB.showToast('Please fill in all fields', 'warning');
          return;
        }

        const name = email.split('@')[0];
        SB.Storage.setProfile({ name, email });
        SB.Storage.setOnboarded(true);
        SB.showToast('Welcome back!', 'success');
        SB.navigate('screen-dashboard');
      });

      document.getElementById('sb-forgot-btn').addEventListener('click', () => {
        SB.showToast('Password reset link sent!', 'info');
      });

      document.getElementById('sb-guest-btn').addEventListener('click', () => {
        SB.Storage.setOnboarded(true);
        SB.navigate('screen-dashboard');
      });
    }
  });

})();
