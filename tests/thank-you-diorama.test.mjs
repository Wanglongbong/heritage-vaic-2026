import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("ships the final-stop diorama, gold QR floor and continuous top projection", async () => {
  const [component, game, css, assets, qr, goldQr, topSprite] = await Promise.all([
    readFile(new URL("components/thank-you-diorama.tsx", projectRoot), "utf8"),
    readFile(new URL("components/heritage-game.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readdir(new URL("public/thanks-diorama/", projectRoot)),
    readFile(new URL("public/thanks-diorama/bank-qr.png", projectRoot)),
    readFile(new URL("public/thanks-diorama/bank-qr-tree-pixel.png", projectRoot)),
    readFile(new URL("public/thanks-diorama/subject-top.webp", projectRoot)),
  ]);

  assert.equal(assets.filter((name) => /^turn-\d{2}\.webp$/.test(name)).length, 12);
  assert.equal(assets.filter((name) => /^subject-\d{2}\.webp$/.test(name)).length, 12);
  assert.ok(qr.byteLength > 100_000);
  assert.equal(qr.toString("ascii", 1, 4), "PNG");
  assert.equal(qr.readUInt32BE(16), 1024);
  assert.equal(qr.readUInt32BE(20), 1024);
  assert.equal(goldQr.toString("ascii", 1, 4), "PNG");
  assert.equal(goldQr.readUInt32BE(16), 1024);
  assert.equal(goldQr.readUInt32BE(20), 1024);
  assert.ok(topSprite.byteLength > 100_000);

  assert.match(game, /<ThankYouDiorama language=\{language\} \/>/);
  assert.match(game, /href="#thank-you-stop"/);
  assert.match(component, /GA CUỐI · CÂY KÝ ỨC/);
  assert.doesNotMatch(component, /THANKS/);
  assert.doesNotMatch(component, /FOR PLAYING/);
  assert.doesNotMatch(component, /LỜI CẢM ƠN/);
  assert.doesNotMatch(component, /diorama-thanks-card/);
  assert.match(component, /bank-qr-tree-pixel\.png/);
  assert.match(component, /subject-top\.webp/);
  assert.match(component, /className="diorama-qr-floor"/);
  assert.match(component, /className="diorama-top-projection"/);
  assert.match(component, /--floor-tilt/);
  assert.match(component, /--subject-opacity/);
  assert.match(component, /--projection-opacity/);
  assert.match(component, /download="tau-di-san-viet-nam-qr-pixel-vang\.png"/);
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /ArrowLeft/);
  assert.match(component, /ArrowRight/);
  assert.match(component, /ArrowUp/);
  assert.match(component, /ArrowDown/);
  assert.match(component, /onPointerDown/);
  assert.doesNotMatch(component, />MB</);
  assert.doesNotMatch(component, /VietQR/);

  assert.match(css, /\.thank-you-stop/);
  assert.match(css, /\.diorama-stage/);
  assert.match(css, /\.diorama-qr-floor/);
  assert.match(css, /\.diorama-subject/);
  assert.match(css, /\.diorama-top-projection/);
  assert.match(css, /\.qr-dialog-backdrop/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});
