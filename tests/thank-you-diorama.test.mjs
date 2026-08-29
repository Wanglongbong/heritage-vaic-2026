import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BANK_QR_MATRIX,
  classifyQrDarkModule,
  getQrFinderId,
  isBottomRightAlignmentModule,
  isProtectedQrModule,
  isTrainArtworkZone,
} from "../lib/bank-qr-matrix.ts";

const projectRoot = new URL("../", import.meta.url);

test("assigns every dark QR module to one scan-safe visual role", () => {
  const counts = { protected: 0, canopy: 0, train: 0, landscape: 0 };
  let darkCount = 0;

  BANK_QR_MATRIX.modules.forEach((row, rowIndex) => {
    row.forEach((dark, columnIndex) => {
      if (!dark) return;
      darkCount += 1;
      const role = classifyQrDarkModule(rowIndex, columnIndex, BANK_QR_MATRIX.size);
      counts[role] += 1;
      if (role !== "protected") assert.equal(isProtectedQrModule(rowIndex, columnIndex, BANK_QR_MATRIX.size), false);
    });
  });

  assert.equal(Object.values(counts).reduce((total, count) => total + count, 0), darkCount);
  assert.ok(counts.protected > 100);
  assert.ok(counts.canopy > 20);
  assert.ok(counts.train > 5);
  assert.ok(counts.landscape > 100);
});

test("keeps every train module inside the compact QR artwork band", () => {
  BANK_QR_MATRIX.modules.forEach((row, rowIndex) => {
    row.forEach((dark, columnIndex) => {
      if (!dark || classifyQrDarkModule(rowIndex, columnIndex, BANK_QR_MATRIX.size) !== "train") return;
      assert.equal(isTrainArtworkZone(rowIndex, columnIndex, BANK_QR_MATRIX.size), true);
      assert.equal(isProtectedQrModule(rowIndex, columnIndex, BANK_QR_MATRIX.size), false);
    });
  });
});

test("maps exactly three 7 by 7 finder gardens without touching the rest of the QR", () => {
  const counts = { "north-west": 0, "north-east": 0, "south-west": 0 };
  BANK_QR_MATRIX.modules.forEach((row, rowIndex) => {
    row.forEach((_, columnIndex) => {
      const finder = getQrFinderId(rowIndex, columnIndex, BANK_QR_MATRIX.size);
      if (finder) counts[finder] += 1;
    });
  });
  assert.deepEqual(counts, { "north-west": 49, "north-east": 49, "south-west": 49 });
  assert.equal(getQrFinderId(20, 20, BANK_QR_MATRIX.size), null);
});

test("maps the bottom-right 5 by 5 alignment garden exactly", () => {
  const cells = [];
  BANK_QR_MATRIX.modules.forEach((row, rowIndex) => {
    row.forEach((dark, columnIndex) => {
      if (isBottomRightAlignmentModule(rowIndex, columnIndex, BANK_QR_MATRIX.size)) cells.push({ rowIndex, columnIndex, dark });
    });
  });
  assert.equal(cells.length, 25);
  assert.equal(cells.filter(({ dark }) => dark).length, 17);
  assert.ok(cells.every(({ rowIndex, columnIndex }) => isProtectedQrModule(rowIndex, columnIndex, BANK_QR_MATRIX.size)));
});

test("ships a QR-derived orbitable memory landscape with a classic autumn train", async () => {
  const [component, game, css, matrixFile, qr] = await Promise.all([
    readFile(new URL("components/thank-you-diorama.tsx", projectRoot), "utf8"),
    readFile(new URL("components/heritage-game.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readFile(new URL("lib/bank-qr-matrix.ts", projectRoot), "utf8"),
    readFile(new URL("public/thanks-diorama/bank-qr.png", projectRoot)),
  ]);

  assert.ok(qr.byteLength > 100_000);
  assert.equal(qr.toString("ascii", 1, 4), "PNG");
  assert.equal(qr.readUInt32BE(16), 1024);
  assert.equal(qr.readUInt32BE(20), 1024);

  const rows = [...matrixFile.matchAll(/^  "([01]+)",$/gm)].map((match) => match[1]);
  assert.equal(rows.length, 41);
  assert.ok(rows.every((row) => row.length === 41));
  assert.deepEqual(rows.slice(0, 7).map((row) => row.slice(0, 7)), [
    "1111111", "1000001", "1011101", "1011101", "1011101", "1000001", "1111111",
  ]);
  assert.match(matrixFile, /BANK_QR_MATRIX/);
  assert.match(matrixFile, /module === "1"/);

  assert.match(game, /<ThankYouDiorama language=\{language\} \/>/);
  assert.match(game, /href="#thank-you-stop"/);
  assert.match(component, /import \* as THREE from "three"/);
  assert.match(component, /BANK_QR_MATRIX/);
  assert.match(component, /new THREE\.WebGLRenderer/);
  assert.match(component, /new THREE\.OrthographicCamera/);
  assert.match(component, /new THREE\.InstancedMesh/);
  assert.match(component, /landscapePositions/);
  assert.match(component, /leafModulePositions/);
  assert.match(component, /trainModulePositions/);
  assert.doesNotMatch(component, /trainLightPositions/);
  assert.match(matrixFile, /isProtectedQrModule/);
  assert.match(matrixFile, /classifyQrDarkModule/);
  assert.match(component, /qrShadowTiles/);
  assert.match(component, /treeViewGroup/);
  assert.match(component, /topQrGroup/);
  assert.match(component, /qrReveal/);
  assert.match(component, /memory-tree-fallback-code/);
  assert.match(component, /finderGardenGroup/);
  assert.match(component, /alignmentGardenGroup/);
  assert.match(component, /alignmentDarkPositions/);
  assert.match(component, /alignmentLightPositions/);
  assert.match(component, /finderDarkPositions/);
  assert.match(component, /addLotus/);
  assert.match(component, /addBamboo/);
  assert.match(component, /addLandscapeDetail/);
  assert.match(component, /addLantern/);
  assert.match(component, /const canopyShadows = new THREE\.InstancedMesh/);
  assert.match(component, /canopyShadowMaterial/);
  assert.match(component, /const train = new THREE\.Group/);
  assert.match(component, /\[14\.8, 0\.68, 3\.1\]/);
  assert.match(component, /\[13\.9, 2\.3, 2\.9\]/);
  assert.match(component, /-5\.3 \+ index \* 1\.65/);
  assert.match(component, /\[-5\.4, -2\.6, 1\.2, 4\.7, 7\.2\]/);
  assert.match(component, /fallingLeafCount = mobile \? 32 : 65/);
  assert.match(component, /fallingLeavesGroup/);
  assert.match(component, /autumnColors/);
  assert.match(component, /color: 0xb99632/);
  assert.match(component, /"#a77d20" : "#b99632"/);
  assert.match(component, /lanternGlowMaterial\.emissiveIntensity/);
  assert.match(component, /new THREE\.PointLight\(0xffad45, 5\.5, 8, 2\)/);
  assert.match(component, /const \[isTop, setIsTop\] = useState\(false\)/);
  assert.match(component, /data-view=\{isTop \? "top" : "tree"\}/);
  assert.match(component, /memory-tree-view-toggle/);
  assert.match(component, /onClick=\{toggleView\}/);
  assert.match(component, /onPointerMove/);
  assert.match(component, /setPointerCapture/);
  assert.match(component, /pointerDistance/);
  assert.doesNotMatch(component, /orbit\.targetPolar <= 0\.24/);
  assert.doesNotMatch(component, /orbit\.targetPolar <= 0\.2/);
  assert.match(component, /targetScanProgress/);
  assert.match(component, /const angleAlignment = 1 - THREE\.MathUtils\.smoothstep\(orbit\.polar, 0\.12, 0\.72\)/);
  assert.match(component, /Math\.max\(cubicEase\(angleAlignment\), cubicEase\(orbit\.scanProgress\)\)/);
  assert.match(component, /object\.position\.lerpVectors\(artPosition, qrPosition, qrReveal\)/);
  assert.match(component, /object\.scale\.lerpVectors\(artScale, qrScale, qrReveal\)/);
  assert.doesNotMatch(component, /treeViewGroup\.scale\.y = THREE\.MathUtils\.lerp\(1, 0\.06/);
  assert.match(component, /ArrowLeft/);
  assert.match(component, /targetZoom/);
  assert.match(component, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /devicePixelRatio/);
  assert.match(component, /Math\.min\(container\.clientWidth, 740\)/);
  assert.match(component, /Math\.min\(container\.clientHeight, 740\)/);
  assert.match(component, /sceneState\.leaves\.rotation/);
  assert.match(component, /sceneState\.grassBlades\.setMatrixAt/);
  assert.match(component, /leaf\.mesh\.visible = qrReveal < 0\.92 \|\| index < topLeafCount/);
  assert.match(component, /color: 0xf7f3ec/);
  assert.doesNotMatch(component, /artifactSprite|addArtifactSprite|artifactWorld|stationPixelPalette/);
  assert.doesNotMatch(component, /stops\.slice\(0, 5\)/);
  assert.doesNotMatch(component, /subject-\$\{|subject-top\.webp/);
  assert.doesNotMatch(component, /download=|qr-dialog|diorama-orbit/);
  assert.doesNotMatch(component, /THANKS|FOR PLAYING|LỜI CẢM ƠN/);
  assert.doesNotMatch(component, /rail|đường ray/i);
  assert.doesNotMatch(component, /lightTiles|darkTiles/);

  assert.match(css, /\.thank-you-stop/);
  assert.match(css, /\.memory-tree-stage/);
  assert.match(css, /\.memory-tree-render/);
  assert.match(css, /\.memory-tree-view-toggle/);
  assert.match(css, /\.memory-tree-orbit-guide/);
  assert.match(css, /\.memory-tree-top-note/);
  assert.match(css, /\.memory-tree-fallback-code/);
  assert.match(css, /\.memory-tree-stage\[data-view="top"\][^}]+\.memory-tree-grid/);
  assert.match(css, /touch-action:none/);
  assert.match(css, /\.memory-tree-stage[^}]+contain:layout paint size/);
  assert.match(css, /\.memory-tree-render[^}]+contain:strict/);
  assert.match(css, /\.memory-tree-canvas[^}]+position:absolute/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /\.diorama-orbit|\.qr-dialog-backdrop|content:"360°"/);
});
