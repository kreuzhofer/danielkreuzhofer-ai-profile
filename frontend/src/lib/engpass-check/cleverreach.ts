/**
 * CleverReach REST API v3 client — Engpass-Check submit.
 *
 * Flow (06-quiz-spec.md §Tech-Spec): receiver in Gruppe `engpass-check` anlegen
 * (inaktiv, mit ec_* Attributen) → Double-Opt-in-Mail über das DOI-Formular
 * triggern. CleverReach ist der einzige Verarbeiter — wir halten KEINEN eigenen
 * Datenspeicher.
 *
 * Endpoints (REST API v3):
 *   POST /oauth/token.php                          → OAuth client_credentials token
 *   POST /v3/groups.json/{groupId}/receivers       → create receiver (+ PUT to update)
 *   POST /v3/forms.json/{formId}/send/activate      → trigger Double-Opt-in mail
 *
 * Configured entirely via env vars; see `.env.example`. When unconfigured the
 * route degrades gracefully (the lead still sees their result).
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("CleverReach");

const SOURCE = "engpass-check";

interface CleverReachConfig {
  clientId?: string;
  clientSecret?: string;
  groupId?: string;
  formId?: string;
  baseUrl: string;
  tokenUrl: string;
}

function readConfig(): CleverReachConfig {
  return {
    clientId: process.env.CLEVERREACH_CLIENT_ID,
    clientSecret: process.env.CLEVERREACH_CLIENT_SECRET,
    groupId: process.env.CLEVERREACH_GROUP_ID,
    formId: process.env.CLEVERREACH_FORM_ID,
    baseUrl: process.env.CLEVERREACH_BASE_URL ?? "https://rest.cleverreach.com",
    tokenUrl: process.env.CLEVERREACH_TOKEN_URL ?? "https://rest.cleverreach.com/oauth/token.php",
  };
}

/** True only when every credential needed for a real submit is present. */
export function isCleverReachConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.clientId && c.clientSecret && c.groupId && c.formId);
}

/** Raised when the integration isn't wired up yet (missing env vars). */
export class CleverReachNotConfiguredError extends Error {
  constructor() {
    super("CleverReach is not configured");
    this.name = "CleverReachNotConfiguredError";
  }
}

/** Raised on any failed CleverReach API call (auth, create, DOI). */
export class CleverReachError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CleverReachError";
  }
}

export interface DoiData {
  user_ip: string;
  referer: string;
  user_agent: string;
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
  // Re-use a cached token until 60s before expiry.
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

/** Create/update the receiver. `active` = already confirmed (we ran our own DOI). */
async function upsertReceiver(
  config: CleverReachConfig,
  token: string,
  email: string,
  attributes: Record<string, string>,
  active: boolean,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email,
    registered: now,
    activated: active ? now : 0,
    source: SOURCE,
    attributes,
  };

  const created = await crFetch(config, `/v3/groups.json/${config.groupId}/receivers`, token, "POST", payload);
  if (created.ok) return;

  // Receiver likely already exists → update its attributes instead.
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

/** Trigger the Double-Opt-in email via the configured DOI form. */
async function triggerDoubleOptIn(
  config: CleverReachConfig,
  token: string,
  email: string,
  doidata: DoiData,
): Promise<void> {
  const response = await crFetch(
    config,
    `/v3/forms.json/${config.formId}/send/activate`,
    token,
    "POST",
    { email, doidata },
  );
  if (!response.ok) {
    throw new CleverReachError(`DOI trigger failed (HTTP ${response.status})`);
  }
}

// =============================================================================
// Public entry point
// =============================================================================

export interface SubmitLeadParams {
  email: string;
  attributes: Record<string, string>;
  doidata: DoiData;
}

/**
 * Add the lead to the Engpass-Check group with their answer attributes and send
 * the Double-Opt-in mail. Throws CleverReachNotConfiguredError when env vars are
 * missing, CleverReachError on any API failure.
 *
 * Note: with the app now running its OWN Double-Opt-in, the newsletter push uses
 * `addConfirmedNewsletterLead` instead (active receiver, no second DOI).
 */
export async function submitEngpassLead(params: SubmitLeadParams): Promise<void> {
  if (!isCleverReachConfigured()) {
    throw new CleverReachNotConfiguredError();
  }
  const config = readConfig();
  const token = await getToken(config);
  await upsertReceiver(config, token, params.email, params.attributes, false);
  await triggerDoubleOptIn(config, token, params.email, params.doidata);
  log.info("Engpass-Check lead submitted to CleverReach", { qualified: params.attributes.ec_qualified });
}

/**
 * Push an already-confirmed lead to the CleverReach newsletter group as an
 * ACTIVE receiver (no CleverReach DOI — consent was obtained via our own DOI).
 * Used after our confirmation step.
 */
export async function addConfirmedNewsletterLead(params: {
  email: string;
  attributes: Record<string, string>;
}): Promise<void> {
  if (!isCleverReachConfigured()) {
    throw new CleverReachNotConfiguredError();
  }
  const config = readConfig();
  const token = await getToken(config);
  await upsertReceiver(config, token, params.email, params.attributes, true);
  log.info("Confirmed Engpass-Check lead added to CleverReach newsletter");
}
