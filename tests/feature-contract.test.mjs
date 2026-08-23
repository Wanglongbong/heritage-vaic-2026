import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("ships the carriage, memory-lantern loop, heritage passport, grounded media and hand tracking", async () => {
  const [ui, handTracking, passportExport, heritage, css, cover, artifacts, turnViews, landscape, track, carriage, conductor, train, museum] = await Promise.all([
    readFile(new URL("components/heritage-game.tsx", projectRoot), "utf8"),
    readFile(new URL("components/hand-tracking-viewer.tsx", projectRoot), "utf8"),
    readFile(new URL("lib/passport-export.ts", projectRoot), "utf8"),
    readFile(new URL("lib/heritage.ts", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readFile(new URL("public/og.webp", projectRoot)),
    readdir(new URL("public/artifacts/", projectRoot)),
    readdir(new URL("public/artifacts/turn/", projectRoot)),
    readFile(new URL("public/train/coastal-transit-v2.webp", projectRoot)),
    readFile(new URL("public/train/straight-track-v2.png", projectRoot)),
    readFile(new URL("public/train/heritage-carriage.webp", projectRoot)),
    readFile(new URL("public/characters/ticket-conductor-v2.png", projectRoot)),
    readFile(new URL("public/train/heritage-express.webp", projectRoot)),
    readFile(new URL("public/museum/heritage-gallery-v2.webp", projectRoot)),
  ]);

  assert.match(ui, /"landing" \| "carriage" \| "travelling" \| "heritage" \| "ending"/);
  assert.match(ui, /Chạm vào ký ức đang sống\./);
  assert.match(ui, /finishJourney/);
  assert.match(ui, /ĐÈN KÝ ỨC/);
  assert.match(ui, /memory-color-patch/);
  assert.match(ui, /station-reveal-card/);
  assert.match(ui, /TOÀN CẢNH ĐÃ THỨC/);
  assert.match(ui, /StationSeal/);
  assert.match(ui, /CON DẤU DI SẢN/);
  assert.match(ui, /Hộ chiếu di sản/);
  assert.match(ui, /heritage-seals-v1/);
  assert.match(ui, /className="ending-screen"/);
  assert.match(ui, /museum-carousel-stage/);
  assert.match(ui, /museum-map-vitrine/);
  assert.match(ui, /museum-object-cases/);
  assert.match(ui, /museumTurnViews/);
  assert.match(ui, /openMuseumRecord/);
  assert.match(ui, /startNewJourney/);
  assert.match(ui, /localStorage\.removeItem\("heritage-visited-v2"\)/);
  assert.match(ui, /passport-station-gallery/);
  assert.match(ui, /passport-entry-visual/);
  assert.match(ui, /\/museum\/heritage-gallery-v2\.webp/);
  assert.match(ui, /Museum of Vietnamese History/);
  assert.match(ui, /CC0 1\.0/);
  assert.doesNotMatch(ui, /new MediaRecorder|fetch\("\/api\/transcribe"|fetch\("\/api\/guide"|Hỏi Trưởng tàu AI/);
  assert.match(ui, /compact-dialogue/);
  assert.match(ui, /typewriter-line/);
  assert.match(ui, /experienceStops\.map\(\(item, index\)/);
  assert.match(ui, /new Audio\(preview\.src\)/);
  assert.doesNotMatch(ui, /dan-day-study|phach-study|open-fire-study|playFoley/);
  assert.match(heritage, /ca-tru-sound-futures/);
  assert.match(ui, /official-audio-link/);
  assert.match(ui, /ducked \? 0 : 0\.082/);
  assert.match(ui, /\/og\.webp/);
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
  assert.match(css, /\.memory-darkness/);
  assert.match(css, /\.station-seal-card/);
  assert.match(css, /\.station-reveal-card/);
  assert.match(css, /\.passport-seal-strip/);
  assert.match(css, /\.passport-book/);
  assert.match(css, /\.passport-hero/);
  assert.match(css, /\.passport-station-gallery/);
  assert.match(css, /\.museum-vault/);
  assert.match(css, /\.museum-carousel-arrow/);
  assert.match(css, /\.museum-map-vitrine/);
  assert.match(css, /\.museum-object-cases/);
  assert.match(css, /\.museum-object-card/);
  assert.match(css, /museum-object-float/);
  assert.match(css, /\.reset-dialog/);
  assert.match(css, /\.camera-popout/);
  assert.match(css, /\.tracked-object img/);
  assert.match(css, /\.scene\.nha-nhac-locked/);
  assert.match(css, /\.official-audio-link/);
  assert.ok(cover.byteLength > 300_000);
  assert.equal(artifacts.filter((name) => name.endsWith(".webp")).length, 15);
  assert.equal(turnViews.filter((name) => name.endsWith(".webp")).length, 60);
  assert.ok(landscape.byteLength > 250_000);
  assert.ok(track.byteLength > 250_000);
  assert.ok(carriage.byteLength > 200_000);
  assert.ok(conductor.byteLength > 500_000);
  assert.ok(train.byteLength > 300_000);
  assert.ok(museum.byteLength > 200_000);

  assert.match(handTracking, /HandLandmarker/);
  assert.match(handTracking, /getUserMedia/);
  assert.match(handTracking, /numHands: 2/);
  assert.match(handTracking, /no images are sent or stored/);
  assert.match(handTracking, /requestAnimationFrame/);
  assert.match(handTracking, /spriteSrc/);
  assert.match(handTracking, /assignHandRoles/);
  assert.match(handTracking, /updateStableFace/);
  assert.match(handTracking, /Cách điều khiển/);
  assert.match(handTracking, /Di chuyển ngang để xoay 4 mặt/);
  assert.match(handTracking, /Xòe để phóng to · nắm để thu nhỏ/);
  assert.match(handTracking, /createPortal/);
  assert.match(handTracking, /Cửa sổ nhận diện bàn tay/);
  assert.match(handTracking, /mô phỏng giáo dục/);
  assert.match(handTracking, /shapingProgress/);
  assert.match(passportExport, /pdfmake\/build\/pdfmake/);
  assert.match(passportExport, /downloadPassportPdf/);
  assert.match(passportExport, /Usage rights/);
  assert.match(css, /\.hand-guide/);
  assert.match(ui, /external-audio-player/);
  assert.match(heritage, /youtube\.com\/embed\/wnFZ5QAWGUo/);

  const closeRecordFlow = ui.slice(ui.indexOf("function closeRecord"), ui.indexOf("function requestSeal"));
  const collectSealFlow = ui.slice(ui.indexOf("function collectSeal"), ui.indexOf("function beginTravel"));
  assert.doesNotMatch(closeRecordFlow, /setSealStopId/);
  assert.doesNotMatch(collectSealFlow, /beginTravel|finishJourney/);
});
