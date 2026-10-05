import { storage, AppConfig } from './storage.ts';
import { soundEngine } from '../audio/soundEngine.ts';

export type TimerMode = 'idle' | 'run' | 'pause' | 'end';

export interface TimerSnapshot {
  mode: TimerMode;
  remainingMs: number;
  remainingSec: number;
  progressRatio: number;
  isWarn: boolean;
  isCrit: boolean;
  span: number;
}

export class TimerEngine {
  private mode: TimerMode = 'idle';
  private endAt: number = 0;
  private left: number = 0;
  private span: number = 0;
  private animFrameId: number | null = null;
  private listeners: ((snap: TimerSnapshot) => void)[] = [];
  private warningTriggered: boolean = false;
  private lastTickedSec: number = -1;
  private wakeLockSentinel: any = null;
  private noSleepVideo: HTMLVideoElement | null = null;

  constructor() {
    const cfg = storage.getConfig();
    this.span = cfg.dur * 1000;

    // Handle visibility changes (e.g. user leaves/returns to app)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (this.mode === 'run') {
          this.requestWakeLock();
          soundEngine.unlock();
        }
        this.notify();
      }
    });
  }

  public subscribe(fn: (snap: TimerSnapshot) => void): () => void {
    this.listeners.push(fn);
    fn(this.getSnapshot());
    return () => {
      const idx = this.listeners.indexOf(fn);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  public getSnapshot(): TimerSnapshot {
    const cfg = storage.getConfig();
    let remainingMs = 0;
    if (this.mode === 'run') {
      remainingMs = Math.max(0, this.endAt - Date.now());
    } else if (this.mode === 'pause') {
      remainingMs = Math.max(0, this.left);
    } else if (this.mode === 'end') {
      remainingMs = 0;
    } else {
      // idle
      remainingMs = cfg.dur * 1000;
    }

    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    const span = this.span > 0 ? this.span : cfg.dur * 1000;
    const progressRatio = span > 0 ? Math.max(0, Math.min(1, remainingMs / span)) : 0;
    const isRunning = this.mode === 'run';

    const isCrit = isRunning && remainingSec <= cfg.crit && remainingSec > 0;
    const isWarn = isRunning && remainingSec <= cfg.warn && remainingSec > cfg.crit;

    return {
      mode: this.mode,
      remainingMs,
      remainingSec,
      progressRatio,
      isWarn,
      isCrit,
      span,
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  // Tap anywhere on the stage: starts or resets timer
  public tapStage(): void {
    soundEngine.unlock();
    const cfg = storage.getConfig();

    soundEngine.stopAll();
    soundEngine.vibrate(15);

    this.span = cfg.dur * 1000;
    this.endAt = Date.now() + this.span;
    this.mode = 'run';
    this.warningTriggered = false;
    this.lastTickedSec = -1;

    if (cfg.wake) {
      this.requestWakeLock();
    }

    this.startLoop();
    this.notify();
  }

  // Pause / Resume toggle
  public togglePause(): void {
    soundEngine.unlock();
    const cfg = storage.getConfig();

    if (this.mode === 'run') {
      this.left = Math.max(0, this.endAt - Date.now());
      this.mode = 'pause';
      soundEngine.stopAll();
      soundEngine.vibrate(20);
      this.stopLoop();
      this.notify();
    } else if (this.mode === 'pause') {
      this.endAt = Date.now() + this.left;
      this.mode = 'run';
      soundEngine.vibrate(20);
      if (cfg.wake) this.requestWakeLock();
      this.startLoop();
      this.notify();
    }
  }

  // Extend button pressed (+30s or +ext)
  public extend(): void {
    const cfg = storage.getConfig();
    if (cfg.ext <= 0) return;

    soundEngine.unlock();
    const addMs = cfg.ext * 1000;

    if (this.mode === 'run') {
      this.endAt += addMs;
      this.span += addMs;
    } else if (this.mode === 'pause') {
      this.left += addMs;
      this.span += addMs;
    } else {
      // idle or end
      this.endAt = Date.now() + addMs;
      this.span = addMs;
      this.mode = 'run';
      if (cfg.wake) this.requestWakeLock();
      this.startLoop();
    }

    // Reset warning state if extended above warning threshold
    const curRemainingSec = Math.ceil((this.endAt - Date.now()) / 1000);
    if (curRemainingSec > cfg.warn) {
      this.warningTriggered = false;
    }

    soundEngine.playExtension();
    this.notify();
  }

  // Update timer parameters from settings
  public applySettings(): void {
    const cfg = storage.getConfig();
    if (this.mode === 'idle' || this.mode === 'end') {
      this.span = cfg.dur * 1000;
      this.mode = 'idle';
    }
    this.notify();
  }

  private startLoop(): void {
    if (this.animFrameId !== null) return;
    const tick = () => {
      if (this.mode !== 'run') {
        this.animFrameId = null;
        return;
      }

      const leftMs = Math.max(0, this.endAt - Date.now());
      const remainingSec = Math.max(0, Math.ceil(leftMs / 1000));
      const cfg = storage.getConfig();

      // Warning alert trigger
      if (remainingSec <= cfg.warn && !this.warningTriggered && remainingSec > 0) {
        this.warningTriggered = true;
        soundEngine.playWarningAlert(cfg.warn);
      }

      // Critical ticking trigger
      if (remainingSec <= cfg.crit && remainingSec > 0 && remainingSec !== this.lastTickedSec) {
        this.lastTickedSec = remainingSec;
        soundEngine.playTick();
        soundEngine.vibrate(25);
      }

      // Time up
      if (leftMs <= 0) {
        this.mode = 'end';
        this.stopLoop();
        this.releaseWakeLock();
        soundEngine.playTimeUp();
        this.notify();
        return;
      }

      this.notify();
      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private async requestWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        return;
      } catch {}
    }

    // iOS fallback: muted tiny video loop
    try {
      if (!this.noSleepVideo) {
        const vid = document.createElement('video');
        vid.setAttribute('playsinline', '');
        vid.setAttribute('muted', '');
        vid.muted = true;
        vid.loop = true;
        // 1x1 transparent webm or mp4 base64
        vid.src = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAADpmcmVlAAAAWG1kYXQAAAK7AAYAAAAAAAE';
        vid.style.position = 'fixed';
        vid.style.top = '-100px';
        vid.style.width = '1px';
        vid.style.height = '1px';
        vid.style.opacity = '0.01';
        document.body.appendChild(vid);
        this.noSleepVideo = vid;
      }
      this.noSleepVideo.play().catch(() => {});
    } catch {}
  }

  private releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch {}
      this.wakeLockSentinel = null;
    }
    if (this.noSleepVideo) {
      try {
        this.noSleepVideo.pause();
      } catch {}
    }
  }
}

export const timerEngine = new TimerEngine();
