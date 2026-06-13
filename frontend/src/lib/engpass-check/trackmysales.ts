/**
 * trackmysales conversion client — reports a confirmed lead so trackmysales
 * attributes it (final-touch) to the originating click/video. Server-to-server;
 * the caller treats failures as non-fatal.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("Trackmysales");

function readConfig() {
  return {
    baseUrl: process.env.TRACKMYSALES_BASE_URL,
    code: process.env.TRACKMYSALES_CONVERSION_CODE,
    secret: process.env.TRACKMYSALES_CONVERSION_SECRET,
  };
}

/** True when base URL, conversion code and secret are all present. */
export function isTrackmysalesConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.baseUrl && c.code && c.secret);
}

/** Report a confirmed lead to trackmysales. Throws on misconfig or HTTP error. */
export async function reportLeadConversion(tid: string): Promise<{ attributed: boolean }> {
  const c = readConfig();
  if (!c.baseUrl || !c.code || !c.secret) {
    throw new Error("trackmysales is not configured");
  }
  const response = await fetch(`${c.baseUrl}/api/webhook/conversion/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Conversion-Secret": c.secret },
    body: JSON.stringify({ code: c.code, trackingId: tid }),
  });
  if (!response.ok) {
    throw new Error(`trackmysales lead webhook failed (HTTP ${response.status})`);
  }
  const data = (await response.json().catch(() => null)) as { attributed?: boolean } | null;
  log.info("trackmysales lead conversion reported", { attributed: data?.attributed ?? false });
  return { attributed: Boolean(data?.attributed) };
}
