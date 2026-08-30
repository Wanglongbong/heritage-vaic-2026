/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class HeritageSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private currentActiveAudio: HTMLAudioElement | null = null;
  private currentStationTrackAudio: HTMLAudioElement | null = null;
  private stationTrackListeners: {
    onTimeUpdate?: (current: number, duration: number) => void;
    onEnd?: () => void;
    onError?: () => void;
  } = {};

  constructor() {
    // Check localStorage in browser
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('heritage-muted');
        if (savedMute !== null) {
          this.isMuted = JSON.parse(savedMute);
        }
      } catch (e) {
        console.warn('Failed reading heritage-muted state from localStorage', e);
      }
    }
  }

  public initAudioContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.warn('Could not resume AudioContext', err));
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('heritage-muted', JSON.stringify(muted));
    } catch (e) {
      console.warn('Failed writing heritage-muted to localStorage', e);
    }

    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.08, this.ctx.currentTime);
    }

    if (this.currentActiveAudio) {
      this.currentActiveAudio.muted = muted;
    }
    if (this.currentStationTrackAudio) {
      this.currentStationTrackAudio.muted = muted;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play gentle UI click / bell chime
  public playChime(freq: number = 587.33, duration: number = 0.4) {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + duration);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Error playing chime', e);
    }
  }

  // Play lantern focus discovery resonance
  public playLanternDiscovery() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.06, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.6);
      });
    } catch (e) {
      console.warn('Error playing lantern discovery', e);
    }
  }

  // Traditional pentatonic musical harmony preview for artifacts
  public playArtifactPreview(soundType: string) {
    this.stopStationTrack();
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C Pentatonic

      baseFreqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = soundType === 'silk-breeze' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.18);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + i * 0.18 + 0.8);

        gain.gain.setValueAtTime(0.08, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.9);
      });
    } catch (e) {
      console.warn('Error playing artifact sound preview', e);
    }
  }

  // Play unlocked station audio track (e.g. Ca Trù 22s recording, Quan họ ensemble)
  public playStationTrack(
    src: string,
    durationSeconds: number,
    listeners: {
      onTimeUpdate?: (current: number, duration: number) => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    this.stopStationTrack();
    this.stationTrackListeners = listeners;

    // Create synthesized fallback audio generator if local file is missing or failed
    try {
      const audio = new Audio(src);
      audio.muted = this.isMuted;
      this.currentStationTrackAudio = audio;

      audio.ontimeupdate = () => {
        if (listeners.onTimeUpdate) {
          listeners.onTimeUpdate(audio.currentTime, audio.duration || durationSeconds);
        }
      };

      audio.onended = () => {
        if (listeners.onEnd) listeners.onEnd();
      };

      audio.onerror = () => {
        console.info('Using WebAudio synthesizer mode for station track');
        this.playSyntheticStationTrack(durationSeconds, listeners);
      };

      audio.play().catch((err) => {
        console.info('Audio playback failed or format unparsed; activating procedural harmonic stream', err);
        this.playSyntheticStationTrack(durationSeconds, listeners);
      });
    } catch (e) {
      console.warn('Audio tag init failed', e);
      this.playSyntheticStationTrack(durationSeconds, listeners);
    }
  }

  private syntheticInterval: ReturnType<typeof setInterval> | null = null;
  private syntheticTime: number = 0;

  private playSyntheticStationTrack(
    durationSeconds: number,
    listeners: {
      onTimeUpdate?: (current: number, duration: number) => void;
      onEnd?: () => void;
    }
  ) {
    this.stopSyntheticTrack();
    this.syntheticTime = 0;
    this.initAudioContext();

    const tickInterval = 500;
    this.syntheticInterval = setInterval(() => {
      this.syntheticTime += tickInterval / 1000;
      if (this.syntheticTime >= durationSeconds) {
        this.stopSyntheticTrack();
        if (listeners.onEnd) listeners.onEnd();
        return;
      }

      if (listeners.onTimeUpdate) {
        listeners.onTimeUpdate(this.syntheticTime, durationSeconds);
      }

      // Procedural modal harmonics
      if (!this.isMuted && this.ctx) {
        const pentatonicScale = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88];
        const randomNote = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
        this.playChime(randomNote, 0.6);
      }
    }, tickInterval);
  }

  public pauseStationTrack() {
    if (this.currentStationTrackAudio) {
      this.currentStationTrackAudio.pause();
    }
    if (this.syntheticInterval) {
      clearInterval(this.syntheticInterval);
      this.syntheticInterval = null;
    }
  }

  public resumeStationTrack() {
    if (this.currentStationTrackAudio && this.currentStationTrackAudio.src) {
      this.currentStationTrackAudio.play().catch(() => {});
    }
  }

  public seekStationTrack(seconds: number) {
    if (this.currentStationTrackAudio && Number.isFinite(seconds)) {
      this.currentStationTrackAudio.currentTime = seconds;
    } else {
      this.syntheticTime = seconds;
    }
  }

  public stopStationTrack() {
    if (this.currentStationTrackAudio) {
      try {
        this.currentStationTrackAudio.pause();
        this.currentStationTrackAudio.currentTime = 0;
        this.currentStationTrackAudio.src = '';
      } catch (e) {
        // ignore
      }
      this.currentStationTrackAudio = null;
    }
    this.stopSyntheticTrack();
  }

  private stopSyntheticTrack() {
    if (this.syntheticInterval) {
      clearInterval(this.syntheticInterval);
      this.syntheticInterval = null;
    }
  }

  // Start background railway ambient hum
  public startAmbientRailway() {
    if (this.ambientOscillators.length > 0) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, now);
      this.ambientGain.connect(this.ctx.destination);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now);
      osc1.connect(this.ambientGain);
      osc1.start(now);
      this.ambientOscillators.push(osc1);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(164.81, now);
      osc2.connect(this.ambientGain);
      osc2.start(now);
      this.ambientOscillators.push(osc2);
    } catch (e) {
      console.warn('Error starting railway ambient', e);
    }
  }

  public stopAmbientRailway() {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.ambientOscillators = [];
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch (e) {
        // ignore
      }
      this.ambientGain = null;
    }
  }

  public cleanupAll() {
    this.stopStationTrack();
    this.stopAmbientRailway();
    if (this.currentActiveAudio) {
      this.currentActiveAudio.pause();
      this.currentActiveAudio = null;
    }
  }
}

export const soundEngine = new HeritageSoundEngine();
