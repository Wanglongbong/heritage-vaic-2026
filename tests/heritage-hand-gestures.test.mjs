import assert from "node:assert/strict";
import test from "node:test";
import {
  assignHandRoles,
  faceFromYaw,
  handOpenness,
  updateStableFace,
} from "../lib/heritage-hand-gestures.ts";

const landmarkSet = (x, open = true) => Array.from({ length: 21 }, (_, index) => ({
  x: x + (index % 4) * 0.002,
  y: index === 0 ? 0.8 : open && [8, 12, 16, 20].includes(index) ? 0.2 : index % 4 === 1 ? 0.6 : 0.7,
}));

test("HandPilot-style role assignment keeps right and left controls separate", () => {
  const right = landmarkSet(0.25);
  const left = landmarkSet(0.75);
  assert.deepEqual(assignHandRoles([
    { landmarks: right, handedness: "Right", score: 0.95 },
    { landmarks: left, handedness: "Left", score: 0.94 },
  ]), { right, left });
  assert.deepEqual(assignHandRoles([
    { landmarks: right, handedness: "Right", score: 0.95 },
    { landmarks: left, handedness: "Left", score: 0.94 },
  ], true), { right: left, left: right });

  const fallback = assignHandRoles([
    { landmarks: right, handedness: "Unknown", score: 0 },
    { landmarks: left, handedness: "Unknown", score: 0 },
  ]);
  assert.equal(fallback.right, right);
  assert.equal(fallback.left, left);
});

test("four-view rotation commits only after three stable frames", () => {
  assert.equal(faceFromYaw(0), 0);
  assert.equal(faceFromYaw(90), 1);
  assert.equal(faceFromYaw(180), 2);
  assert.equal(faceFromYaw(-90), 3);

  const state = { candidate: 0, frames: 0, committed: 0 };
  assert.equal(updateStableFace(state, 1), 0);
  assert.equal(updateStableFace(state, 1), 0);
  assert.equal(updateStableFace(state, 1), 1);
});

test("left-hand openness supports zoom gestures", () => {
  assert.equal(handOpenness(landmarkSet(0.5, true)), "open");
  assert.equal(handOpenness(landmarkSet(0.5, false)), "fist");
});
