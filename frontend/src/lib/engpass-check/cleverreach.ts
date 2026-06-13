/**
 * CleverReach REST API v3 client — newsletter push (hybrid model).
 *
 * The app runs its OWN Double-Opt-in, so CleverReach is used ONLY to add an
 * already-confirmed lead to the newsletter group as an ACTIVE receiver — no
 * CleverReach DOI form involved. Therefore only 3 credentials are needed
 * (client id/secret + group id); no FORM_ID.
 *
 * Endpoints (REST API v3):
 *   POST /oauth/token.php                      → OAuth client_credentials token
 *   POST /v3/groups.json/{groupId}/receivers   → create receiver (+ PUT to update)
 *
 * Configured via env vars; see `.env.example`. When unconfigured the confirm
 * step skips the push (best-effort) — the lead still gets their report.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("CleverReach");

const SOURCE = "engpass-check";

interface CleverReachConfig {
  clientId?: string;
  clientSecret?: string;
  groupId?: string;
  baseUrl: string;
  tokenUrl: string;
}

function readConfig(): CleverReachConfig {
  return {
    clientId: process.env.CLEVERREACH_CLIENT_ID,
    clientSecret: process.env.CLEVERREACH_CLIENT_SECRET,
    groupId: process.env.CLEVERREACH_GROUP_ID,
    baseUrl: process.env.CLEVERREACH_BASE_URL ?? "https://rest.cleverreach.com",
    tokenUrl: process.env.CLEVERREACH_TOKEN_URL ?? "https://rest.cleverreach.com/oauth/token.php",
  };
}

/** True when the credentials needed for the newsletter push are present. */
export function isCleverReachConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.clientId && c.clientSecret && c.groupId);
}

/** Raised when the integration isn't wired up yet (missing env vars). */
export class CleverReachNotConfiguredError extends Error {
  constructor() {
    super("CleverReach is not configured");
    this.name = "CleverReachNotConfiguredError";
  }
}

/** Raised on any failed CleverReach API call (auth, create/update). */
export class CleverReachError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CleverReachError";
  }
}

// =============================================================================
// OAuth token (cached per serverless instance)
// =============================================================================

let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchToken(config: CleverReachConfig): Promise<{ token: string; expiresIn: number }> {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId ?? "",
      client_secret: config.clientSecret ?? "",
    }),
  });

  if (!response.ok) {
    throw new CleverReachError(`token request failed (HTTP ${response.status})`);
  }

  const data = (await response.json().catch(() => null)) as
    | { access_token?: string; expires_in?: number }
    | null;

  if (!data?.access_token) {
    throw new CleverReachError("token response missing access_token");
  }
  return { token: data.access_token, expiresIn: data.expires_in ?? 3600 };
}

async function getToken(config: CleverReachConfig): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }
  const { token, expiresIn } = await fetchToken(config);
  cachedToken = { token, expiresAt: now + expiresIn * 1000 };
  return token;
}

// =============================================================================
// API calls
// =============================================================================

function crFetch(
  config: CleverReachConfig,
  path: string,
  token: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<Response> {
  return fetch(`${config.baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/** Create the receiver as ACTIVE (confirmed via our own DOI). Falls back to PUT. */
async function upsertActiveReceiver(
  config: CleverReachConfig,
  token: string,
  email: string,
  tags: string[],
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload = { email, registered: now, activated: now, source: SOURCE, tags };

  const created = await crFetch(config, `/v3/groups.json/${config.groupId}/receivers`, token, "POST", payload);
  if (created.ok) return;

  // Receiver likely already exists → update instead.
  const updated = await crFetch(
    config,
    `/v3/groups.json/${config.groupId}/receivers/${encodeURIComponent(email)}`,
    token,
    "PUT",
    payload,
  );
  if (!updated.ok) {
    throw new CleverReachError(
      `receiver upsert failed (create HTTP ${created.status}, update HTTP ${updated.status})`,
    );
  }
}

/**
 * Push an already-confirmed lead to the CleverReach newsletter group as an
 * ACTIVE receiver (consent obtained via our own DOI — no CleverReach DOI form).
 */
export async function addConfirmedNewsletterLead(params: {
  email: string;
  tags: string[];
}): Promise<void> {
  if (!isCleverReachConfigured()) {
    throw new CleverReachNotConfiguredError();
  }
  const config = readConfig();
  const token = await getToken(config);
  await upsertActiveReceiver(config, token, params.email, params.tags);
  log.info("Confirmed Engpass-Check lead added to CleverReach newsletter", { tags: params.tags });
}
