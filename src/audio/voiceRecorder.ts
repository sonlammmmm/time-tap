export class VoiceRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private pcmData: Float32Array[] = [];
  private recordingSampleRate: number = 44100;

  public get recording(): boolean {
    return this.isRecording;
  }

  public async startRecording(
    onTick?: (seconds: number) => void
  ): Promise<void> {
    if (this.isRecording) return;
    this.audioChunks = [];
    this.pcmData = [];

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.mediaStream = stream;
    this.isRecording = true;
    this.startTime = Date.now();

    if (onTick) {
      this.timerInterval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        onTick(elapsed);
      }, 250);
    }

    // Check MediaRecorder support
    if (typeof MediaRecorder !== 'undefined') {
      const mimeTypes = [
        'audio/mp4',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/aac',
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      try {
        const options: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {};
        const mr = new MediaRecorder(stream, options);
        this.mediaRecorder = mr;

        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        mr.start(100); // 100ms chunks
        return;
      } catch (e) {
        console.warn('MediaRecorder error, falling back to WebAudio WAV recorder', e);
      }
    }

    // Fallback: Web Audio ScriptProcessor WAV recorder (Guaranteed to work on all iOS versions)
    this.startWavRecordingFallback(stream);
  }

  private startWavRecordingFallback(stream: MediaStream): void {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    this.audioContext = ctx;
    this.recordingSampleRate = ctx.sampleRate;

    const source = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    this.scriptProcessor = proc;

    proc.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      const copy = new Float32Array(input.length);
      copy.set(input);
      this.pcmData.push(copy);
    };

    source.connect(proc);
    proc.connect(ctx.destination);
  }

  public async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('Not recording');
    }
    this.isRecording = false;

    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    let audioBlob: Blob;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      audioBlob = await new Promise<Blob>((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const mime = this.mediaRecorder!.mimeType || 'audio/webm';
          resolve(new Blob(this.audioChunks, { type: mime }));
        };
        this.mediaRecorder!.stop();
      });
    } else {
      // Encode PCM to WAV
      audioBlob = this.encodeWAV(this.pcmData, this.recordingSampleRate);
      if (this.scriptProcessor) {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }

    // Release microphone hardware immediately
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    // Convert Blob to Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }

  private encodeWAV(samplesList: Float32Array[], sampleRate: number): Blob {
    let totalLength = 0;
    for (const chunk of samplesList) {
      totalLength += chunk.length;
    }
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of samplesList) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const buffer = new ArrayBuffer(44 + merged.length * 2);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + merged.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count (1 = mono) */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, merged.length * 2, true);

    // write PCM samples (float32 to int16)
    let pcmOffset = 44;
    for (let i = 0; i < merged.length; i++, pcmOffset += 2) {
      const s = Math.max(-1, Math.min(1, merged[i]));
      view.setInt16(pcmOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  // Load custom audio from user file picker
  public static async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const voiceRecorder = new VoiceRecorder();
