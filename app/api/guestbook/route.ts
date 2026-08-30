import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StoredEntry = {
  id: string;
  display_name: string;
  message: string;
  created_at: string;
  submitter_hash?: string;
};

const profanity = ["fuck", "shit", "dmm", "địt mẹ", "địch mẹ", "lồn", "cặc"];
const urlPattern = /(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|xyz|io|vn)\b)/i;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function headers(key: string, extra: Record<string, string> = {}) {
  return { apikey: key, authorization: `Bearer ${key}`, ...extra };
}

function publicEntry(entry: StoredEntry) {
  return { id: entry.id, displayName: entry.display_name, message: entry.message, createdAt: entry.created_at };
}

function cursorFor(entry: StoredEntry) {
  return Buffer.from(entry.created_at, "utf8").toString("base64url");
}

function decodeCursor(value: string | null) {
  if (!value) return null;
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return Number.isNaN(Date.parse(decoded)) ? null : decoded;
  } catch { return null; }
}

function cleanName(value: unknown) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\s+/g, " ").trim() : "";
}

function cleanMessage(value: unknown) {
  return typeof value === "string" ? value.normalize("NFKC").replace(/\r\n?/g, "\n").replace(/[\t ]+/g, " ").trim() : "";
}

function invalidContent(value: string) {
  const normalized = value.toLocaleLowerCase("vi");
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) || urlPattern.test(value) || profanity.some((word) => normalized.includes(word));
}

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function GET(request: NextRequest) {
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ configured: false, entries: [], nextCursor: null });
  const rawLimit = Number(request.nextUrl.searchParams.get("limit") || 50);
  const limit = Math.max(1, Math.min(50, Number.isFinite(rawLimit) ? rawLimit : 50));
  const cursor = decodeCursor(request.nextUrl.searchParams.get("cursor"));
  const query = new URLSearchParams({
    select: "id,display_name,message,created_at",
    moderation_state: "eq.visible",
    order: "created_at.desc",
    limit: String(limit + 1),
  });
  if (cursor) query.set("created_at", `lt.${cursor}`);
  const response = await fetch(`${config.url}/rest/v1/guestbook_entries?${query}`, { headers: headers(config.key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Guestbook storage is temporarily unavailable." }, { status: 502 });
  const rows = await response.json() as StoredEntry[];
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  return NextResponse.json({ configured: true, entries: page.map(publicEntry), nextCursor: hasMore && page.length ? cursorFor(page[page.length - 1]) : null });
}

export async function POST(request: NextRequest) {
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: "Sổ lưu bút online chưa được kết nối." }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4_096) return NextResponse.json({ error: "Nội dung quá lớn." }, { status: 413 });
  let body: { displayName?: unknown; message?: unknown; website?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  if (typeof body.website === "string" && body.website) return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  const displayName = cleanName(body.displayName);
  const message = cleanMessage(body.message);
  if (!displayName || displayName.length > 40) return NextResponse.json({ error: "Tên hiển thị cần có từ 1 đến 40 ký tự." }, { status: 400 });
  if (!message || message.length > 280) return NextResponse.json({ error: "Lời nhắn cần có từ 1 đến 280 ký tự." }, { status: 400 });
  if (invalidContent(`${displayName}\n${message}`)) return NextResponse.json({ error: "Lời nhắn chứa nội dung không phù hợp hoặc liên kết." }, { status: 400 });

  const salt = process.env.GUESTBOOK_HASH_SALT;
  if (!salt) return NextResponse.json({ error: "Sổ lưu bút chưa được cấu hình đầy đủ." }, { status: 503 });
  const submitterHash = createHash("sha256").update(`${salt}:${clientIp(request)}`).digest("hex");
  const rateQuery = new URLSearchParams({
    select: "created_at",
    submitter_hash: `eq.${submitterHash}`,
    created_at: `gte.${new Date(Date.now() - 86_400_000).toISOString()}`,
    order: "created_at.desc",
    limit: "10",
  });
  const rateResponse = await fetch(`${config.url}/rest/v1/guestbook_entries?${rateQuery}`, { headers: headers(config.key), cache: "no-store" });
  if (!rateResponse.ok) return NextResponse.json({ error: "Chưa thể kiểm tra lưu bút lúc này." }, { status: 502 });
  const recent = await rateResponse.json() as Array<{ created_at: string }>;
  if (recent.length >= 10 || (recent[0] && Date.now() - Date.parse(recent[0].created_at) < 30_000)) {
    return NextResponse.json({ error: "Bạn đang gửi quá nhanh. Hãy thử lại sau." }, { status: 429 });
  }

  const insertResponse = await fetch(`${config.url}/rest/v1/guestbook_entries`, {
    method: "POST",
    headers: headers(config.key, { "content-type": "application/json", prefer: "return=representation" }),
    body: JSON.stringify({ display_name: displayName, message, submitter_hash: submitterHash, moderation_state: "visible" }),
  });
  if (!insertResponse.ok) return NextResponse.json({ error: "Chưa thể ghi lời nhắn. Hãy thử lại sau một chút." }, { status: 502 });
  const [entry] = await insertResponse.json() as StoredEntry[];
  if (!entry) return NextResponse.json({ error: "Lời nhắn đã được nhận nhưng chưa thể hiển thị." }, { status: 502 });
  return NextResponse.json({ entry: publicEntry(entry) }, { status: 201 });
}
