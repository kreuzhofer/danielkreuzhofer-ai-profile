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
import { buildCleverReachAttributes, computeResult } from "@/lib/engpass-check/scoring";
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

  // Delivery email — best-effort (the page also shows the link).
  try {
    await sendReportDelivery({
      to: submission.email,
      reportUrl,
      typName: TYP_COPY[result.typ].name,
      score: submission.score,
    });
  } catch (error) {
    log.error("Report delivery email failed (non-fatal)", error);
  }

  // Newsletter push to CleverReach — best-effort, active receiver (we ran our own DOI).
  if (isCleverReachConfigured()) {
    try {
      await addConfirmedNewsletterLead({
        email: submission.email,
        attributes: buildCleverReachAttributes(answers, result),
      });
      await markCleverreachSynced(submission.id);
    } catch (error) {
      log.error("CleverReach newsletter push failed (non-fatal)", error);
    }
  }

  return { status: "confirmed", reportUrl };
}
