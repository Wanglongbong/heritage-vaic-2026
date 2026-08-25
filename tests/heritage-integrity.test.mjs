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

test("every audio asset carries rights metadata and local files are explicitly approved", async () => {
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
    if (/youtu(?:\.be|be\.com)/i.test(asset.sourceUrl)) {
      assert.match(asset.license, /User-confirmed permission/, `${asset.id} needs explicit public-use confirmation`);
      assert.equal(asset.reviewStatus, "approved-local");
    }
    if (asset.kind === "youtube-embed") {
      assert.match(asset.embedUrl || "", /^https:\/\/www\.youtube\.com\/embed\//, `${asset.id} must use an explicit embed URL`);
      assert.equal(asset.src, null, `${asset.id} must never ship a downloaded YouTube file`);
    }

    if (asset.reviewStatus === "pending-rights" || asset.kind === "synthesized") {
      assert.equal(asset.src, null, `${asset.id} must not serve an unlicensed or synthesized recording`);
    }
    if (asset.kind === "synthesized") assert.ok(asset.generatorPreset, `${asset.id} needs a generator preset`);
    if (asset.src) await access(new URL(`../public${asset.src}`, import.meta.url));
  }
});

test("all five stations unlock the right station-level sound after three objects", () => {
  const quanHo = stops.find((stop) => stop.id === "quan-ho");
  assert.deepEqual(quanHo?.unlock?.requiredHotspotIds, ["round-hat", "paired-singing", "melody-book"]);
  assert.equal(quanHo?.unlock?.audio.src, "/media/quan-ho-unlock.ogg");
  assert.ok(quanHo?.hotspots.every((hotspot) => !hotspot.audioPreview));

  const caTru = stops.find((stop) => stop.id === "ca-tru");
  assert.deepEqual(caTru?.unlock?.requiredHotspotIds, ["dan-day", "phach", "praise-drum"]);
  assert.equal(caTru?.unlock?.audio.durationSeconds, 22);
  assert.equal(caTru?.unlock?.audio.reviewStatus, "approved-local");
  assert.ok(caTru?.hotspots.every((hotspot) => !hotspot.audioPreview));

  const nhaNhac = stops.find((stop) => stop.id === "nha-nhac");
  assert.equal(nhaNhac?.hotspots.length, 3);
  assert.ok(nhaNhac?.hotspots.every((hotspot) => !hotspot.audioPreview));
  assert.equal(nhaNhac?.unlock?.audio.src, "/media/nha-nhac-unlock.ogg");

  const pottery = stops.find((stop) => stop.id === "cham-pottery");
  assert.ok(pottery?.hotspots.some((hotspot) => hotspot.id === "hand-shaping"));
  assert.equal(pottery?.hotspots.find((hotspot) => hotspot.id === "hand-shaping")?.interaction, "story");
  assert.equal(pottery?.hotspots.find((hotspot) => hotspot.id === "hand-shaping")?.media, undefined);
  assert.equal(pottery?.hotspots.find((hotspot) => hotspot.id === "open-firing")?.interaction, "story");
  assert.equal(pottery?.hotspots.find((hotspot) => hotspot.id === "open-firing")?.media, undefined);
  assert.equal(pottery?.hotspots.find((hotspot) => hotspot.id === "open-firing")?.audioPreview?.src, "/media/open-fire.mp3");
  assert.equal(pottery?.unlock?.audio.role, "interpretive-foley");
  assert.equal(pottery?.unlock?.audio.src, "/media/cham-workyard-unlock.ogg");

  const taiTu = stops.find((stop) => stop.id === "don-ca-tai-tu");
  assert.ok(taiTu?.hotspots.every((hotspot) => !hotspot.audioPreview));
  assert.equal(taiTu?.unlock?.audio.src, "/media/don-ca-tai-tu-unlock.ogg");
  assert.match(taiTu?.unlock?.audio.credit.vi || "", /14:31–16:01/);
  assert.equal(taiTu?.unlock?.audio.sha256, "0b59be2da17547f862cbc36c9ea7039642b18d6cbcc9de6933d42867fce2a9a6");
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
