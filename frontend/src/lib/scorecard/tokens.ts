import { randomBytes } from "crypto";

/** Unguessable URL-safe token for DOI-confirmation and report links. */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Absolute base URL for links in emails (no trailing slash). */
export function baseUrl(): string {
  return (process.env.BASE_URL ?? "http://localhost:8087").replace(/\/$/, "");
}
