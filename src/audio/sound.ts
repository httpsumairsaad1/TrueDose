/**
 * Synthesizes a gentle two-tone chime via Web Audio API.
 * Never uses trademarked or copyrighted sounds.
 */
class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private voiceEnabled: boolean = true;
  private speechQueue: { text: string; voiceType: 'system' | 'elder' }[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    // Initialized on user interaction
  }

  public enableSound(enabled: boolean) {
    this.soundEnabled = enabled;
    if (enabled && !this.audioCtx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      } catch {
        // Silently ignore if blocked
      }
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.speechQueue = [];
    }
  }

  public isSoundOn(): boolean {
    return this.soundEnabled;
  }

  /**
   * Play a pleasant, calm generic two-tone chime (C5 -> E5)
   */
  public playChime() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.connect(gain);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc2.connect(gain);

      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch {
      // Audio fallback: silent
    }
  }

  /**
   * Play a subtle tick / click feedback
   */
  public playClick() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  /**
   * Speak a line using neutral browser SpeechSynthesis
   */
  public speak(text: string, voiceType: 'system' | 'elder' = 'system') {
    if (!this.soundEnabled || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.speechQueue.push({ text, voiceType });
    this.processQueue();
  }

  private processQueue() {
    if (this.isSpeaking || this.speechQueue.length === 0) return;

    const item = this.speechQueue.shift();
    if (!item) return;

    try {
      this.isSpeaking = true;
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = item.voiceType === 'elder' ? 0.9 : 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Pick a standard English voice
        const enVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.processQueue();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.processQueue();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
    }
  }

  public stopAll() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.speechQueue = [];
    this.isSpeaking = false;
  }
}

export const soundEngine = new SoundEngine();
