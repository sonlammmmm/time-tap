import { storage, AppConfig } from '../state/storage.ts';
import { translations, Translation } from '../i18n/locales.ts';
import { voiceRecorder } from '../audio/voiceRecorder.ts';
import { soundEngine } from '../audio/soundEngine.ts';
import { timerEngine } from '../state/timerState.ts';

export class SettingsModal {
  private backdrop: HTMLElement;
  private isOpen: boolean = false;
  private recordingType: 'warn' | 'timeUp' | null = null;
  private recordingTimerInterval: number | null = null;
  private recordingElapsed: number = 0;

  constructor() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'sheet-backdrop';
    document.body.appendChild(this.backdrop);

    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  public open(): void {
    this.isOpen = true;
    this.render();
    this.backdrop.classList.add('active');
  }

  public close(): void {
    if (this.recordingType) {
      this.cancelRecording();
    }
    soundEngine.stopAll();
    this.isOpen = false;
    this.backdrop.classList.remove('active');
    timerEngine.applySettings();
  }

  private async cancelRecording(): Promise<void> {
    if (voiceRecorder.recording) {
      try {
        await voiceRecorder.stopRecording();
      } catch {}
    }
    this.recordingType = null;
    if (this.recordingTimerInterval !== null) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }
  }

  public async render(): Promise<void> {
    const cfg = storage.getConfig();
    const t: Translation = translations[cfg.lang];

    const hasWarnAudio = !!(await storage.loadAudioBlob('warnAudio'));
    const hasTimeUpAudio = !!(await storage.loadAudioBlob('timeUpAudio'));

    const durPresets = [15, 20, 30, 45, 60];
    const extPresets = [0, 15, 30, 60];

    this.backdrop.innerHTML = `
      <div class="sheet-modal" role="dialog" aria-modal="true" aria-labelledby="cfgTitle">
        <div class="sheet-head">
          <h2 id="cfgTitle">${t.settingsTitle}</h2>
          <button type="button" class="sheet-x" id="btnCloseX" aria-label="${t.close}">×</button>
        </div>

        <div class="sheet-body">
          <!-- Shot clock length -->
          <div class="sheet-row">
            <span class="row-label">${t.rowDur}</span>
            <div class="opts-container" id="durOpts">
              ${durPresets
                .map(
                  (d) => `
                <button type="button" class="opt-btn ${cfg.dur === d ? 'active' : ''}" data-dur="${d}">${d}s</button>
              `
                )
                .join('')}
              <div class="opt-input-wrapper">
                <input class="num-in" id="inDur" type="number" min="3" max="600" step="1" value="${cfg.dur}">
                <span class="unit-label">${t.secUnit}</span>
              </div>
            </div>
          </div>

          <!-- Time extension card -->
          <div class="sheet-row">
            <span class="row-label">${t.rowExt}</span>
            <div class="opts-container" id="extOpts">
              ${extPresets
                .map(
                  (e) => `
                <button type="button" class="opt-btn ${cfg.ext === e ? 'active' : ''}" data-ext="${e}">
                  ${e === 0 ? t.extOff : `+${e}s`}
                </button>
              `
                )
                .join('')}
              <div class="opt-input-wrapper">
                <input class="num-in" id="inExt" type="number" min="0" max="300" step="5" value="${cfg.ext}">
                <span class="unit-label">${t.secUnit}</span>
              </div>
            </div>
          </div>

          <!-- Colour change thresholds -->
          <div class="sheet-row">
            <span class="row-label">${t.rowThreshold}</span>
            <div class="opts-container">
              <div class="pair-threshold warn">
                <span class="threshold-badge">${t.colorWarn}</span>
                <input class="num-in" id="inWarn" type="number" min="1" max="300" value="${cfg.warn}">
                <span class="unit-label">${t.secUnit}</span>
              </div>
              <div class="pair-threshold crit">
                <span class="threshold-badge">${t.colorCrit}</span>
                <input class="num-in" id="inCrit" type="number" min="1" max="100" value="${cfg.crit}">
                <span class="unit-label">${t.secUnit}</span>
              </div>
            </div>
          </div>

          <!-- Custom Sounds & Recording Section -->
          <div class="sound-section">
            <span class="sound-section-title">${t.soundSectionTitle}</span>

            <!-- Warning sound -->
            <div class="sound-item">
              <span class="sound-item-title">${t.warnSoundTitle}</span>
              <span class="sound-item-desc">${t.recordPromptWarn}</span>
              
              <div class="sound-mode-selector">
                <button type="button" class="sound-mode-btn ${cfg.warnSoundMode === 'synth' ? 'active' : ''}" id="btnWarnSynth">
                  ${t.soundModeSynth}
                </button>
                <button type="button" class="sound-mode-btn ${cfg.warnSoundMode === 'tts' ? 'active' : ''}" id="btnWarnTTS">
                  ${t.soundModeTTS}
                </button>
                <button type="button" class="sound-mode-btn ${cfg.warnSoundMode === 'record' ? 'active' : ''}" id="btnWarnRecord">
                  ${t.soundModeRecord}
                </button>
              </div>

              <!-- Custom record UI for Warning -->
              <div class="recorder-box" id="warnRecordBox" ${cfg.warnSoundMode === 'record' ? '' : 'style="display:none;"'}>
                <div class="recorder-status-row">
                  <span id="warnRecStatus">
                    ${
                      this.recordingType === 'warn'
                        ? `<span class="recording-badge"><i class="recording-dot"></i> Đang ghi âm... 0:${String(this.recordingElapsed).padStart(2, '0')}</span>`
                        : hasWarnAudio
                        ? `<span style="color:var(--green-bright);font-weight:700;">${t.recordStatusHas}</span>`
                        : `<span style="color:var(--muted);">${t.recordStatusEmpty}</span>`
                    }
                  </span>
                </div>
                <div class="recorder-actions">
                  ${
                    this.recordingType === 'warn'
                      ? `<button type="button" class="rec-btn record-active" id="btnStopWarnRec">${t.recordStop}</button>`
                      : `<button type="button" class="rec-btn" id="btnStartWarnRec">${t.recordStart}</button>`
                  }
                  ${
                    hasWarnAudio && this.recordingType !== 'warn'
                      ? `
                    <button type="button" class="rec-btn play" id="btnPlayWarnRec">${t.recordTest}</button>
                    <button type="button" class="rec-btn delete" id="btnDeleteWarnRec">${t.recordDelete}</button>
                  `
                      : ''
                  }
                  <label class="rec-btn" style="cursor:pointer;">
                    ${t.recordUpload}
                    <input type="file" id="fileWarnUpload" accept="audio/*" style="display:none;">
                  </label>
                </div>
              </div>
            </div>

            <!-- Time up sound -->
            <div class="sound-item" style="margin-top:8px;">
              <span class="sound-item-title">${t.timeUpSoundTitle}</span>
              <span class="sound-item-desc">${t.recordPromptTimeUp}</span>

              <div class="sound-mode-selector">
                <button type="button" class="sound-mode-btn ${cfg.timeUpSoundMode === 'synth' ? 'active' : ''}" id="btnTimeUpSynth">
                  ${t.soundModeSynth}
                </button>
                <button type="button" class="sound-mode-btn ${cfg.timeUpSoundMode === 'tts' ? 'active' : ''}" id="btnTimeUpTTS">
                  ${t.soundModeTTS}
                </button>
                <button type="button" class="sound-mode-btn ${cfg.timeUpSoundMode === 'record' ? 'active' : ''}" id="btnTimeUpRecord">
                  ${t.soundModeRecord}
                </button>
              </div>

              <!-- Custom record UI for Time Up -->
              <div class="recorder-box" id="timeUpRecordBox" ${cfg.timeUpSoundMode === 'record' ? '' : 'style="display:none;"'}>
                <div class="recorder-status-row">
                  <span id="timeUpRecStatus">
                    ${
                      this.recordingType === 'timeUp'
                        ? `<span class="recording-badge"><i class="recording-dot"></i> Đang ghi âm... 0:${String(this.recordingElapsed).padStart(2, '0')}</span>`
                        : hasTimeUpAudio
                        ? `<span style="color:var(--green-bright);font-weight:700;">${t.recordStatusHas}</span>`
                        : `<span style="color:var(--muted);">${t.recordStatusEmpty}</span>`
                    }
                  </span>
                </div>
                <div class="recorder-actions">
                  ${
                    this.recordingType === 'timeUp'
                      ? `<button type="button" class="rec-btn record-active" id="btnStopTimeUpRec">${t.recordStop}</button>`
                      : `<button type="button" class="rec-btn" id="btnStartTimeUpRec">${t.recordStart}</button>`
                  }
                  ${
                    hasTimeUpAudio && this.recordingType !== 'timeUp'
                      ? `
                    <button type="button" class="rec-btn play" id="btnPlayTimeUpRec">${t.recordTest}</button>
                    <button type="button" class="rec-btn delete" id="btnDeleteTimeUpRec">${t.recordDelete}</button>
                  `
                      : ''
                  }
                  <label class="rec-btn" style="cursor:pointer;">
                    ${t.recordUpload}
                    <input type="file" id="fileTimeUpUpload" accept="audio/*" style="display:none;">
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Toggles -->
          <div class="sheet-tog-row">
            <span class="tog-text">${t.togSound}</span>
            <button type="button" class="tog-switch ${cfg.sound ? 'on' : ''}" id="togSound" role="switch" aria-checked="${cfg.sound}"></button>
          </div>

          <div class="sheet-tog-row">
            <span class="tog-text">${t.togBuzz}</span>
            <button type="button" class="tog-switch ${cfg.buzz ? 'on' : ''}" id="togBuzz" role="switch" aria-checked="${cfg.buzz}"></button>
          </div>

          <div class="sheet-tog-row">
            <span class="tog-text">${t.togVib}</span>
            <button type="button" class="tog-switch ${cfg.vib ? 'on' : ''}" id="togVib" role="switch" aria-checked="${cfg.vib}"></button>
          </div>

          <div class="sheet-tog-row">
            <span class="tog-text">${t.togWake}</span>
            <button type="button" class="tog-switch ${cfg.wake ? 'on' : ''}" id="togWake" role="switch" aria-checked="${cfg.wake}"></button>
          </div>

          <div class="sheet-tog-row">
            <span class="tog-text">${t.togBar}</span>
            <button type="button" class="tog-switch ${cfg.bar ? 'on' : ''}" id="togBar" role="switch" aria-checked="${cfg.bar}"></button>
          </div>

          <div class="sheet-tog-row">
            <span class="tog-text">${t.langLabel}</span>
            <button type="button" class="opt-btn active" id="btnToggleLang">${cfg.lang === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇺🇸'}</button>
          </div>
        </div>

        <div class="sheet-foot">
          <button type="button" class="prim-btn" id="btnClosePrim">${t.close}</button>
          <p class="sheet-tips">${t.iosTip}</p>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const getEl = (id: string) => document.getElementById(id);

    getEl('btnCloseX')?.addEventListener('click', () => this.close());
    getEl('btnClosePrim')?.addEventListener('click', () => this.close());

    // Duration presets
    document.querySelectorAll('#durOpts .opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = Number((btn as HTMLElement).dataset.dur);
        storage.saveConfig({ dur: val });
        this.render();
      });
    });

    const inDur = getEl('inDur') as HTMLInputElement;
    inDur?.addEventListener('change', () => {
      const val = Math.max(3, Math.min(600, Number(inDur.value) || 30));
      storage.saveConfig({ dur: val });
      this.render();
    });

    // Extension presets
    document.querySelectorAll('#extOpts .opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = Number((btn as HTMLElement).dataset.ext);
        storage.saveConfig({ ext: val });
        this.render();
      });
    });

    const inExt = getEl('inExt') as HTMLInputElement;
    inExt?.addEventListener('change', () => {
      const val = Math.max(0, Math.min(300, Number(inExt.value) || 0));
      storage.saveConfig({ ext: val });
      this.render();
    });

    // Color thresholds
    const inWarn = getEl('inWarn') as HTMLInputElement;
    inWarn?.addEventListener('change', () => {
      const val = Math.max(1, Math.min(300, Number(inWarn.value) || 10));
      storage.saveConfig({ warn: val });
      this.render();
    });

    const inCrit = getEl('inCrit') as HTMLInputElement;
    inCrit?.addEventListener('change', () => {
      const val = Math.max(1, Math.min(100, Number(inCrit.value) || 5));
      storage.saveConfig({ crit: val });
      this.render();
    });

    // Sound mode buttons
    getEl('btnWarnSynth')?.addEventListener('click', () => {
      storage.saveConfig({ warnSoundMode: 'synth' });
      soundEngine.playWarningAlert(10);
      this.render();
    });
    getEl('btnWarnTTS')?.addEventListener('click', () => {
      storage.saveConfig({ warnSoundMode: 'tts' });
      soundEngine.playWarningAlert(10);
      this.render();
    });
    getEl('btnWarnRecord')?.addEventListener('click', () => {
      storage.saveConfig({ warnSoundMode: 'record' });
      this.render();
    });

    getEl('btnTimeUpSynth')?.addEventListener('click', () => {
      storage.saveConfig({ timeUpSoundMode: 'synth' });
      soundEngine.playTimeUp();
      this.render();
    });
    getEl('btnTimeUpTTS')?.addEventListener('click', () => {
      storage.saveConfig({ timeUpSoundMode: 'tts' });
      soundEngine.playTimeUp();
      this.render();
    });
    getEl('btnTimeUpRecord')?.addEventListener('click', () => {
      storage.saveConfig({ timeUpSoundMode: 'record' });
      this.render();
    });

    // Voice recording for Warning
    getEl('btnStartWarnRec')?.addEventListener('click', async () => {
      try {
        this.recordingType = 'warn';
        this.recordingElapsed = 0;
        await voiceRecorder.startRecording((sec) => {
          this.recordingElapsed = sec;
          const status = getEl('warnRecStatus');
          if (status) {
            status.innerHTML = `<span class="recording-badge"><i class="recording-dot"></i> Đang ghi âm... 0:${String(sec).padStart(2, '0')}</span>`;
          }
        });
        this.render();
      } catch (err: any) {
        alert('Không thể truy cập microphone. Vui lòng cấp quyền micro trong cài đặt: ' + err.message);
        this.recordingType = null;
        this.render();
      }
    });

    getEl('btnStopWarnRec')?.addEventListener('click', async () => {
      try {
        const dataUrl = await voiceRecorder.stopRecording();
        await storage.saveConfig({ warnAudioData: dataUrl, warnSoundMode: 'record' });
        this.recordingType = null;
        soundEngine.playCustomAudio(dataUrl);
        this.render();
      } catch (e: any) {
        alert('Lỗi lưu ghi âm: ' + e.message);
        this.recordingType = null;
        this.render();
      }
    });

    getEl('btnPlayWarnRec')?.addEventListener('click', async () => {
      const data = await storage.loadAudioBlob('warnAudio');
      if (data) soundEngine.playCustomAudio(data);
    });

    getEl('btnDeleteWarnRec')?.addEventListener('click', async () => {
      await storage.saveAudioBlob('warnAudio', undefined);
      await storage.saveConfig({ warnAudioData: undefined });
      this.render();
    });

    const fileWarnUpload = getEl('fileWarnUpload') as HTMLInputElement;
    fileWarnUpload?.addEventListener('change', async () => {
      if (fileWarnUpload.files && fileWarnUpload.files[0]) {
        const dataUrl = await VoiceRecorder.fileToDataUrl(fileWarnUpload.files[0]);
        await storage.saveConfig({ warnAudioData: dataUrl, warnSoundMode: 'record' });
        soundEngine.playCustomAudio(dataUrl);
        this.render();
      }
    });

    // Voice recording for Time Up
    getEl('btnStartTimeUpRec')?.addEventListener('click', async () => {
      try {
        this.recordingType = 'timeUp';
        this.recordingElapsed = 0;
        await voiceRecorder.startRecording((sec) => {
          this.recordingElapsed = sec;
          const status = getEl('timeUpRecStatus');
          if (status) {
            status.innerHTML = `<span class="recording-badge"><i class="recording-dot"></i> Đang ghi âm... 0:${String(sec).padStart(2, '0')}</span>`;
          }
        });
        this.render();
      } catch (err: any) {
        alert('Không thể truy cập microphone. Vui lòng cấp quyền micro trong cài đặt: ' + err.message);
        this.recordingType = null;
        this.render();
      }
    });

    getEl('btnStopTimeUpRec')?.addEventListener('click', async () => {
      try {
        const dataUrl = await voiceRecorder.stopRecording();
        await storage.saveConfig({ timeUpAudioData: dataUrl, timeUpSoundMode: 'record' });
        this.recordingType = null;
        soundEngine.playCustomAudio(dataUrl);
        this.render();
      } catch (e: any) {
        alert('Lỗi lưu ghi âm: ' + e.message);
        this.recordingType = null;
        this.render();
      }
    });

    getEl('btnPlayTimeUpRec')?.addEventListener('click', async () => {
      const data = await storage.loadAudioBlob('timeUpAudio');
      if (data) soundEngine.playCustomAudio(data);
    });

    getEl('btnDeleteTimeUpRec')?.addEventListener('click', async () => {
      await storage.saveAudioBlob('timeUpAudio', undefined);
      await storage.saveConfig({ timeUpAudioData: undefined });
      this.render();
    });

    const fileTimeUpUpload = getEl('fileTimeUpUpload') as HTMLInputElement;
    fileTimeUpUpload?.addEventListener('change', async () => {
      if (fileTimeUpUpload.files && fileTimeUpUpload.files[0]) {
        const dataUrl = await VoiceRecorder.fileToDataUrl(fileTimeUpUpload.files[0]);
        await storage.saveConfig({ timeUpAudioData: dataUrl, timeUpSoundMode: 'record' });
        soundEngine.playCustomAudio(dataUrl);
        this.render();
      }
    });

    // Toggles
    const toggleConfigKey = (id: string, key: keyof AppConfig) => {
      getEl(id)?.addEventListener('click', () => {
        const cur = storage.getConfig()[key] as boolean;
        storage.saveConfig({ [key]: !cur } as any);
        soundEngine.vibrate(15);
        this.render();
      });
    };

    toggleConfigKey('togSound', 'sound');
    toggleConfigKey('togBuzz', 'buzz');
    toggleConfigKey('togVib', 'vib');
    toggleConfigKey('togWake', 'wake');
    toggleConfigKey('togBar', 'bar');

    // Language toggle
    getEl('btnToggleLang')?.addEventListener('click', () => {
      const cur = storage.getConfig().lang;
      const next = cur === 'vi' ? 'en' : 'vi';
      storage.saveConfig({ lang: next });
      this.render();
    });
  }
}

export const settingsModal = new SettingsModal();
