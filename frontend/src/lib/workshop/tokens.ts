/**
 * Workshop token utilities (ADR-0002).
 *
 * Action tokens and the admin token are stored as SHA-256 hashes in the DB.
 * The plaintext token exists only in the mail/admin link. A DB leak does not
 * expose valid action links. This module provides the hashing helper and
 * reuses the random-token generator from the scorecard module.
 */

import { createHash } from "node:crypto";
import { newToken } from "@/lib/scorecard/tokens";

/** Hash a token for DB storage (SHA-256 hex). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Generate a new random URL-safe token (reuse scorecard generator). */
export { newToken as newWorkshopToken };
