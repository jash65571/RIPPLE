const SOUND_LEVELS = {
  effectGain: 0.08,
  musicGain: 0.018,
  successFrequencies: [392, 523.25, 659.25],
  failureFrequencies: [220, 196],
  noteSeconds: 0.14,
} as const;

class SoundEngine {
  #context: AudioContext | null = null;
  #musicOscillator: OscillatorNode | null = null;

  async enable(): Promise<AudioContext | null> {
    this.#context ??= new AudioContext();
    if (this.#context.state === 'suspended') await this.#context.resume();
    return this.#context;
  }

  async effect(kind: 'success' | 'failure', enabled: boolean): Promise<void> {
    if (!enabled) return;
    const context = await this.enable();
    if (context === null) return;
    const frequencies = kind === 'success' ? SOUND_LEVELS.successFrequencies : SOUND_LEVELS.failureFrequencies;
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * SOUND_LEVELS.noteSeconds;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(SOUND_LEVELS.effectGain, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + SOUND_LEVELS.noteSeconds);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + SOUND_LEVELS.noteSeconds);
    });
  }

  async setMusic(enabled: boolean): Promise<void> {
    if (!enabled) {
      this.stopMusic();
      return;
    }
    const context = await this.enable();
    if (context === null || this.#musicOscillator !== null) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 98;
    gain.gain.value = SOUND_LEVELS.musicGain;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    this.#musicOscillator = oscillator;
  }

  stopMusic(): void {
    this.#musicOscillator?.stop();
    this.#musicOscillator = null;
  }

  suspend(): void {
    void this.#context?.suspend();
  }
}

export const soundEngine = new SoundEngine();
