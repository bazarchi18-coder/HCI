(function () {
  /* =========================================================
   *  SoundBridge — Dashboard Module  (screen 09)
   * ========================================================= */

  const MODULE_CARDS = [
    {
      title: 'Live Caption',
      desc: 'Real-time speech to text',
      icon: 'mic',
      color: 'var(--color-primary)',
      gradient: 'var(--gradient-card-1)',
      screen: 'screen-caption-ready'
    },
    {
      title: 'Sound Monitor',
      desc: 'Detect important sounds',
      icon: 'notifications_active',
      color: 'var(--color-secondary)',
      gradient: 'var(--gradient-card-2)',
      screen: 'screen-alert-setup'
    },
    {
      title: 'Quick Reply',
      desc: 'Communication cards',
      icon: 'chat',
      color: 'var(--color-purple)',
      gradient: 'var(--gradient-card-3)',
      screen: 'screen-reply-home'
    },
    {
      title: 'Ambient Meter',
      desc: 'Check noise levels',
      icon: 'equalizer',
      color: 'var(--color-success)',
      gradient: 'var(--gradient-card-4)',
      screen: 'screen-meter'
    },
    {
      title: 'Media Captions',
      desc: 'Captions for videos',
      icon: 'closed_caption',
      color: 'var(--color-warning)',
      gradient: 'var(--gradient-card-5)',
      screen: 'screen-media-home'
    }
  ];

  SB.registerScreen('screen-dashboard', {
    title: '',
    showHeader: false,
    showNav: true,

    html() {
      const profile = SB.Storage.getProfile() || {};
      const name = profile.name || 'there';

      return `
        <style>
          .dash-container {
            min-height: 100%;
            padding: var(--space-2xl) var(--screen-padding) var(--space-2xl);
            background: var(--color-bg);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* Top bar */
          .dash-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: var(--space-2xl);
          }
          .dash-greeting h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 0 0 var(--space-2xs) 0;
          }
          .dash-greeting p {
            font-size: 0.92rem;
            color: var(--color-text-secondary);
            margin: 0;
          }
          .dash-settings-btn {
            width: 44px; height: 44px;
            min-height: var(--touch-min);
            border-radius: var(--radius-full);
            background: var(--color-surface-elevated);
            border: 1px solid var(--color-border);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: var(--transition-fast);
            box-shadow: var(--shadow-xs);
            flex-shrink: 0;
          }
          .dash-settings-btn:active {
            transform: scale(0.92);
          }
          .dash-settings-btn .material-symbols-rounded {
            font-size: 1.35rem;
            color: var(--color-text-secondary);
          }

          /* Cards */
          .dash-cards {
            display: flex;
            flex-direction: column;
            gap: var(--space-base);
          }

          .dash-card {
            display: flex;
            align-items: center;
            gap: var(--space-base);
            padding: var(--space-lg) var(--space-lg);
            border-radius: var(--radius-xl);
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            cursor: pointer;
            min-height: 80px;
            transition: transform 0.18s var(--ease-out),
                        box-shadow 0.18s var(--ease-out);
            user-select: none;
            -webkit-user-select: none;
            position: relative;
            overflow: hidden;
          }
          .dash-card::before {
            content: '';
            position: absolute;
            inset: 0;
            opacity: 0.07;
            border-radius: inherit;
            pointer-events: none;
          }
          .dash-card:active {
            transform: scale(0.98);
          }
          .dash-card:hover {
            box-shadow: var(--shadow-md);
          }

          .dash-card-icon {
            width: 52px; height: 52px;
            border-radius: var(--radius-lg);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            box-shadow: var(--shadow-sm);
          }
          .dash-card-icon .material-symbols-rounded {
            font-size: 1.5rem;
          }

          .dash-card-body {
            flex: 1;
            min-width: 0;
          }
          .dash-card-title {
            font-size: 1.02rem;
            font-weight: 600;
            color: var(--color-text);
            margin-bottom: 2px;
          }
          .dash-card-desc {
            font-size: 0.82rem;
            color: var(--color-text-secondary);
          }

          .dash-card-chevron {
            flex-shrink: 0;
            color: var(--color-text-tertiary);
          }
          .dash-card-chevron .material-symbols-rounded {
            font-size: 1.3rem;
          }

          /* Stagger animation */
          .dash-fade-up {
            opacity: 0;
            transform: translateY(20px);
            animation: dashCardIn 0.5s var(--ease-out) forwards;
          }
          .dash-delay-1 { animation-delay: 0.05s; }
          .dash-delay-2 { animation-delay: 0.12s; }
          .dash-delay-3 { animation-delay: 0.19s; }
          .dash-delay-4 { animation-delay: 0.26s; }
          .dash-delay-5 { animation-delay: 0.33s; }

          @keyframes dashCardIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Greeting anim */
          .dash-top {
            opacity: 0;
            animation: dashCardIn 0.5s var(--ease-out) forwards;
          }
        </style>

        <div class="dash-container">
          <div class="dash-top">
            <div class="dash-greeting">
              <h2>Hello, ${name}! 👋</h2>
              <p>How can I help you today?</p>
            </div>
            <button class="dash-settings-btn" id="dash-settings-btn" aria-label="Settings">
              <span class="material-symbols-rounded">settings</span>
            </button>
          </div>

          <div class="dash-cards" id="dash-cards">
            ${MODULE_CARDS.map((card, i) => `
              <div class="dash-card dash-fade-up dash-delay-${i + 1}" data-screen="${card.screen}">
                <div class="dash-card-icon" style="background: ${card.gradient};">
                  <span class="material-symbols-rounded" style="color: ${card.color};">${card.icon}</span>
                </div>
                <div class="dash-card-body">
                  <div class="dash-card-title">${card.title}</div>
                  <div class="dash-card-desc">${card.desc}</div>
                </div>
                <div class="dash-card-chevron">
                  <span class="material-symbols-rounded">chevron_right</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    onShow() {
      // Settings gear
      document.getElementById('dash-settings-btn')
        .addEventListener('click', () => SB.navigate('screen-settings-profile'));

      // Card navigation (event delegation)
      document.getElementById('dash-cards').addEventListener('click', function (e) {
        const card = e.target.closest('.dash-card');
        if (!card) return;
        const screen = card.dataset.screen;
        if (screen) SB.navigate(screen);
      });
    }
  });

})();
