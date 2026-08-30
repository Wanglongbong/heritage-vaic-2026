// Ending & Cinema Soundscape Manager
// Manages smooth audio playback and crossfading between:
// 1. Golden Embers (Summary / Ending background score)
// 2. David - Instrumental Slowed (Big Thanks To / Movie Credits Cinema)

const GOLDEN_TRACK = "/media/golden-embers.mp3";
const DAVID_TRACK = "/media/david-instrumental-slowed.mp3";

let goldenAudio: HTMLAudioElement | null = null;
let davidAudio: HTMLAudioElement | null = null;
let currentTrack: "golden" | "david" | "none" = "none";
let currentMuted = false;
let currentVolume = 0.75;
let fadeAnimationFrames: number[] = [];
let fadeTimeouts: number[] = [];

function clearFades() {
  fadeAnimationFrames.forEach((id) => cancelAnimationFrame(id));
  fadeAnimationFrames = [];
  fadeTimeouts.forEach((id) => clearTimeout(id));
  fadeTimeouts = [];
}

function smoothVolume(
  audio: HTMLAudioElement,
  targetVolume: number,
  duration = 800,
  onComplete?: () => void
) {
  const initialVolume = audio.volume;
  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Smooth ease-in-out curve
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    const newVol = initialVolume + (targetVolume - initialVolume) * ease;
    audio.volume = Math.min(1, Math.max(0, newVol));

    if (progress < 1) {
      const frameId = requestAnimationFrame(step);
      fadeAnimationFrames.push(frameId);
    } else {
      audio.volume = targetVolume;
      if (onComplete) onComplete();
    }
  };

  const frameId = requestAnimationFrame(step);
  fadeAnimationFrames.push(frameId);
}

function getOrCreateGolden(): HTMLAudioElement {
  if (!goldenAudio && typeof window !== "undefined") {
    goldenAudio = new Audio(GOLDEN_TRACK);
    goldenAudio.loop = true;
    goldenAudio.preload = "auto";
  }
  return goldenAudio!;
}

function getOrCreateDavid(): HTMLAudioElement {
  if (!davidAudio && typeof window !== "undefined") {
    davidAudio = new Audio(DAVID_TRACK);
    davidAudio.loop = true;
    davidAudio.preload = "auto";
  }
  return davidAudio!;
}

/**
 * Play Golden Embers when user arrives at the Ending / Summary screen
 */
export function playEndingGoldenEmbers(options: { muted?: boolean; volume?: number } = {}) {
  if (typeof window === "undefined") return;
  if (options.muted !== undefined) currentMuted = options.muted;
  if (options.volume !== undefined) currentVolume = options.volume;

  currentTrack = "golden";
  clearFades();

  const golden = getOrCreateGolden();
  const david = getOrCreateDavid();

  const targetVol = Math.min(1, Math.max(0.05, 0.65 * currentVolume));

  golden.muted = currentMuted;
  david.muted = currentMuted;

  // If David was playing, fade David out while fading Golden in
  if (david && !david.paused) {
    smoothVolume(david, 0, 800, () => {
      try {
        david.pause();
      } catch {}
    });
  }

  if (golden.paused) {
    golden.volume = 0;
    const playPromise = golden.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          smoothVolume(golden, targetVol, 700);
        })
        .catch(() => {
          // Autoplay retry handled on next user interaction
        });
    }
  } else {
    smoothVolume(golden, targetVol, 500);
  }
}

/**
 * Switch to David (Instrumental Slowed) when opening the Big Thanks To / Cinema Credits screen
 */
export function playCinemaDavid(options: { muted?: boolean; volume?: number } = {}) {
  if (typeof window === "undefined") return;
  if (options.muted !== undefined) currentMuted = options.muted;
  if (options.volume !== undefined) currentVolume = options.volume;

  currentTrack = "david";
  clearFades();

  const golden = getOrCreateGolden();
  const david = getOrCreateDavid();

  const targetDavidVol = Math.min(1, Math.max(0.05, 0.72 * currentVolume));

  golden.muted = currentMuted;
  david.muted = currentMuted;

  // Fade down Golden Embers and pause it
  if (golden && !golden.paused) {
    smoothVolume(golden, 0, 750, () => {
      if (currentTrack === "david") {
        try {
          golden.pause();
        } catch {}
      }
    });
  }

  david.currentTime = 0;
  david.volume = 0;

  const playPromise = david.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        smoothVolume(david, targetDavidVol, 900);
      })
      .catch(() => {
        // Autoplay handled
      });
  }
}

/**
 * Exit Cinema screen: Smoothly fade David out while fading Golden Embers back in
 */
export function exitCinemaToGoldenEmbers(options: { muted?: boolean; volume?: number } = {}) {
  if (typeof window === "undefined") return;
  if (options.muted !== undefined) currentMuted = options.muted;
  if (options.volume !== undefined) currentVolume = options.volume;

  currentTrack = "golden";
  clearFades();

  const golden = getOrCreateGolden();
  const david = getOrCreateDavid();

  const targetGoldenVol = Math.min(1, Math.max(0.05, 0.65 * currentVolume));

  golden.muted = currentMuted;
  david.muted = currentMuted;

  // Fade out David over 1.2s then pause
  if (david && !david.paused) {
    smoothVolume(david, 0, 1200, () => {
      try {
        david.pause();
      } catch {}
    });
  }

  // Resume and fade Golden Embers in over 1.2s
  golden.volume = 0;
  const playPromise = golden.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        smoothVolume(golden, targetGoldenVol, 1200);
      })
      .catch(() => {
        // Fallback
      });
  } else {
    smoothVolume(golden, targetGoldenVol, 1200);
  }
}

/**
 * Update volume and mute dynamically
 */
export function updateEndingMusicVolume(options: { muted?: boolean; volume?: number } = {}) {
  if (options.muted !== undefined) currentMuted = options.muted;
  if (options.volume !== undefined) currentVolume = options.volume;

  if (goldenAudio) {
    goldenAudio.muted = currentMuted;
    if (currentTrack === "golden") {
      goldenAudio.volume = Math.min(1, Math.max(0.05, 0.65 * currentVolume));
    }
  }

  if (davidAudio) {
    davidAudio.muted = currentMuted;
    if (currentTrack === "david") {
      davidAudio.volume = Math.min(1, Math.max(0.05, 0.72 * currentVolume));
    }
  }
}

/**
 * Stop all ending music when leaving the summary screen
 */
export function stopEndingMusic() {
  clearFades();
  currentTrack = "none";

  if (goldenAudio) {
    try {
      goldenAudio.pause();
      goldenAudio.currentTime = 0;
    } catch {}
  }

  if (davidAudio) {
    try {
      davidAudio.pause();
      davidAudio.currentTime = 0;
    } catch {}
  }
}

export function getCurrentEndingTrack(): "golden" | "david" | "none" {
  return currentTrack;
}
