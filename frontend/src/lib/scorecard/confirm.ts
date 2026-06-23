/**
 * Generic scorecard Double-Opt-in confirm — idempotent. Delivery email +
 * CleverReach push are best-effort (a provider hiccup never hides the report).
 * CleverReach gets tags only; all lead data stays in our DB.
 */

import { createLogger } from "@/lib/logger";
import { getScorecard } from "./registry";
import { baseUrl } from "./tokens";
import { sendScorecardDelivery } from "./email";
import { addConfirmedNewsletterLead, isCleverReachConfigured } from "./cleverreach";
import {
  confirmScorecardSubmission,
  findScorecardByDoiToken,
  markScorecardCleverreachSynced,
} from "@/db/scorecard-submissions";

const log = createLogger("ScorecardConfirm");

export type ConfirmResult =
  | { status: "confirmed"; reportUrl: string }
  | { status: "already"; reportUrl: string }
  | { status: "notfound" };

export async function confirmScorecardByToken(doiToken: string): Promise<ConfirmResult> {
  const submission = await findScorecardByDoiToken(doiToken);
  if (!submission) return { status: "notfound" };

  const reportUrl = `${baseUrl()}/${submission.scorecard}/report?token=${submission.reportToken}`;
  if (submission.doiStatus === "confirmed") return { status: "already", reportUrl };

  await confirmScorecardSubmission(submission.id);

  const qualified = submission.result.qualified;
  const source = getScorecard(submission.scorecard)?.cleverreachSource ?? submission.scorecard;
  const deliverySubject =
    getScorecard(submission.scorecard)?.deliverySubject ?? "Dein Ergebnis ist da";

  try {
    await sendScorecardDelivery({
      to: submission.email,
      subject: deliverySubject,
      reportUrl,
      qualified,
    });
  } catch (error) {
    log.error("Scorecard delivery email failed (non-fatal)", error);
  }

  if (isCleverReachConfigured()) {
    try {
      const tags = qualified ? [submission.scorecard, `${submission.scorecard}-qualified`] : [submission.scorecard];
      await addConfirmedNewsletterLead({ email: submission.email, tags, source });
      await markScorecardCleverreachSynced(submission.id);
    } catch (error) {
      log.error("Scorecard CleverReach push failed (non-fatal)", error);
    }
  }

  return { status: "confirmed", reportUrl };
}
