(function() {
  'use strict';

  /* ── Screen 17: Quick Reply Home ── */
  SB.registerScreen('screen-reply-home', {
    title: 'Quick Reply',
    showHeader: true,
    showBack: true,
    showNav: true,
    html: function() {
      return `
        <style>
          .reply-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-base);
            padding-bottom: 80px;
          }
          .reply-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: var(--space-lg) var(--space-sm);
            border-radius: var(--radius-lg);
            min-height: 120px;
            cursor: pointer;
            transition: all var(--transition-fast);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.05);
          }
          .reply-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
          .reply-card:active {
            transform: scale(0.96);
          }
          .reply-emoji {
            font-size: 36px;
            margin-bottom: var(--space-sm);
            line-height: 1;
          }
          .reply-text {
            font-weight: var(--font-weight-medium);
            font-size: var(--font-size-base);
            color: var(--color-text);
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .reply-edit-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 32px;
            height: 32px;
            border-radius: var(--radius-full);
            background: rgba(255,255,255,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-secondary);
            opacity: 0;
            transition: opacity 0.2s;
          }
          .reply-card:hover .reply-edit-btn {
            opacity: 1;
          }
        </style>
        <div class="screen-content">
          <div id="reply-grid" class="reply-grid"></div>
          <button id="reply-fab" class="fab animate-scale-in delay-3" aria-label="Create new card">
            <span class="material-symbols-rounded">add</span>
          </button>
        </div>
      `;
    },
    onShow: function() {
      const grid = document.getElementById('reply-grid');
      const cards = SB.Storage.getCards();
      
      grid.innerHTML = cards.map((c, i) => `
        <div class="reply-card animate-fade-in-up" style="background-color: ${c.color}15; animation-delay: ${i * 50}ms;" data-id="${c.id}">
          <div class="reply-edit-btn" data-edit-id="${c.id}">
            <span class="material-symbols-rounded" style="font-size: 18px;">edit</span>
          </div>
          <div class="reply-emoji">${c.emoji}</div>
          <div class="reply-text">${c.text}</div>
        </div>
      `).join('');

      // Delegate clicks
      grid.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.reply-edit-btn');
        if (editBtn) {
          e.stopPropagation();
          SB.navigate('screen-reply-edit', { id: editBtn.dataset.editId });
          return;
        }
        
        const card = e.target.closest('.reply-card');
        if (card) {
          SB.navigate('screen-reply-display', { id: card.dataset.id });
        }
      });

      document.getElementById('reply-fab').addEventListener('click', () => {
        SB.navigate('screen-reply-new');
      });
    }
  });

  /* ── Screen 18: Quick Reply Display ── */
  SB.registerScreen('screen-reply-display', {
    title: '',
    showHeader: false,
    showNav: false,
    html: function(params) {
      var emoji = '';
      var text = '';
      if (params && params.id) {
        var card = SB.Storage.getCards().find(function(c) { return c.id === params.id; });
        if (card) {
          emoji = card.emoji;
          text = card.text;
        }
      }
      return `
        <style>
          .reply-display-screen {
            background-color: #FFFFFF !important;
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--space-2xl);
            text-align: center;
            cursor: pointer;
            position: relative;
          }
          .reply-display-emoji {
            font-size: 80px;
            margin-bottom: var(--space-xl);
            line-height: 1;
          }
          .reply-display-text {
            font-size: 40px;
            font-weight: var(--font-weight-bold);
            color: #1A1A2E !important;
            line-height: 1.2;
            word-break: break-word;
          }
          .reply-display-close {
            position: absolute;
            top: 24px;
            right: 24px;
            color: #9AA5B4;
            font-size: 28px;
            cursor: pointer;
            z-index: 10;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
        <div class="reply-display-screen">
          <span class="material-symbols-rounded reply-display-close">close</span>
          <div class="reply-display-emoji animate-scale-in">${emoji}</div>
          <div class="reply-display-text animate-fade-in-up delay-1">${text}</div>
        </div>
      `;
    },
    onShow: function(params) {
      var screen = SB._currentScreenEl;
      if (!screen) return;
      screen.addEventListener('click', function() {
        SB.back();
      });
    }
  });

  /* ── Screen 19: Quick Reply Edit ── */
  function renderEditorForm(isNew) {
    return `
      <style>
        .emoji-picker {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          justify-content: center;
          padding: var(--space-sm) 0;
        }
        .emoji-chip {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: all 0.2s;
        }
        .emoji-chip.active {
          border-color: var(--color-primary);
          background: rgba(var(--color-primary-rgb), 0.1);
          transform: scale(1.1);
        }
        .color-picker {
          display: flex;
          justify-content: space-between;
          padding: var(--space-sm) 0;
        }
        .color-circle {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          cursor: pointer;
          border: 3px solid transparent;
          transition: all 0.2s;
        }
        .color-circle.active {
          border-color: var(--color-text);
          transform: scale(1.1);
        }
        .preview-box {
          border-radius: var(--radius-lg);
          padding: var(--space-xl) var(--space-base);
          text-align: center;
          margin-top: var(--space-sm);
          min-height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
        }
        .preview-emoji { font-size: 32px; margin-bottom: 8px; }
        .preview-text { font-weight: 500; color: var(--color-text); }
      </style>
      <div class="screen-content flex-col gap-lg pb-xl">
        
        <div class="input-group">
          <label class="input-label text-center">Emoji</label>
          <div class="text-center mb-sm"><span id="current-emoji-display" style="font-size:48px;">💬</span></div>
          <div class="emoji-picker" id="emoji-picker">
            ${['💬','🔁','👂','🐢','✍️','✋','📞','🔇','❓','🙏','👋','😊'].map(e => `<div class="emoji-chip" data-emoji="${e}">${e}</div>`).join('')}
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label">Card Text</label>
          <input type="text" id="reply-edit-text" class="input-field" placeholder="Enter message here" maxlength="60">
        </div>

        <div class="input-group">
          <label class="input-label">Color</label>
          <div class="color-picker" id="color-picker">
            ${['#1A6B8A', '#2E86AB', '#8B5CF6', '#E63946', '#F7B731', '#2DC653'].map(c => `<div class="color-circle" style="background-color: ${c}" data-color="${c}"></div>`).join('')}
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Preview</label>
          <div id="preview-box" class="preview-box">
            <div id="preview-emoji" class="preview-emoji">💬</div>
            <div id="preview-text" class="preview-text">Preview text</div>
          </div>
        </div>

        <div class="mt-auto flex-col gap-base pt-lg">
          <button id="btn-save-card" class="btn btn-primary btn-block btn-lg">${isNew ? 'Create Card' : 'Save Changes'}</button>
          ${!isNew ? '<button id="btn-delete-card" class="btn btn-ghost text-alert btn-block">Delete Card</button>' : ''}
        </div>
      </div>
    `;
  }

  function bindEditorEvents(isNew, params) {
    let currentId = isNew ? null : params.id;
    let card = isNew ? { text: '', emoji: '💬', color: '#1A6B8A' } : SB.Storage.getCards().find(c => c.id === currentId);
    
    if (!card && !isNew) {
      SB.back();
      return;
    }

    const textInput = document.getElementById('reply-edit-text');
    const previewBox = document.getElementById('preview-box');
    const previewEmoji = document.getElementById('preview-emoji');
    const previewText = document.getElementById('preview-text');
    const bigEmoji = document.getElementById('current-emoji-display');

    // Init form
    textInput.value = card.text;
    updatePreview();

    // Select emoji
    document.querySelectorAll('.emoji-chip').forEach(el => {
      if (el.dataset.emoji === card.emoji) el.classList.add('active');
    });

    // Select color
    document.querySelectorAll('.color-circle').forEach(el => {
      if (el.dataset.color === card.color) el.classList.add('active');
    });

    // Bind Emoji click
    document.getElementById('emoji-picker').addEventListener('click', (e) => {
      const chip = e.target.closest('.emoji-chip');
      if (chip) {
        document.querySelectorAll('.emoji-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        card.emoji = chip.dataset.emoji;
        updatePreview();
      }
    });

    // Bind Color click
    document.getElementById('color-picker').addEventListener('click', (e) => {
      const circle = e.target.closest('.color-circle');
      if (circle) {
        document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
        circle.classList.add('active');
        card.color = circle.dataset.color;
        updatePreview();
      }
    });

    // Bind Text input
    textInput.addEventListener('input', () => {
      card.text = textInput.value;
      updatePreview();
    });

    function updatePreview() {
      bigEmoji.textContent = card.emoji;
      previewEmoji.textContent = card.emoji;
      previewText.textContent = card.text || 'Card message...';
      previewBox.style.backgroundColor = card.color + '15';
      previewText.style.fontSize = '20px'; 
    }

    // Save
    document.getElementById('btn-save-card').addEventListener('click', () => {
      if (!card.text.trim()) {
        SB.showToast('Please enter card text', 'error');
        return;
      }
      
      if (isNew) {
        SB.Storage.addCard({ text: card.text.trim(), emoji: card.emoji, category: 'custom', color: card.color });
        SB.showToast('Card created!', 'success');
      } else {
        SB.Storage.updateCard(currentId, { text: card.text.trim(), emoji: card.emoji, color: card.color });
        SB.showToast('Card updated', 'success');
      }
      SB.back();
    });

    // Delete
    if (!isNew) {
      document.getElementById('btn-delete-card').addEventListener('click', () => {
        SB.confirm('Delete Card?', 'This cannot be undone.', 'Delete', () => {
          SB.Storage.deleteCard(currentId);
          SB.showToast('Card deleted', 'info');
          SB.back();
        });
      });
    }
  }

  SB.registerScreen('screen-reply-edit', {
    title: 'Edit Card',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() { return renderEditorForm(false); },
    onShow: function(params) { bindEditorEvents(false, params); }
  });

  /* ── Screen 20: Quick Reply New ── */
  SB.registerScreen('screen-reply-new', {
    title: 'New Card',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() { return renderEditorForm(true); },
    onShow: function() { bindEditorEvents(true, null); }
  });

})();
