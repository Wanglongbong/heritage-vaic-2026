// Procedural UI Sound Effects engine using Web Audio API
// Provides crisp, authentic, and subtle sound feedback for hover, clicks, item discoveries, and seals

let audioCtx: AudioContext | null = null;
let lastHoverTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export type SfxOptions = {
  muted?: boolean;
  volume?: number;
};

/**
 * Very gentle and subtle wooden / bamboo micro-tap on hover
 */
export function playHoverSfx(options: SfxOptions = {}) {
  if (options.muted) return;
  const now = Date.now();
  if (now - lastHoverTime < 45) return; // Throttle to keep sound pleasant and avoid spam
  lastHoverTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const vol = (options.volume ?? 0.75) * 0.055; // Keep very soft and non-intrusive

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(460, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.035);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  } catch {
    // Ignore audio playback errors if user hasn't interacted yet
  }
}

/**
 * Crisp tactile click / ticket punch sound
 */
export function playClickSfx(options: SfxOptions = {}) {
  if (options.muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const vol = (options.volume ?? 0.75) * 0.12;

    // Transient tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(680, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.045);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    // Warm body thump
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(240, t);
    body.frequency.exponentialRampToValueAtTime(90, t + 0.06);

    bodyGain.gain.setValueAtTime(vol * 0.7, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.055);
    body.start(t);
    body.stop(t + 0.065);
  } catch {
    // Ignore
  }
}

/**
 * Enchanting pentatonic bronze chime when waking up an artifact or hotspot
 */
export function playItemDiscoverSfx(options: SfxOptions = {}) {
  if (options.muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const vol = (options.volume ?? 0.75) * 0.18;

    // Harmonized pentatonic frequencies (G4, C5, E5, G5)
    const notes = [392.0, 523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.06;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      overtone.type = "triangle";
      overtone.frequency.setValueAtTime(freq * 2.01, noteTime);

      const noteVol = vol * (1 - idx * 0.15);
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(noteVol, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.55);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
      overtone.start(noteTime);
      overtone.stop(noteTime + 0.6);
    });
  } catch {
    // Ignore
  }
}

/**
 * Rich ceremonial seal stamp sound (deep wooden stamp impact + golden shimmer)
 */
export function playSealSfx(options: SfxOptions = {}) {
  if (options.muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const vol = (options.volume ?? 0.75) * 0.22;

    // Low stamp impact
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(130, t);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.14);

    thudGain.gain.setValueAtTime(vol * 1.5, t);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(t);
    thud.stop(t + 0.2);

    // Golden bronze resonance chime
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = "triangle";
    chime.frequency.setValueAtTime(1046.5, t + 0.04);
    chime.frequency.exponentialRampToValueAtTime(1318.5, t + 0.45);

    chimeGain.gain.setValueAtTime(0.0001, t);
    chimeGain.gain.setValueAtTime(vol * 0.9, t + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chime.start(t + 0.04);
    chime.stop(t + 0.7);
  } catch {
    // Ignore
  }
}

/**
 * Soft parchment / page flip / modal opening whoosh
 */
export function playPaperSfx(options: SfxOptions = {}) {
  if (options.muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const vol = (options.volume ?? 0.75) * 0.08;

    const bufferSize = ctx.sampleRate * 0.09;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + 0.08);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
  } catch {
    // Ignore
  }
}

/**
 * Train ticket select chime
 */
export function playTicketSelectSfx(options: SfxOptions = {}) {
  if (options.muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const vol = (options.volume ?? 0.75) * 0.14;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // A5

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  } catch {
    // Ignore
  }
}
