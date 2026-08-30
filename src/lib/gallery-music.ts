// Ambient Gallery & Cinema Music Manager
// Plays soothing traditional Vietnamese Đàn Tranh (zither) field music

let ambientAudio: HTMLAudioElement | null = null;
let isPlayingDesired = false;

export function playGalleryAmbientMusic(options: { muted?: boolean; volume?: number } = {}) {
  if (typeof window === "undefined") return;
  isPlayingDesired = true;

  if (!ambientAudio) {
    ambientAudio = new Audio("/media/dan-tranh-field.mp3");
    ambientAudio.loop = true;
    ambientAudio.preload = "auto";
  }

  ambientAudio.muted = !!options.muted;
  ambientAudio.volume = Math.min(1, Math.max(0.02, 0.45 * (options.volume ?? 0.75)));

  if (ambientAudio.paused && isPlayingDesired) {
    const playPromise = ambientAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be delayed until first user interaction
      });
    }
  }
}

export function updateGalleryAmbientVolume(options: { muted?: boolean; volume?: number } = {}) {
  if (!ambientAudio) return;
  ambientAudio.muted = !!options.muted;
  ambientAudio.volume = Math.min(1, Math.max(0.02, 0.45 * (options.volume ?? 0.75)));
}

export function stopGalleryAmbientMusic() {
  isPlayingDesired = false;
  if (ambientAudio) {
    try {
      ambientAudio.pause();
    } catch {}
  }
}

export function isGalleryAmbientPlaying(): boolean {
  return !!ambientAudio && !ambientAudio.paused && !ambientAudio.muted;
}
