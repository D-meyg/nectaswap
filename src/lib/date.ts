/**
 * Format an API date/timestamp for display.
 * - Accepts ISO strings (incl. microsecond precision like
 *   "2026-07-26T07:34:21.071839") and plain dates ("2024-01-15").
 * - Includes the time only when the source value has one.
 * - Empty / null → "—"; unparseable → the original string unchanged
 *   (so relative strings like "10 min ago" pass through untouched).
 */
export function formatDate(value: unknown): string {
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  if (!s.trim()) return "—";

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;

  const hasTime = /[T\s]\d{1,2}:\d{2}/.test(s);
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(d);
}

/** Always include the time component (falls back like formatDate). */
export function formatDateTime(value: unknown): string {
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  if (!s.trim()) return "—";

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
