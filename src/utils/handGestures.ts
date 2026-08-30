/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArtifactFace } from '../types';

export interface HandGestureState {
  yawDegrees: number;
  activeFace: ArtifactFace;
  zoomScale: number;
  rightHandDetected: boolean;
  leftHandDetected: boolean;
  handRolesSwapped: boolean;
}

// Convert 0..360 degrees to nearest face with hysteresis
export function calculateFaceFromYaw(yaw: number, currentFace: ArtifactFace): ArtifactFace {
  const normalized = ((yaw % 360) + 360) % 360;

  // Thresholds with 10 degree hysteresis buffer
  if (currentFace === 'front') {
    if (normalized > 55 && normalized < 135) return 'right';
    if (normalized >= 135 && normalized < 225) return 'back';
    if (normalized >= 225 && normalized < 305) return 'left';
    return 'front';
  } else if (currentFace === 'right') {
    if (normalized >= 315 || normalized <= 35) return 'front';
    if (normalized >= 145 && normalized < 225) return 'back';
    if (normalized >= 225 && normalized < 315) return 'left';
    return 'right';
  } else if (currentFace === 'back') {
    if (normalized >= 315 || normalized <= 45) return 'front';
    if (normalized > 45 && normalized < 125) return 'right';
    if (normalized >= 235 && normalized < 315) return 'left';
    return 'back';
  } else {
    // left
    if (normalized >= 325 || normalized <= 45) return 'front';
    if (normalized > 45 && normalized < 135) return 'right';
    if (normalized >= 135 && normalized < 215) return 'back';
    return 'left';
  }
}

// Calculate hand openness (distance between thumb tip and index/pinky tip vs wrist)
export function calculateHandOpenness(landmarks: Array<{ x: number; y: number; z: number }>): number {
  if (!landmarks || landmarks.length < 21) return 0.5;

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const pinkyTip = landmarks[20];

  const distIndex = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
  const distMiddle = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
  const distPinky = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);

  const avgDist = (distIndex + distMiddle + distPinky) / 3;
  // Normalized estimate where > 0.35 is open palm and < 0.22 is closed fist
  return Math.min(Math.max((avgDist - 0.2) / 0.25, 0), 1);
}
