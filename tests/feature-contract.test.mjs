import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("ships the carriage, grounded train artwork, story dialogue, hand tracking and rights-aware previews", async () => {
  const [ui, handTracking, heritage, css, cover, landscape, track, carriage, conductor, train] = await Promise.all([
    readFile(new URL("components/heritage-game.tsx", projectRoot), "utf8"),
    readFile(new URL("components/hand-tracking-viewer.tsx", projectRoot), "utf8"),
    readFile(new URL("lib/heritage.ts", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readFile(new URL("public/og.png", projectRoot)),
    readFile(new URL("public/train/coastal-transit-v2.webp", projectRoot)),
    readFile(new URL("public/train/straight-track-v2.png", projectRoot)),
    readFile(new URL("public/train/heritage-carriage.webp", projectRoot)),
    readFile(new URL("public/characters/ticket-conductor-v2.png", projectRoot)),
    readFile(new URL("public/train/heritage-express.webp", projectRoot)),
  ]);

  assert.match(ui, /"landing" \| "carriage" \| "travelling" \| "heritage" \| "ending"/);
  assert.match(ui, /Chạm vào ký ức đang sống\./);
  assert.match(ui, /finishJourney/);
  assert.match(ui, /className="ending-screen"/);
  assert.doesNotMatch(ui, /new MediaRecorder|fetch\("\/api\/transcribe"|fetch\("\/api\/guide"|Hỏi Trưởng tàu AI/);
  assert.match(ui, /compact-dialogue/);
  assert.match(ui, /typewriter-line/);
  assert.match(ui, /experienceStops\.map\(\(item, index\)/);
  assert.match(ui, /new Audio\(preview\.src\)/);
  assert.match(ui, /dan-day-study/);
  assert.match(heritage, /ca-tru-sound-futures/);
  assert.match(ui, /official-audio-link/);
  assert.match(ui, /ducked \? 0 : 0\.082/);
  assert.match(ui, /\/og\.png/);
  assert.match(ui, /\/train\/coastal-transit-v2\.webp/);
  assert.match(ui, /\/train\/straight-track-v2\.png/);
  assert.match(ui, /\/train\/heritage-carriage\.webp/);
  assert.match(ui, /\/characters\/ticket-conductor-v2\.png/);
  assert.match(ui, /\/train\/heritage-express\.webp/);
  assert.ok((ui.match(/\bunoptimized\b/g) || []).length >= 7);
  assert.match(ui, /story-dialogue/);
  assert.doesNotMatch(ui, /story-mic-row/);
  assert.match(ui, /const scorePatterns/);
  assert.match(ui, /createBuffer\(1, context\.sampleRate \* 12/);
  assert.match(ui, /score\.loop = true/);
  assert.match(ui, /Nhạc nền hành trình đang phát/);
  assert.match(ui, /className="station-direction station-previous"/);
  assert.match(ui, /className="station-direction station-next"/);
  assert.doesNotMatch(ui, /travel-rail-glow/);
  assert.match(css, /\.conductor-character/);
  assert.match(css, /\.travel-track-image/);
  assert.match(css, /\.travel-train-image/);
  assert.match(css, /\.ending-cover-image/);
  assert.doesNotMatch(css, /\.pixel-conductor|\.travel-rail-glow/);
  assert.match(css, /\.hotspot\.near/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.scene-wrap::before/);
  assert.match(css, /min-width: 721px.*max-width: 1100px.*orientation: portrait/s);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.doesNotMatch(css, /\.pixel-train-side/);
  assert.match(css, /\.hand-viewer/);
  assert.match(css, /\.scene\.nha-nhac-locked/);
  assert.match(css, /\.official-audio-link/);
  assert.ok(cover.byteLength > 500_000);
  assert.ok(landscape.byteLength > 250_000);
  assert.ok(track.byteLength > 250_000);
  assert.ok(carriage.byteLength > 200_000);
  assert.ok(conductor.byteLength > 500_000);
  assert.ok(train.byteLength > 300_000);

  assert.match(handTracking, /HandLandmarker/);
  assert.match(handTracking, /getUserMedia/);
  assert.match(handTracking, /numHands: 2/);
  assert.match(handTracking, /no images are sent or stored/);
  assert.match(handTracking, /requestAnimationFrame/);
  assert.doesNotMatch(ui, /youtube|youtu\.be/i);
});
