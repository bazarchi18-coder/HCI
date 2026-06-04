(function() {
  'use strict';

  let demoInterval = null;

  /* ── Screen 23: Media Captions Home ── */
  SB.registerScreen('screen-media-home', {
    title: 'Media Captions',
    showHeader: true,
    showBack: true,
    showNav: true,
    html: function() {
      return `
        <div class="screen-content flex-col gap-lg">
          
          <p class="text-secondary mb-sm">Add real-time captions to videos to help you follow along easily.</p>

          <div class="card card-interactive flex flex-col items-center gap-sm p-xl animate-fade-in-up" id="btn-upload-video">
            <div class="icon-circle-lg" style="background: rgba(var(--color-primary-rgb), 0.1);">
              <span class="material-symbols-rounded text-primary" style="font-size: 40px;">upload_file</span>
            </div>
            <h3 class="mt-sm">Upload Video</h3>
            <p class="text-sm text-tertiary text-center">Select a video from your device</p>
          </div>

          <div class="card card-interactive flex flex-col items-center gap-sm p-xl animate-fade-in-up delay-1" id="btn-demo-video">
            <div class="icon-circle-lg" style="background: rgba(var(--color-success-rgb), 0.1);">
              <span class="material-symbols-rounded text-success" style="font-size: 40px;">play_circle</span>
            </div>
            <h3 class="mt-sm">Demo Video</h3>
            <p class="text-sm text-tertiary text-center">Try with our sample video</p>
          </div>

          <input type="file" id="media-file-input" accept="video/*" class="hidden">

          <div class="mt-auto">
            <button id="btn-media-settings" class="btn btn-ghost btn-block">
              <span class="material-symbols-rounded">settings</span> Caption Settings
            </button>
          </div>
        </div>
      `;
    },
    onShow: function() {
      const fileInput = document.getElementById('media-file-input');
      
      document.getElementById('btn-upload-video').addEventListener('click', () => {
        fileInput.click();
      });
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const objectUrl = URL.createObjectURL(file);
          SB.navigate('screen-media-player', { src: objectUrl, name: file.name, demo: false });
        }
      });

      document.getElementById('btn-demo-video').addEventListener('click', () => {
        SB.navigate('screen-media-player', { demo: true });
      });

      document.getElementById('btn-media-settings').addEventListener('click', () => {
        SB.navigate('screen-media-settings');
      });
    }
  });

  /* ── Screen 24: Media Player ── */
  SB.registerScreen('screen-media-player', {
    title: 'Player',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() {
      return `
        <style>
          .player-container {
            width: 100%;
            background: #000;
            border-radius: var(--radius-lg);
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            aspect-ratio: 16/9;
            margin-bottom: var(--space-base);
          }
          .video-element {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .demo-placeholder {
            position: absolute;
            inset: 0;
            background: var(--gradient-hero);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-bold);
          }
          .caption-display-bar {
            background: rgba(0, 0, 0, 0.8);
            padding: var(--space-lg);
            border-radius: var(--radius-lg);
            min-height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
          }
          .caption-text-main {
            color: white;
            font-weight: var(--font-weight-medium);
            transition: all 0.3s;
          }
          .font-controls {
            position: absolute;
            bottom: var(--space-sm);
            right: var(--space-sm);
            display: flex;
            gap: 4px;
            background: rgba(0,0,0,0.5);
            border-radius: var(--radius-full);
            padding: 4px;
          }
          .font-btn {
            width: 32px;
            height: 32px;
            border-radius: var(--radius-full);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            background: transparent;
          }
          .font-btn:hover { background: rgba(255,255,255,0.2); }
        </style>
        <div class="screen-content">
          <div class="player-container">
            <video id="main-video" class="video-element hidden" controls playsinline></video>
            <div id="demo-overlay" class="demo-placeholder hidden">SoundBridge Demo Video</div>
          </div>
          
          <div id="caption-bar" class="caption-display-bar">
            <div id="caption-text" class="caption-text-main">Waiting for captions...</div>
            <div class="font-controls">
              <button id="btn-font-dec" class="font-btn"><span class="material-symbols-rounded">remove</span></button>
              <button id="btn-font-inc" class="font-btn"><span class="material-symbols-rounded">add</span></button>
            </div>
          </div>
        </div>
      `;
    },
    onShow: function(params) {
      const video = document.getElementById('main-video');
      const demoOverlay = document.getElementById('demo-overlay');
      const captionText = document.getElementById('caption-text');
      const captionBar = document.getElementById('caption-bar');
      
      let settings = SB.Storage.getSettings();
      let currentFontSize = settings.captionFontSize || 20;

      function applyStyles() {
        captionText.style.fontSize = currentFontSize + 'px';
        captionText.style.color = settings.captionTextColor || '#FFFFFF';
        captionBar.style.backgroundColor = `rgba(0, 0, 0, ${settings.captionBgOpacity || 0.8})`;
      }
      applyStyles();

      document.getElementById('btn-font-dec').addEventListener('click', () => {
        currentFontSize = Math.max(14, currentFontSize - 2);
        SB.Storage.updateSettings({ captionFontSize: currentFontSize });
        applyStyles();
      });
      document.getElementById('btn-font-inc').addEventListener('click', () => {
        currentFontSize = Math.min(48, currentFontSize + 2);
        SB.Storage.updateSettings({ captionFontSize: currentFontSize });
        applyStyles();
      });

      if (params && params.demo) {
        demoOverlay.classList.remove('hidden');
        
        const demoLines = [
          'Welcome to SoundBridge media captions.',
          'This feature helps you follow along with any video content.',
          'Captions appear here in real-time as the video plays.',
          'You can adjust the font size and style in caption settings.',
          'SoundBridge — making media accessible for everyone.'
        ];
        
        let i = 0;
        captionText.textContent = demoLines[0];
        
        demoInterval = setInterval(() => {
          i = (i + 1) % demoLines.length;
          captionText.style.opacity = 0;
          setTimeout(() => {
            captionText.textContent = demoLines[i];
            captionText.style.opacity = 1;
          }, 300);
        }, 3500);
        
      } else if (params && params.src) {
        video.classList.remove('hidden');
        video.src = params.src;
        video.play().catch(e => console.log('Autoplay prevented', e));
        captionText.textContent = 'Playing video: ' + (params.name || 'Local file');
        // In a real app we would parse VTT/SRT or use Web Speech here
      }
    },
    onHide: function() {
      if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
      }
      const video = document.getElementById('main-video');
      if (video) {
        video.pause();
        if (video.src.startsWith('blob:')) {
          URL.revokeObjectURL(video.src);
        }
        video.src = '';
      }
    }
  });

  /* ── Screen 25: Media Settings ── */
  SB.registerScreen('screen-media-settings', {
    title: 'Caption Settings',
    showHeader: true,
    showBack: true,
    showNav: false,
    html: function() {
      return `
        <div class="screen-content flex-col gap-lg pb-xl">
          <div class="input-group">
            <div class="flex-between">
              <label class="input-label">Font Size</label>
              <span id="lbl-font-size" class="text-sm font-medium">20px</span>
            </div>
            <input type="range" id="setting-font-size" class="range-slider" min="14" max="40" step="1">
          </div>

          <div class="input-group">
            <div class="flex-between">
              <label class="input-label">Background Opacity</label>
              <span id="lbl-bg-opacity" class="text-sm font-medium">80%</span>
            </div>
            <input type="range" id="setting-bg-opacity" class="range-slider" min="0.3" max="1" step="0.1">
          </div>
          
          <div class="input-group">
            <label class="input-label">Text Color</label>
            <div class="flex gap-sm">
              <div class="chip chip-outline color-option" data-color="#FFFFFF">White</div>
              <div class="chip chip-outline color-option" data-color="#FFEB3B">Yellow</div>
              <div class="chip chip-outline color-option" data-color="#00E5FF">Cyan</div>
            </div>
          </div>

          <div class="input-group">
            <div class="flex-between">
              <label class="input-label">Speech Speed Delay</label>
              <span id="lbl-delay" class="text-sm font-medium">0ms</span>
            </div>
            <input type="range" id="setting-delay" class="range-slider" min="0" max="1000" step="100">
          </div>

          <div class="divider mt-sm mb-sm"></div>
          
          <label class="input-label">Live Preview</label>
          <div style="background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4IAX2o1bQAAAAASUVORK5CYII=') repeat; border-radius: var(--radius-lg); overflow: hidden;">
            <div id="preview-caption-bar" style="padding: 24px; text-align: center; min-height: 100px; display: flex; align-items: center; justify-content: center;">
              <div id="preview-caption-text" style="font-weight: 500; transition: all 0.2s;">This is how captions will look.</div>
            </div>
          </div>
        </div>
      `;
    },
    onShow: function() {
      let settings = SB.Storage.getSettings();
      
      const rngFontSize = document.getElementById('setting-font-size');
      const lblFontSize = document.getElementById('lbl-font-size');
      const rngOpacity = document.getElementById('setting-bg-opacity');
      const lblOpacity = document.getElementById('lbl-bg-opacity');
      const rngDelay = document.getElementById('setting-delay');
      const lblDelay = document.getElementById('lbl-delay');
      
      const prevBar = document.getElementById('preview-caption-bar');
      const prevText = document.getElementById('preview-caption-text');
      
      // Init values
      rngFontSize.value = settings.captionFontSize || 20;
      rngOpacity.value = settings.captionBgOpacity !== undefined ? settings.captionBgOpacity : 0.8;
      rngDelay.value = settings.captionLineDelay || 0;
      let selectedColor = settings.captionTextColor || '#FFFFFF';

      document.querySelectorAll('.color-option').forEach(el => {
        if (el.dataset.color === selectedColor) el.classList.add('active');
      });

      function updatePreviewAndSave() {
        const fSize = parseInt(rngFontSize.value, 10);
        const opacity = parseFloat(rngOpacity.value);
        const delay = parseInt(rngDelay.value, 10);
        
        lblFontSize.textContent = fSize + 'px';
        lblOpacity.textContent = Math.round(opacity * 100) + '%';
        lblDelay.textContent = delay + 'ms';
        
        prevBar.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        prevText.style.fontSize = fSize + 'px';
        prevText.style.color = selectedColor;
        
        SB.Storage.updateSettings({
          captionFontSize: fSize,
          captionBgOpacity: opacity,
          captionTextColor: selectedColor,
          captionLineDelay: delay
        });
      }
      
      updatePreviewAndSave();
      
      rngFontSize.addEventListener('input', updatePreviewAndSave);
      rngOpacity.addEventListener('input', updatePreviewAndSave);
      rngDelay.addEventListener('input', updatePreviewAndSave);
      
      document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          selectedColor = btn.dataset.color;
          updatePreviewAndSave();
        });
      });
    }
  });

})();
