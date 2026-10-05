import { storage } from '../state/storage.ts';
import { translations } from '../i18n/locales.ts';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private currentAudioElement: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    // Lazy init AudioContext on first touch / click
  }

  public unlock(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.isUnlocked && this.ctx) {
      // Play a short silent buffer to unlock iOS Safari Web Audio
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const node = this.ctx.createBufferSource();
      node.buffer = buffer;
      node.connect(this.ctx.destination);
      node.start(0);
      this.isUnlocked = true;
    }
  }

  private createTone(
    startTime: number,
    freq: number,
    duration: number,
    peakGain: number,
    type: OscillatorType = 'sine'
  ): OscillatorNode | null {
    if (!this.ctx || startTime < this.ctx.currentTime) return null;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);

      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx !== -1) this.activeOscillators.splice(idx, 1);
      };

      this.activeOscillators.push(osc);
      return osc;
    } catch {
      return null;
    }
  }

  public stopAll(): void {
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeOscillators = [];

    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Play custom audio blob / data URL
  public async playCustomAudio(dataUrl: string): Promise<void> {
    this.stopAll();
    try {
      const audio = new Audio(dataUrl);
      this.currentAudioElement = audio;
      await audio.play();
    } catch (e) {
      console.warn('Could not play custom audio', e);
    }
  }

  // Play warning alert (called when timer reaches warn threshold)
  public async playWarningAlert(remainingSec: number): Promise<void> {
    this.unlock();
    const cfg = storage.getConfig();
    if (!cfg.sound) return;

    if (cfg.warnSoundMode === 'record') {
      const customData = await storage.loadAudioBlob('warnAudio');
      if (customData) {
        await this.playCustomAudio(customData);
        return;
      }
      // fallback to synth if no recording
    }

    if (cfg.warnSoundMode === 'tts') {
      this.speakTTS(
        translations[cfg.lang].ttsWarningText.replace('{n}', String(remainingSec)),
        cfg.lang
      );
      return;
    }

    // Default synth warning beep (1568Hz)
    if (this.ctx) {
      this.createTone(this.ctx.currentTime, 1568, 0.16, 0.35, 'sine');
    }
  }

  // Play countdown tick (called on every second during critical countdown)
  public playTick(): void {
    this.unlock();
    const cfg = storage.getConfig();
    if (!cfg.sound || !this.ctx) return;
    this.createTone(this.ctx.currentTime, 880, 0.09, 0.24, 'sine');
  }

  // Play time-up buzzer / sound (called when timer reaches 0)
  public async playTimeUp(): Promise<void> {
    this.unlock();
    const cfg = storage.getConfig();

    this.vibrate([80, 60, 80, 60, 200]);

    if (!cfg.buzz) return;

    if (cfg.timeUpSoundMode === 'record') {
      const customData = await storage.loadAudioBlob('timeUpAudio');
      if (customData) {
        await this.playCustomAudio(customData);
        return;
      }
      // fallback to synth if no recording
    }

    if (cfg.timeUpSoundMode === 'tts') {
      this.speakTTS(translations[cfg.lang].ttsTimeUpText, cfg.lang);
      return;
    }

    // Default dual square wave poker tournament buzzer
    if (this.ctx) {
      const t = this.ctx.currentTime;
      this.createTone(t, 220, 0.5, 0.45, 'square');
      this.createTone(t + 0.45, 165, 0.75, 0.45, 'square');
    }
  }

  // Extension card chime
  public playExtension(): void {
    this.unlock();
    this.vibrate(30);
    const cfg = storage.getConfig();
    if (this.ctx) {
      const t = this.ctx.currentTime;
      this.createTone(t, 1320, 0.15, 0.3, 'sine');
      this.createTone(t + 0.12, 1760, 0.2, 0.35, 'sine');
    }
  }

  public vibrate(pattern: number | number[]): void {
    const cfg = storage.getConfig();
    if (!cfg.vib) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  private speakTTS(text: string, lang: 'vi' | 'en'): void {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
