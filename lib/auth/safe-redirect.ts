/**
 * Valida un path di redirect interno per prevenire open redirect attacks.
 * Accetta solo path che iniziano con "/" (single slash) e non con "//".
 * Esempi:
 *   safeRedirect("/account") → "/account"
 *   safeRedirect("//evil.com") → "/account" (fallback)
 *   safeRedirect("https://evil.com") → "/account"
 *   safeRedirect(null) → "/account"
 */
export function safeRedirect(
  next: string | null | undefined,
  fallback: string = "/account",
): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  // Reject any protocol scheme (es. javascript:, data:, etc)
  if (trimmed.includes(":")) {
    // Permetti solo se il colon è dopo il primo "?" (querystring)
    const queryStart = trimmed.indexOf("?");
    if (queryStart === -1 || trimmed.indexOf(":") < queryStart) {
      return fallback;
    }
  }
  return trimmed;
}
