import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the shared guestbook, newest-first credits and two-track ending", async () => {
  const [ending, guestbook, route, schema, css] = await Promise.all([
    readFile(new URL("components/heritage-game.tsx", root), "utf8"),
    readFile(new URL("components/guestbook-credits.tsx", root), "utf8"),
    readFile(new URL("app/api/guestbook/route.ts", root), "utf8"),
    readFile(new URL("db/guestbook.sql", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  const museum = ending.indexOf('id="memory-map"');
  const guestbookPlacement = ending.indexOf("<GuestbookCredits");
  const tree = ending.indexOf("<ThankYouDiorama", guestbookPlacement);
  assert.ok(museum >= 0 && museum < guestbookPlacement && guestbookPlacement < tree);
  assert.match(guestbook, /Big thanks to\.\.\./);
  assert.match(guestbook, /golden-embers\.mp3/);
  assert.match(guestbook, /david-instrumental-slowed\.mp3/);
  assert.match(guestbook, /createPortal/);
  assert.match(guestbook, /ending-overlay-open/);
  assert.match(guestbook, /loadMore\(false\)/);
  assert.match(guestbook, /\[payload\.entry!, \.\.\.current\.filter/);
  const memoryTreeFlow = guestbook.slice(guestbook.indexOf("function goToMemoryTree"), guestbook.indexOf("async function submitGuestbook"));
  assert.match(memoryTreeFlow, /switchToGolden\(\)/);
  assert.doesNotMatch(guestbook, /ending-soundtrack-status/);
  assert.match(route, /order: "created_at\.desc"/);
  assert.match(route, /moderation_state: "eq\.visible"/);
  assert.match(route, /createHash\("sha256"\)/);
  assert.match(route, /status: 429/);
  assert.match(schema, /enable row level security/);
  assert.match(css, /\.guestbook-corner/);
  assert.match(css, /\.community-credits/);
  assert.match(css, /\.ending-screen\.ending-overlay-open/);
  assert.doesNotMatch(css, /\.ending-soundtrack-status/);
  assert.match(css, /Cormorant Garamond Variable/);
});
