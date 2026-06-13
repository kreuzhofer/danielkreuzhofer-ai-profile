/**
 * Double-Opt-in confirmation — shared logic used by the confirmation page.
 *
 * Idempotent: confirming an already-confirmed submission just returns the report
 * link. The delivery email and CleverReach newsletter push are best-effort so a
 * provider hiccup never hides the lead's report (the page shows the link too).
 */

import { createLogger } from "@/lib/logger";
import { confirmSubmission, findByDoiToken, markCleverreachSynced } from "@/db/submissions";
import { sendReportDelivery } from "@/lib/email/send";
import {
  addConfirmedNewsletterLead,
  isCleverReachConfigured,
} from "@/lib/engpass-check/cleverreach";
import { isTrackmysalesConfigured, reportLeadConversion } from "@/lib/engpass-check/trackmysales";
import { computeResult } from "@/lib/engpass-check/scoring";
import { TYP_COPY } from "@/lib/engpass-check/copy";
import { baseUrl } from "@/lib/engpass-check/tokens";
import type { Answers } from "@/lib/engpass-check/types";

const log = createLogger("EngpassConfirm");

export type ConfirmResult =
  | { status: "confirmed"; reportUrl: string }
  | { status: "already"; reportUrl: string }
  | { status: "notfound" };

export async function confirmByToken(doiToken: string): Promise<ConfirmResult> {
  const submission = await findByDoiToken(doiToken);
  if (!submission) return { status: "notfound" };

  const reportUrl = `${baseUrl()}/engpass-check/report?token=${submission.reportToken}`;

  // Idempotent: a second click (or an email prefetch) just returns the link.
  if (submission.doiStatus === "confirmed") {
    return { status: "already", reportUrl };
  }

  await confirmSubmission(submission.id);

  const answers = submission.answers as Answers;
  const result = computeResult(answers);

  // Delivery email — best-effort (the page also shows the link). Qualified leads
  // get Variante B (an extra, low-key Erstgespräch CTA); everyone else Variante A.
  try {
    await sendReportDelivery({
      to: submission.email,
      reportUrl,
      typName: TYP_COPY[result.typ].name,
      score: submission.score,
      qualified: submission.qualified,
    });
  } catch (error) {
    log.error("Report delivery email failed (non-fatal)", error);
  }

  // Newsletter push to CleverReach — best-effort, active receiver (we ran our own DOI).
  // Base tag = the lead-magnet (the scorecard id) for later filtering; qualified leads
  // get an extra `<scorecard>-qualified` segment tag. Typ/Weg/score stay in our DB
  // (CleverReach is a newsletter list, not a CRM).
  if (isCleverReachConfigured()) {
    try {
      const tags = submission.qualified
        ? [submission.scorecard, `${submission.scorecard}-qualified`]
        : [submission.scorecard];
      await addConfirmedNewsletterLead({ email: submission.email, tags });
      await markCleverreachSynced(submission.id);
    } catch (error) {
      log.error("CleverReach newsletter push failed (non-fatal)", error);
    }
  }

  // trackmysales attribution — best-effort, server-to-server. Closes the
  // video→lead loop now that we no longer redirect through a /c/:code link.
  if (submission.tid && isTrackmysalesConfigured()) {
    try {
      await reportLeadConversion(submission.tid);
    } catch (error) {
      log.error("trackmysales lead conversion failed (non-fatal)", error);
    }
  }

  return { status: "confirmed", reportUrl };
}
