import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("ships a QR-derived 3D memory tree with a static train and tap-to-top interaction", async () => {
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
  assert.match(component, /grassPositions/);
  assert.match(component, /trainModulePositions/);
  assert.match(component, /const train = new THREE\.Group/);
  assert.match(component, /const \[isTop, setIsTop\] = useState\(false\)/);
  assert.match(component, /data-view=\{isTop \? "top" : "tree"\}/);
  assert.match(component, /onClick=\{toggleView\}/);
  assert.match(component, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /devicePixelRatio/);
  assert.match(component, /Math\.min\(container\.clientWidth, 740\)/);
  assert.match(component, /Math\.min\(container\.clientHeight, 740\)/);
  assert.match(component, /sceneState\.leaves\.rotation/);
  assert.match(component, /sceneState\.grass\.rotation/);
  assert.doesNotMatch(component, /onPointerMove|onPointerDown|ArrowLeft|ArrowRight/);
  assert.doesNotMatch(component, /subject-\$\{|subject-top\.webp/);
  assert.doesNotMatch(component, /download=|qr-dialog|diorama-orbit/);
  assert.doesNotMatch(component, /THANKS|FOR PLAYING|LỜI CẢM ƠN/);
  assert.doesNotMatch(component, /rail|đường ray/i);

  assert.match(css, /\.thank-you-stop/);
  assert.match(css, /\.memory-tree-stage/);
  assert.match(css, /\.memory-tree-render/);
  assert.match(css, /\.memory-tree-view-badge/);
  assert.match(css, /\.memory-tree-tap-prompt/);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /\.memory-tree-stage[^}]+contain:layout paint size/);
  assert.match(css, /\.memory-tree-render[^}]+contain:strict/);
  assert.match(css, /\.memory-tree-canvas[^}]+position:absolute/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /\.diorama-orbit|\.qr-dialog-backdrop|content:"360°"/);
});
