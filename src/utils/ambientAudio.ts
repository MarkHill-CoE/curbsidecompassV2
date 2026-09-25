// Ambient City Traffic Audio Manager
// Plays background city traffic ambient noise at 5% volume with seamless, gapless looping.
// Uses Web Audio API AudioBufferSourceNode (loop = true) for continuous, glitch-free looping,
// with HTML5 AudioElement (loop = true + ended event retrigger) as fallback,
// honoring browser autoplay policies on user interaction.

const CANDIDATE_AMBIENT_PATHS = [
  '/city_traffic_ambient.mp3',
  '/audio/city_traffic_ambient.mp3',
  '/traffic_ambient.mp3',
  '/city-traffic.mp3',
  '/audio/city-traffic.mp3'
];

class AmbientAudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  private isPlaying: boolean = false;
  private soundEnabled: boolean = true;
  private volume: number = 0.05; // 5% background volume as requested
  private hasInteracted: boolean = false;
  private listeners: Set<(enabled: boolean, volume: number) => void> = new Set();
  private isBufferLoading: boolean = false;
  private fallbackPathIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('curbside_feedback_sound');
        if (stored !== null) {
          this.soundEnabled = stored === 'true';
        }
      } catch {
        // Storage restricted in iframe
      }

      this.initAudioElement();
      this.initWebAudio();
      this.setupUserGestureListener();
    }
  }

  // Initialize standard HTML5 audio element
  private initAudioElement(): void {
    if (typeof window === 'undefined') return;

    try {
      this.fallbackPathIndex = 0;
      this.audioElement = new Audio(CANDIDATE_AMBIENT_PATHS[0]);
      this.audioElement.loop = true;
      this.audioElement.volume = this.soundEnabled ? this.volume : 0;
      this.audioElement.preload = 'auto';

      // Guaranteed looping watchdog: if native loop attribute fails to cycle
      this.audioElement.addEventListener('ended', () => {
        if (this.soundEnabled && this.isPlaying && !this.activeSourceNode) {
          if (this.audioElement) {
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(() => {});
          }
        }
      });

      this.audioElement.addEventListener('error', () => {
        this.fallbackPathIndex++;
        if (this.fallbackPathIndex < CANDIDATE_AMBIENT_PATHS.length && this.audioElement) {
          const nextPath = CANDIDATE_AMBIENT_PATHS[this.fallbackPathIndex];
          console.warn(`[AmbientAudio] Primary path failed, trying fallback path: ${nextPath}`);
          this.audioElement.src = nextPath;
          this.audioElement.load();
          if (this.isPlaying && this.soundEnabled && !this.activeSourceNode) {
            this.audioElement.play().catch(() => {});
          }
        }
      });
    } catch (err) {
      console.warn('Could not initialize audio element:', err);
    }
  }

  // Initialize Web Audio API for 100% gapless continuous looping
  private initWebAudio(): void {
    if (typeof window === 'undefined' || this.isBufferLoading) return;
    this.isBufferLoading = true;

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtxClass) return;
      this.audioContext = new AudioCtxClass();

      // Create master gain node at 5% volume
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, this.audioContext.currentTime);
      this.gainNode.connect(this.audioContext.destination);

      // Fetch and decode MP3 into memory (with fallback paths)
      const tryFetchBuffer = async () => {
        for (const p of CANDIDATE_AMBIENT_PATHS) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              return await res.arrayBuffer();
            }
          } catch {
            // Try next candidate
          }
        }
        throw new Error('All ambient audio paths failed to load');
      };

      tryFetchBuffer()
        .then((arrayBuffer) => {
          if (!this.audioContext) return;
          return this.audioContext.decodeAudioData(arrayBuffer);
        })
        .then((decodedBuffer) => {
          if (!decodedBuffer) return;
          this.audioBuffer = decodedBuffer;

          // If sound is enabled and user already interacted, start Web Audio gapless loop
          if (this.soundEnabled && this.hasInteracted && !this.activeSourceNode) {
            this.startWebAudioLoop();
          }
        })
        .catch((err) => {
          console.log('Web Audio buffer decode skipped (HTML5 audio will handle playback):', err);
        })
        .finally(() => {
          this.isBufferLoading = false;
        });
    } catch (err) {
      console.warn('Web Audio initialization error:', err);
      this.isBufferLoading = false;
    }
  }

  // Start continuous, sample-accurate loop in Web Audio
  private startWebAudioLoop(): void {
    if (!this.audioContext || !this.audioBuffer || !this.gainNode) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      // Stop any existing source node
      if (this.activeSourceNode) {
        try {
          this.activeSourceNode.stop();
          this.activeSourceNode.disconnect();
        } catch {
          // Ignore
        }
        this.activeSourceNode = null;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;
      source.loop = true; // Seamless infinite looping
      source.loopStart = 0;
      source.loopEnd = this.audioBuffer.duration;

      source.connect(this.gainNode);
      source.start(0);

      // Ramp gain up smoothly to configured volume
      const currTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currTime);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, currTime + 0.5);

      this.activeSourceNode = source;
      this.isPlaying = true;

      // Pause HTML5 audio since Web Audio is handling the loop
      if (this.audioElement && !this.audioElement.paused) {
        this.audioElement.pause();
      }
    } catch (err) {
      console.warn('Failed to start Web Audio loop:', err);
    }
  }

  private stopWebAudioLoop(): void {
    if (!this.audioContext || !this.gainNode) return;

    try {
      const currTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currTime + 0.3);

      setTimeout(() => {
        if (this.activeSourceNode) {
          try {
            this.activeSourceNode.stop();
            this.activeSourceNode.disconnect();
          } catch {
            // Ignore
          }
          this.activeSourceNode = null;
        }
      }, 350);
    } catch {
      // Ignore
    }
  }

  // Modern browsers require a user interaction before playing audio
  private setupUserGestureListener(): void {
    if (typeof window === 'undefined') return;

    const handleUserGesture = () => {
      this.hasInteracted = true;

      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      if (this.soundEnabled && !this.isPlaying) {
        this.play();
      }
    };

    window.addEventListener('click', handleUserGesture, { capture: true });
    window.addEventListener('keydown', handleUserGesture, { capture: true });
    window.addEventListener('touchstart', handleUserGesture, { capture: true, passive: true });
    window.addEventListener('pointerdown', handleUserGesture, { capture: true });
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(newVol: number): void {
    this.volume = Math.max(0, Math.min(1, newVol));

    if (this.soundEnabled) {
      if (this.gainNode && this.audioContext) {
        const currTime = this.audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(currTime);
        this.gainNode.gain.linearRampToValueAtTime(this.volume, currTime + 0.1);
      }
      if (this.audioElement) {
        this.audioElement.volume = this.volume;
      }
    }
    this.notifyListeners();
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('curbside_feedback_sound', String(enabled));
    } catch {
      // Ignore
    }

    if (enabled) {
      this.play();
    } else {
      this.pause();
    }
    this.notifyListeners();
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  public play(): void {
    if (!this.soundEnabled) return;
    this.hasInteracted = true;

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    // 1. Try high-fidelity Web Audio API gapless buffer loop
    if (this.audioBuffer && this.audioContext && this.gainNode) {
      this.startWebAudioLoop();
      return;
    }

    // 2. Fallback to HTML5 audio element with native loop + ended watchdog
    if (this.audioElement) {
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume;

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch((err) => {
            this.isPlaying = false;
            console.log('Background ambient play waiting for user gesture:', err.name);
          });
      }
    }
  }

  public pause(): void {
    this.isPlaying = false;
    this.stopWebAudioLoop();

    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
  }

  public subscribe(listener: (enabled: boolean, volume: number) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.soundEnabled, this.volume));
  }
}

export const ambientAudio = new AmbientAudioManager();
