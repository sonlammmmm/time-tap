import './styles.css';
import { storage } from './state/storage.ts';
import { timerEngine, TimerSnapshot } from './state/timerState.ts';
import { settingsModal } from './ui/settingsModal.ts';
import { soundEngine } from './audio/soundEngine.ts';
import { translations } from './i18n/locales.ts';

function initApp() {
  const root = document.getElementById('app') || document.body;

  root.innerHTML = `
    <div class="shot-app idle" id="shotApp">
      <!-- Top Header -->
      <header class="app-header" id="appHeader">
        <div class="app-brand">
          <span>♠ Poker Shot Clock</span>
          <span class="brand-badge">PRO</span>
        </div>
        <div class="header-actions">
          <button type="button" class="lang-btn" id="headerLangBtn">VI / EN</button>
        </div>
      </header>

      <!-- Stage (Full-screen Tap Target) -->
      <main class="stage" id="stage">
        <div class="num d2" id="num">30</div>
        <p class="shot-hint" id="hint">CHẠM VÀO MÀN HÌNH ĐỂ BẮT ĐẦU</p>
      </main>

      <!-- Bottom Progress Bar -->
      <div class="bar-container" id="barContainer">
        <i class="bar-fill" id="barFill"></i>
      </div>

      <!-- Bottom Dock Controls -->
      <nav class="dock" id="dock">
        <!-- Extend Button -->
        <button type="button" class="dk ext" id="btnExt" title="Extend" aria-label="Extend">+30</button>

        <!-- Pause / Resume Button -->
        <button type="button" class="dk" id="btnPause" title="Pause" aria-label="Pause">
          <svg viewBox="0 0 24 24" id="pauseSvg" aria-hidden="true">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>
          </svg>
        </button>

        <!-- Rotate Screen Button -->
        <button type="button" class="dk" id="btnRot" title="Rotate Screen" aria-label="Rotate Screen">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.5 3.4 3.9 7l3.6 3.6V8.2H14a3.8 3.8 0 0 1 3.8 3.8h2.2A6 6 0 0 0 14 6H7.5V3.4zM16.5 20.6 20.1 17l-3.6-3.6v2.4H10A3.8 3.8 0 0 1 6.2 12H4a6 6 0 0 0 6 6h6.5v2.6z"/>
          </svg>
        </button>

        <!-- Fullscreen Button -->
        <button type="button" class="dk" id="btnFs" title="Fullscreen" aria-label="Fullscreen">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V4h5v2H6v3H4zm11-5h5v5h-2V6h-3V4zM4 15h2v3h3v2H4v-5zm14 0h2v5h-5v-2h3v-3z"/>
          </svg>
        </button>

        <!-- Settings Button -->
        <button type="button" class="dk" id="btnCfg" title="Settings" aria-label="Settings">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"/>
            <path opacity=".55" d="m20.6 13.1.1-1.1-.1-1.1 1.8-1.4a.5.5 0 0 0 .1-.6l-1.7-3a.5.5 0 0 0-.6-.2l-2.1.9a7.6 7.6 0 0 0-1.9-1.1l-.3-2.3a.5.5 0 0 0-.5-.4h-3.4a.5.5 0 0 0-.5.4l-.3 2.3c-.7.3-1.3.6-1.9 1.1l-2.1-.9a.5.5 0 0 0-.6.2l-1.7 3a.5.5 0 0 0 .1.6l1.8 1.4-.1 1.1.1 1.1-1.8 1.4a.5.5 0 0 0-.1.6l1.7 3c.1.2.4.3.6.2l2.1-.9c.6.5 1.2.8 1.9 1.1l.3 2.3c0 .2.2.4.5.4h3.4c.3 0 .5-.2.5-.4l.3-2.3c.7-.3 1.3-.6 1.9-1.1l2.1.9c.2.1.5 0 .6-.2l1.7-3a.5.5 0 0 0-.1-.6l-1.8-1.4z"/>
          </svg>
        </button>
      </nav>
    </div>
  `;

  const shotApp = document.getElementById('shotApp')!;
  const stage = document.getElementById('stage')!;
  const numEl = document.getElementById('num')!;
  const hintEl = document.getElementById('hint')!;
  const barFill = document.getElementById('barFill')!;
  const btnExt = document.getElementById('btnExt')!;
  const btnPause = document.getElementById('btnPause')!;
  const pauseSvg = document.getElementById('pauseSvg')!;
  const btnRot = document.getElementById('btnRot')!;
  const btnFs = document.getElementById('btnFs')!;
  const btnCfg = document.getElementById('btnCfg')!;
  const headerLangBtn = document.getElementById('headerLangBtn')!;

  let prevDigits = '';
  let prevDigitLen = 0;

  // Render timer tick update
  timerEngine.subscribe((snap: TimerSnapshot) => {
    const cfg = storage.getConfig();
    const t = translations[cfg.lang];

    // Numbers display
    const strNum = String(snap.remainingSec);
    if (strNum !== prevDigits) {
      numEl.textContent = strNum;
      if (strNum.length !== prevDigitLen) {
        numEl.className = `num d${Math.min(3, strNum.length)}`;
        prevDigitLen = strNum.length;
      }
      prevDigits = strNum;
    }

    // App state classes
    shotApp.classList.remove('idle', 'run', 'pause', 'end');
    shotApp.classList.add(snap.mode);

    shotApp.classList.toggle('warn', snap.isWarn);
    shotApp.classList.toggle('crit', snap.isCrit);
    shotApp.classList.toggle('nobar', !cfg.bar);
    shotApp.classList.toggle('rot', cfg.rot);

    // Progress bar
    barFill.style.transform = `scaleX(${snap.progressRatio})`;

    // Hints
    if (snap.mode === 'end') {
      hintEl.textContent = t.hintEnd;
    } else if (snap.mode === 'pause') {
      hintEl.textContent = t.hintPause;
    } else {
      hintEl.textContent = t.hintIdle;
    }

    // Pause icon
    if (snap.mode === 'pause') {
      pauseSvg.innerHTML = '<path d="M8 5v14l11-7z"/>';
      btnPause.setAttribute('aria-label', t.btnResume);
    } else {
      pauseSvg.innerHTML = '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>';
      btnPause.setAttribute('aria-label', t.btnPause);
    }

    // Extend button
    if (cfg.ext > 0) {
      btnExt.hidden = false;
      btnExt.textContent = `+${cfg.ext}`;
    } else {
      btnExt.hidden = true;
    }

    btnRot.classList.toggle('on', cfg.rot);
  });

  // Stage tap handler (Reset & Start)
  stage.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    soundEngine.unlock();
    timerEngine.tapStage();
  });

  // Prevent dock taps from triggering stage reset
  document.getElementById('dock')?.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });

  // Button actions
  btnExt.addEventListener('click', (e) => {
    e.stopPropagation();
    timerEngine.extend();
  });

  btnPause.addEventListener('click', (e) => {
    e.stopPropagation();
    timerEngine.togglePause();
  });

  btnRot.addEventListener('click', (e) => {
    e.stopPropagation();
    const cfg = storage.getConfig();
    const nextRot = !cfg.rot;
    storage.saveConfig({ rot: nextRot });
    shotApp.classList.toggle('rot', nextRot);
    btnRot.classList.toggle('on', nextRot);
    soundEngine.vibrate(20);
  });

  btnFs.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  btnCfg.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModal.open();
  });

  headerLangBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const cfg = storage.getConfig();
    const nextLang = cfg.lang === 'vi' ? 'en' : 'vi';
    storage.saveConfig({ lang: nextLang });
    timerEngine.applySettings();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    const key = e.key.toLowerCase();
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      timerEngine.tapStage();
    } else if (key === 'p') {
      timerEngine.togglePause();
    } else if (key === 'e') {
      timerEngine.extend();
    } else if (key === 'r') {
      const cfg = storage.getConfig();
      storage.saveConfig({ rot: !cfg.rot });
      shotApp.classList.toggle('rot', !cfg.rot);
      btnRot.classList.toggle('on', !cfg.rot);
    } else if (key === 'f') {
      toggleFullscreen();
    } else if (key === 's') {
      settingsModal.open();
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
