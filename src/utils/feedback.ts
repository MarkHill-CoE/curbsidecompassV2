// Utility for crisp button click sound synthesis and device haptic feedback

import { ambientAudio } from './ambientAudio';

export type FeedbackType = 'choice' | 'button' | 'submit' | 'toggle';

class FeedbackManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private listeners: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('curbside_feedback_sound');
        if (stored !== null) {
          this.soundEnabled = stored === 'true';
        }
      } catch {
        // Local storage may be restricted in sandbox
      }
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('curbside_feedback_sound', String(enabled));
    } catch {
      // Ignore storage errors
    }
    ambientAudio.setEnabled(enabled);
    this.listeners.forEach((listener) => listener(enabled));
    if (enabled) {
      this.trigger('toggle');
    }
  }

  public toggleSound(): boolean {
    this.setSoundEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Trigger haptic vibration on mobile devices
  public triggerHaptic(type: FeedbackType = 'button'): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') return;

    try {
      switch (type) {
        case 'choice':
          // Crisp micro-tick for question selections and option choices
          navigator.vibrate(10);
          break;
        case 'button':
          // Tactile standard click for buttons
          navigator.vibrate(18);
          break;
        case 'submit':
          // Distinct celebratory double-pulse for submission & final persona
          navigator.vibrate([25, 40, 30]);
          break;
        case 'toggle':
          navigator.vibrate(12);
          break;
      }
    } catch {
      // Vibrations can fail silently if user interacted elsewhere
    }
  }

  // Synthesize crisp, non-intrusive sound effects using Web Audio API
  public playSound(type: FeedbackType = 'button'): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'choice') {
        // 1. Subtle, crisp card/choice click (high transient, quick decay)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.022);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.026);
      } else if (type === 'button') {
        // 2. Firm, tactile mechanical button click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'submit') {
        // 3. Positive two-tone confirmation chime (C5 -> E5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.07, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);

        // Second harmonic note
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.08, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.19);
      } else if (type === 'toggle') {
        // 4. Subtle toggle blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.03);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // Audio playback can occasionally be blocked if user has not interacted
    }
  }

  // Combined trigger for both audio and haptic
  public trigger(type: FeedbackType = 'button'): void {
    this.triggerHaptic(type);
    this.playSound(type);
  }
}

export const feedback = new FeedbackManager();
export const triggerFeedback = (type: FeedbackType = 'button') => feedback.trigger(type);
