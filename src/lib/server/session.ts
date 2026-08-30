// OpenAI safety_identifier accepts at most 64 characters. Browser-generated
// UUIDs fit this contract and contain no personal information.
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export function parseSessionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return SESSION_ID_PATTERN.test(normalized) ? normalized : null;
}

export function sessionIdFromRequest(request: Request, bodyValue?: unknown): string | null {
  return parseSessionId(bodyValue) ?? parseSessionId(request.headers.get("x-session-id"));
}
