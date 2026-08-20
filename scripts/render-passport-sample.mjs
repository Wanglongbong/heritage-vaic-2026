import { mkdir, writeFile } from "node:fs/promises";
import pdfMake from "pdfmake/build/pdfmake.js";
import vfs from "pdfmake/build/vfs_fonts.js";
import { stops, getSource } from "../lib/heritage.ts";
import { buildPassportDocument } from "../lib/passport-export.ts";

pdfMake.addVirtualFileSystem(vfs);

const records = stops.flatMap((stop) => stop.hotspots.map((hotspot) => ({
  stationNumber: stop.number,
  stationTitle: stop.title,
  location: stop.location,
  palette: stop.palette,
  itemId: hotspot.id,
  itemLabel: hotspot.label,
  story: hotspot.story,
  sources: hotspot.sourceIds.map(getSource).filter(Boolean),
})));
const seals = stops.map((stop) => ({
  id: stop.id,
  number: stop.number,
  title: stop.title,
  location: stop.location,
  palette: stop.palette,
}));

const definition = buildPassportDocument(records, seals, "vi");
const buffer = await new Promise((resolve) => pdfMake.createPdf(definition).getBuffer(resolve));
const outputDirectory = new URL("../output/pdf/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("tau-di-san-ho-chieu-mau.pdf", outputDirectory), buffer);
