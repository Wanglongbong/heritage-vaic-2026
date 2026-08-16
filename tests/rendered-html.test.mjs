import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the heritage journey", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Tàu Di Sản Việt Nam<\/title>/i);
  assert.match(html, /TÀU DI SẢN/);
  assert.match(html, /HÀNH TRÌNH BẮC/);
  assert.match(html, /UNESCO FILES/);
  assert.doesNotMatch(html, /Codex is working|react-loading-skeleton|codex-preview/i);
});

test("ships five sourced stops and fifteen interactive records", async () => {
  const [heritage, css, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../lib/heritage.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.equal((heritage.match(/number: "0[1-5]"/g) ?? []).length, 5);
  assert.equal((heritage.match(/interaction: "(?:story|audio|animation)"/g) ?? []).length, 15);
  assert.equal((heritage.match(/scene: "\/scenes\//g) ?? []).length, 5);
  assert.match(heritage, /UNESCO Intangible Cultural Heritage/);
  assert.match(page, /<HeritageGame \/>/);
  assert.match(layout, /title: "Tàu Di Sản Việt Nam"/);
  assert.match(css, /\.hotspot\.near/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(packageJson, /"name": "tau-di-san-viet-nam"/);

  await assert.rejects(
    access(new URL("app/_sites-preview", templateRoot)),
  );
});
