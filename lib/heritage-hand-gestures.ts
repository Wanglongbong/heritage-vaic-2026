export type HandLandmark = { x: number; y: number; z?: number };

export type DetectedHand = {
  landmarks: HandLandmark[];
  handedness: string;
  score: number;
};

export type HandRoles = {
  right: HandLandmark[] | null;
  left: HandLandmark[] | null;
};

export type StableFaceState = {
  candidate: number;
  frames: number;
  committed: number;
};

export const FOUR_VIEWS = ["front", "right", "back", "left"] as const;

function oppositeRole(role: string) {
  if (role === "right") return "left";
  if (role === "left") return "right";
  return role;
}

/**
 * Adapted from the user's HandPilot-Mac role assignment: trust MediaPipe's
 * handedness first, then fall back to horizontal order when labels conflict.
 */
export function assignHandRoles(hands: DetectedHand[], swapHands = false): HandRoles {
  const tracked = hands.map((hand) => {
    const label = hand.handedness.toLowerCase();
    let role = label === "right" || label === "left" ? label : "unknown";
    if (swapHands) role = oppositeRole(role);
    return { ...hand, role };
  });

  if (tracked.length === 2 && (tracked[0].role === tracked[1].role || tracked.some((hand) => hand.role === "unknown"))) {
    const byX = [...tracked].sort((a, b) => a.landmarks[0].x - b.landmarks[0].x);
    byX[0].role = swapHands ? "left" : "right";
    byX[1].role = swapHands ? "right" : "left";
  } else if (tracked.length === 1 && tracked[0].role === "unknown") {
    const rawRole = tracked[0].landmarks[0].x < 0.5 ? "right" : "left";
    tracked[0].role = swapHands ? oppositeRole(rawRole) : rawRole;
  }

  return {
    right: tracked.find((hand) => hand.role === "right")?.landmarks ?? null,
    left: tracked.find((hand) => hand.role === "left")?.landmarks ?? null,
  };
}

export function normalizeFaceIndex(value: number) {
  return ((value % FOUR_VIEWS.length) + FOUR_VIEWS.length) % FOUR_VIEWS.length;
}

export function faceFromYaw(yaw: number) {
  return normalizeFaceIndex(Math.round(yaw / 90));
}

/** Three-frame commitment mirrors HandPilot's anti-flicker pose filter. */
export function updateStableFace(state: StableFaceState, candidate: number, stableFrames = 3) {
  const normalized = normalizeFaceIndex(candidate);
  if (state.candidate !== normalized) {
    state.candidate = normalized;
    state.frames = 1;
  } else {
    state.frames += 1;
  }
  if (state.frames >= stableFrames) state.committed = normalized;
  return state.committed;
}

export function smoothValue(current: number, target: number, amount = 0.24) {
  return current + (target - current) * amount;
}

function distance(a: HandLandmark, b: HandLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function handOpenness(landmarks: HandLandmark[] | null): "open" | "fist" | "neutral" {
  if (!landmarks || landmarks.length < 21) return "neutral";
  const wrist = landmarks[0];
  const extended = [8, 12, 16, 20].filter((tip, index) => {
    const joint = [5, 9, 13, 17][index];
    return distance(landmarks[tip], wrist) > distance(landmarks[joint], wrist) * 1.34;
  }).length;
  if (extended >= 4) return "open";
  if (extended <= 1) return "fist";
  return "neutral";
}
