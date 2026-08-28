import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("ships the final-stop diorama, clean QR surface and accessible fallbacks", async () => {
  const [component, game, css, assets, qr] = await Promise.all([
    readFile(new URL("components/thank-you-diorama.tsx", projectRoot), "utf8"),
    readFile(new URL("components/heritage-game.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readdir(new URL("public/thanks-diorama/", projectRoot)),
    readFile(new URL("public/thanks-diorama/bank-qr.png", projectRoot)),
  ]);

  assert.equal(assets.filter((name) => /^turn-\d{2}\.webp$/.test(name)).length, 12);
  assert.ok(qr.byteLength > 100_000);
  assert.equal(qr.toString("ascii", 1, 4), "PNG");
  assert.equal(qr.readUInt32BE(16), 1024);
  assert.equal(qr.readUInt32BE(20), 1024);

  assert.match(game, /<ThankYouDiorama language=\{language\} \/>/);
  assert.match(game, /href="#thank-you-stop"/);
  assert.match(component, /GA CUỐI · LỜI CẢM ƠN/);
  assert.match(component, /THANKS/);
  assert.match(component, /FOR PLAYING/);
  assert.match(component, /bank-qr\.png/);
  assert.match(component, /download="tau-di-san-viet-nam-qr\.png"/);
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
  assert.match(css, /\.qr-dialog-backdrop/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});
