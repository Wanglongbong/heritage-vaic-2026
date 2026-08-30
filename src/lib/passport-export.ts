import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Language, LocalizedText, SourceRecord } from "@/lib/types";

export type PassportRecord = {
  stationNumber: string;
  stationTitle: LocalizedText;
  location: LocalizedText;
  palette: string;
  itemId: string;
  itemLabel: LocalizedText;
  story: LocalizedText;
  sources: SourceRecord[];
  audioSource?: {
    id: string;
    title: LocalizedText;
    url: string;
    credit: LocalizedText;
    rights: string;
    note: LocalizedText;
    durationSeconds?: number;
  };
};

export type PassportSeal = {
  id: string;
  number: string;
  title: LocalizedText;
  location: LocalizedText;
  palette: string;
};

function fileDate() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function pdfText(value: string) {
  return value.replace(/[–—‑]/g, "-");
}

export function downloadPassportJson(records: PassportRecord[], seals: PassportSeal[]) {
  const payload = {
    archive: "Tàu Di Sản Việt Nam — Hộ chiếu di sản",
    culturalPolicy: "Source-grounded interpretation only. Cultural review and media rights remain attached to each record.",
    exportedAt: new Date().toISOString(),
    seals,
    records: records.map((record) => ({
      station: { number: record.stationNumber, title: record.stationTitle, location: record.location },
      object: { id: record.itemId, label: record.itemLabel, story: record.story },
      sources: record.sources,
      ...(record.audioSource ? { audioSource: record.audioSource } : {}),
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tau-di-san-ho-chieu-${fileDate()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildPassportDocument(records: PassportRecord[], seals: PassportSeal[], language: Language, craneStampDataUrl?: string): TDocumentDefinitions {
  const vi = language === "vi";
  const content: Content[] = [
    craneStampDataUrl
      ? { columns: [{ image: craneStampDataUrl, width: 48, height: 48, margin: [0, -8, 12, 0] }, { text: vi ? "TÀU DI SẢN VIỆT NAM" : "VIET NAM HERITAGE EXPRESS", style: "eyebrow", margin: [0, 7, 0, 0] }] }
      : { text: vi ? "TÀU DI SẢN VIỆT NAM" : "VIET NAM HERITAGE EXPRESS", style: "eyebrow" },
    { text: vi ? "Hộ chiếu di sản" : "Heritage passport", style: "title" },
    {
      text: vi
        ? "Những hiện vật bạn đã khám phá, đi cùng nguồn đối chiếu và quyền sử dụng được công bố trong trò chơi."
        : "The objects you discovered, together with the cited sources and usage rights published in the game.",
      style: "lead",
    },
    {
      columns: seals.map((seal) => ({
        width: "*",
        stack: [
          { text: `${vi ? "GA" : "STOP"} ${seal.number}`, style: "sealNumber" },
          { text: pdfText(seal.title[language]), style: "sealTitle" },
          { text: pdfText(seal.location[language]), style: "sealLocation" },
        ],
        margin: [3, 0, 3, 0],
      })),
      columnGap: 4,
      margin: [0, 12, 0, 24],
    },
  ];

  if (records.length === 0) {
    content.push({ text: vi ? "Chưa có hồ sơ được mở." : "No records have been opened yet.", style: "empty" });
  } else {
    let activeStation = "";
    records.forEach((record) => {
      const stationKey = `${record.stationNumber}:${record.stationTitle.vi}`;
      let stationHeading: Content | null = null;
      if (stationKey !== activeStation) {
        activeStation = stationKey;
        stationHeading = {
          text: pdfText(`${record.stationNumber}  ${record.stationTitle[language]} · ${record.location[language]}`),
          style: "station",
        };
      }
      const recordStack: Content[] = [
        ...(stationHeading ? [stationHeading] : []),
        { text: pdfText(record.itemLabel[language]), style: "recordTitle" },
        { text: pdfText(record.story[language]), style: "recordBody" },
      ];
      record.sources.forEach((source) => {
        recordStack.push({
          stack: [
            { text: pdfText(`${vi ? "Nguồn đối chiếu" : "Cross-checked source"}: ${source.title[language]}`), style: "sourceTitle" },
            { text: pdfText(`${source.institution} · ${source.reviewedBy}`), style: "sourceMeta" },
            { text: pdfText(`${vi ? "Quyền sử dụng" : "Usage rights"}: ${source.rights[language]}`), style: "sourceMeta" },
            { text: source.url, link: source.url, style: "sourceUrl" },
          ],
          margin: [8, 6, 8, 9],
        });
      });
      if (record.audioSource) {
        recordStack.push({
          stack: [
            { text: pdfText(vi ? "Âm thanh của ga đã mở khóa" : "Unlocked station audio"), style: "sourceTitle" },
            { text: pdfText(`${record.audioSource.title[language]}${record.audioSource.durationSeconds ? ` · ${Math.round(record.audioSource.durationSeconds)}s` : ""}`), style: "sourceMeta" },
            { text: pdfText(record.audioSource.credit[language]), style: "sourceMeta" },
            { text: pdfText(`${vi ? "Quyền sử dụng" : "Usage rights"}: ${record.audioSource.rights}`), style: "sourceMeta" },
            { text: pdfText(record.audioSource.note[language]), style: "sourceMeta" },
            { text: record.audioSource.url, link: record.audioSource.url, style: "sourceUrl" },
          ],
          margin: [8, 6, 8, 9],
        });
      }
      content.push({ stack: recordStack, unbreakable: true, margin: [0, 0, 0, 14] });
    });
  }

  content.push({
    text: vi
      ? "Lưu ý: tài liệu này là hồ sơ khám phá do người chơi tạo. Nội dung công khai đã được đối chiếu nguồn; tài liệu không thay thế sự xác nhận trực tiếp của nghệ nhân hoặc cộng đồng chủ thể."
      : "Note: this is a player-generated discovery record. Public facts are source-checked; it does not replace direct validation by practitioners or source communities.",
    style: "notice",
    margin: [0, 22, 0, 0],
  });

  return {
    pageSize: "A4",
    pageMargins: [44, 52, 44, 52],
    info: {
      title: vi ? "Hộ chiếu di sản - Tàu Di Sản Việt Nam" : "Heritage Passport - Viet Nam Heritage Express",
      author: "Tàu Di Sản Việt Nam",
      subject: "Source-grounded living heritage discovery record",
    },
    defaultStyle: { font: "Roboto", fontSize: 10, color: "#283028", lineHeight: 1.35 },
    footer: (currentPage: number, pageCount: number): any => ({
      columns: [
        { text: `TÀU DI SẢN · ${fileDate()}`, alignment: "left" },
        craneStampDataUrl && currentPage === pageCount
          ? { columns: [{ text: `${currentPage} / ${pageCount}`, alignment: "right" }, { image: craneStampDataUrl, width: 30, height: 30, margin: [10, -10, 0, 0] }], alignment: "right" }
          : { text: `${currentPage} / ${pageCount}`, alignment: "right" },
      ],
      margin: [44, 16, 44, 0],
      color: "#746e61",
      fontSize: 8,
    }),
    content,
    styles: {
      eyebrow: { fontSize: 9, bold: true, color: "#9b5c37", characterSpacing: 2 },
      title: { fontSize: 34, bold: true, color: "#17221a", margin: [0, 8, 0, 8] },
      lead: { fontSize: 12, color: "#5f625c", margin: [0, 0, 0, 8] },
      sealNumber: { alignment: "center", bold: true, color: "#9b5c37", fontSize: 13 },
      sealTitle: { alignment: "center", bold: true, fontSize: 9, margin: [0, 3, 0, 2] },
      sealLocation: { alignment: "center", color: "#6d716a", fontSize: 7 },
      station: { fontSize: 18, bold: true, color: "#9b5c37", margin: [0, 20, 0, 12] },
      recordTitle: { fontSize: 15, bold: true, color: "#17221a", margin: [0, 7, 0, 5] },
      recordBody: { color: "#4f554f", margin: [0, 0, 0, 8] },
      sourceTitle: { bold: true, color: "#355b3c", fontSize: 9 },
      sourceMeta: { color: "#676c65", fontSize: 8, margin: [0, 2, 0, 0] },
      sourceUrl: { color: "#876138", decoration: "underline", fontSize: 7, margin: [0, 3, 0, 0] },
      empty: { alignment: "center", color: "#77796f", margin: [0, 50, 0, 0] },
      notice: { fontSize: 10, color: "#534b40", fillColor: "#f3ead9", margin: [0, 18, 0, 0] },
    },
  };
}

export async function downloadPassportPdf(records: PassportRecord[], seals: PassportSeal[], language: Language) {
  const [pdfModule, fontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  const pdfMake = pdfModule.default;
  pdfMake.addVirtualFileSystem(fontsModule.default);
  let craneStampDataUrl: string | undefined;
  try {
    const response = await fetch("/motifs/crane-stamp-gold.png");
    if (response.ok) {
      const blob = await response.blob();
      craneStampDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid stamp data"));
        reader.onerror = () => reject(reader.error || new Error("Unable to read stamp"));
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Export remains available if the optional decorative motif cannot load.
  }
  const docDefinition = buildPassportDocument(records, seals, language, craneStampDataUrl);
  pdfMake.createPdf(docDefinition).download(`tau-di-san-ho-chieu-${fileDate()}.pdf`);
}
