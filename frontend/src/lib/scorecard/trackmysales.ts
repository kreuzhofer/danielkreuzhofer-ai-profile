/**
 * Generic scorecard → trackmysales conversion client. Reports a confirmed lead
 * so trackmysales attributes it (final-touch) to the originating click/video.
 * A deliberate generalization of the Engpass `trackmysales.ts`: base URL +
 * secret are shared env (one trackmysales account), but the ConversionLink
 * `code` is PER scorecard (passed in — defaults to the slug), so each lead
 * magnet tracks its own conversions. Server-to-server; the caller treats
 * failures as non-fatal.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("ScorecardTrackmysales");

function readConfig() {
  return {
    baseUrl: process.env.TRACKMYSALES_BASE_URL,
    secret: process.env.TRACKMYSALES_CONVERSION_SECRET,
  };
}

/** True when the shared base URL + conversion secret are present. */
export function isTrackmysalesConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.baseUrl && c.secret);
}

/**
 * Report a confirmed lead to trackmysales for `code` (the per-lead-magnet
 * ConversionLink code, e.g. the scorecard slug). Throws on misconfig or HTTP error.
 */
export async function reportLeadConversion(tid: string, code: string): Promise<{ attributed: boolean }> {
  const c = readConfig();
  if (!c.baseUrl || !c.secret) {
    throw new Error("trackmysales is not configured");
  }
  const response = await fetch(`${c.baseUrl}/api/webhook/conversion/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Conversion-Secret": c.secret },
    body: JSON.stringify({ code, trackingId: tid }),
  });
  if (!response.ok) {
    throw new Error(`trackmysales lead webhook failed (HTTP ${response.status})`);
  }
  const data = (await response.json().catch(() => null)) as { attributed?: boolean } | null;
  log.info("trackmysales lead conversion reported", { code, attributed: data?.attributed ?? false });
  return { attributed: Boolean(data?.attributed) };
}
