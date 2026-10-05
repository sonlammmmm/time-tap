export interface AppConfig {
  dur: number;
  ext: number;
  warn: number;
  crit: number;
  sound: boolean;
  buzz: boolean;
  vib: boolean;
  wake: boolean;
  bar: boolean;
  rot: boolean;
  lang: 'vi' | 'en';
  warnSoundMode: 'synth' | 'tts' | 'record';
  timeUpSoundMode: 'synth' | 'tts' | 'record';
  warnAudioData?: string; // base64 data url
  timeUpAudioData?: string; // base64 data url
}

export const DEFAULT_CONFIG: AppConfig = {
  dur: 30,
  ext: 30,
  warn: 10,
  crit: 5,
  sound: true,
  buzz: true,
  vib: true,
  wake: true,
  bar: true,
  rot: false,
  lang: 'vi',
  warnSoundMode: 'synth',
  timeUpSoundMode: 'synth',
};

const STORAGE_KEY = 'timetap_poker_shotclock_v1';
const DB_NAME = 'TimeTapAudioDB';
const DB_STORE = 'audio_blobs';

class StorageManager {
  private config: AppConfig = { ...DEFAULT_CONFIG };
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  constructor() {
    this.loadFromLocalStorage();
    this.dbReady = this.initIndexedDB();
  }

  private loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }

  private async initIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) return;
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(DB_STORE)) {
            db.createObjectStore(DB_STORE);
          }
        };
        req.onsuccess = (e: any) => {
          this.db = e.target.result;
          resolve();
        };
        req.onerror = () => resolve();
      } catch (err) {
        resolve();
      }
    });
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public async saveConfig(cfg: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...cfg };
    try {
      // Don't save huge audio data directly in localStorage if possible, or save small base64
      const clone = { ...this.config };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clone));
    } catch (e) {
      console.warn('LocalStorage save error, fallback to IndexedDB', e);
    }

    if (cfg.warnAudioData !== undefined) {
      await this.saveAudioBlob('warnAudio', cfg.warnAudioData);
    }
    if (cfg.timeUpAudioData !== undefined) {
      await this.saveAudioBlob('timeUpAudio', cfg.timeUpAudioData);
    }
  }

  public async saveAudioBlob(key: 'warnAudio' | 'timeUpAudio', dataUrl?: string): Promise<void> {
    await this.dbReady;
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        if (dataUrl) {
          store.put(dataUrl, key);
        } else {
          store.delete(key);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async loadAudioBlob(key: 'warnAudio' | 'timeUpAudio'): Promise<string | undefined> {
    await this.dbReady;
    if (!this.db) return this.config[key === 'warnAudio' ? 'warnAudioData' : 'timeUpAudioData'];
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result || this.config[key === 'warnAudio' ? 'warnAudioData' : 'timeUpAudioData']);
        };
        req.onerror = () => {
          resolve(this.config[key === 'warnAudio' ? 'warnAudioData' : 'timeUpAudioData']);
        };
      } catch {
        resolve(this.config[key === 'warnAudio' ? 'warnAudioData' : 'timeUpAudioData']);
      }
    });
  }
}

export const storage = new StorageManager();
