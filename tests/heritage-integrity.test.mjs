import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { approvedSourceIds, sources, stops } from "../lib/heritage.ts";

test("all cultural records are sourced and offer three grounded prompts", async () => {
  assert.equal(stops.length, 5);
  assert.equal(stops.flatMap((stop) => stop.hotspots).length, 15);

  for (const stop of stops) {
    assert.ok(stop.sourceIds.length > 0, `${stop.id} must name a source`);
    assert.ok(stop.sourceIds.every((id) => approvedSourceIds.has(id)), `${stop.id} uses only approved sources`);
    for (const hotspot of stop.hotspots) {
      assert.equal(hotspot.suggestedQuestions.length, 3, `${stop.id}/${hotspot.id} must have three prompts`);
      assert.ok(hotspot.sourceIds.length > 0, `${stop.id}/${hotspot.id} must name a source`);
      assert.ok(hotspot.sourceIds.every((id) => approvedSourceIds.has(id)), `${stop.id}/${hotspot.id} uses only approved sources`);
      assert.match(hotspot.artifactSprite, /^\/artifacts\/.+\.webp$/, `${stop.id}/${hotspot.id} must use a pixel artifact sprite`);
      await access(new URL(`../public${hotspot.artifactSprite}`, import.meta.url));
      const base = hotspot.artifactSprite.split("/").at(-1).replace(/\.webp$/, "");
      for (const view of ["front", "right", "back", "left"]) {
        await access(new URL(`../public/artifacts/turn/${base}-${view}.webp`, import.meta.url));
      }
      for (const prompt of hotspot.suggestedQuestions) {
        assert.ok(prompt.vi.trim().length > 10);
        assert.ok(prompt.en.trim().length > 10);
      }
    }
  }
});

test("every audio asset carries rights metadata and never extracts YouTube", () => {
  const assets = stops.flatMap((stop) => [
    stop.soundscape,
    ...stop.hotspots.flatMap((hotspot) => hotspot.audioPreview ? [hotspot.audioPreview] : []),
    ...(stop.unlock ? [stop.unlock.audio] : []),
  ]);

  for (const asset of assets) {
    assert.ok(asset.id);
    assert.ok(asset.sourceUrl);
    assert.ok(asset.creator);
    assert.ok(asset.license);
    assert.ok(asset.credit.vi && asset.credit.en);
    assert.ok(asset.role);
    assert.ok(asset.reviewStatus);
    assert.ok(!/youtu(?:\.be|be\.com)/i.test(asset.sourceUrl), `${asset.id} must not use YouTube extraction`);

    if (asset.reviewStatus === "pending-rights" || asset.kind === "synthesized") {
      assert.equal(asset.src, null, `${asset.id} must not serve an unlicensed or synthesized recording`);
    }
    if (asset.kind === "synthesized") assert.ok(asset.generatorPreset, `${asset.id} needs a generator preset`);
  }
});

test("Ca trù ensemble unlock and the five-station reveal contracts stay intact", () => {
  const caTru = stops.find((stop) => stop.id === "ca-tru");
  assert.deepEqual(caTru?.unlock?.requiredHotspotIds, ["dan-day", "phach", "praise-drum"]);
  assert.equal(caTru?.unlock?.audio.durationSeconds, 22);
  assert.equal(caTru?.unlock?.audio.reviewStatus, "approved-local");

  const nhaNhac = stops.find((stop) => stop.id === "nha-nhac");
  assert.equal(nhaNhac?.hotspots.length, 3);
  assert.ok(nhaNhac?.hotspots.every((hotspot) => hotspot.audioPreview?.reviewStatus === "pending-rights"));
  assert.ok(nhaNhac?.hotspots.every((hotspot) => hotspot.audioPreview?.src === null));

  const pottery = stops.find((stop) => stop.id === "cham-pottery");
  assert.ok(pottery?.hotspots.some((hotspot) => hotspot.id === "hand-shaping"));
  assert.equal(pottery?.hotspots.find((hotspot) => hotspot.id === "open-firing")?.audioPreview?.src, "/media/open-fire.mp3");

  const taiTu = stops.find((stop) => stop.id === "don-ca-tai-tu");
  assert.equal(taiTu?.hotspots.find((hotspot) => hotspot.id === "sixteen-string-zither")?.audioPreview?.src, "/media/dan-tranh-field.mp3");
});

test("source records distinguish facts from media reuse rights", () => {
  assert.ok(sources.length >= 6);
  for (const source of sources) {
    assert.equal(source.status, "approved");
    assert.ok(source.reviewedBy);
    assert.ok(source.rights.vi && source.rights.en);
    assert.match(source.url, /^https:\/\//);
  }
});
