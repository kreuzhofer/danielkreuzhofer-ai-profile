/**
 * Generic scorecard transactional emails — branded HTML via Handlebars templates
 * (`email-templates/scorecard-doi.hbs`, `scorecard-delivery.hbs`), the same
 * pattern as the Engpass funnel. Subjects + brand tokens + scorecard name come
 * from the caller (registration). Throws EmailNotConfiguredError when SMTP is
 * absent so routes can map it to a 503, exactly like the Engpass funnel.
 *
 * SECURITY: `confirmUrl`/`reportUrl`/`bookingUrl` are interpolated into the HTML
 * — callers must pass trusted, server-built URLs (never user-supplied values).
 */

import { createLogger } from "@/lib/logger";
import { getFrom, getTransporter, isEmailConfigured } from "@/lib/email/transporter";
import { EmailNotConfiguredError } from "@/lib/email/send";
import { loadTemplate } from "@/lib/email/templates";

const log = createLogger("ScorecardEmail");

/** Brand bits every scorecard email needs to look on-brand. */
interface BrandBits {
  brandAuthor: string;
  accent: string;
  accentInk: string;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();
  await getTransporter().sendMail({ from: getFrom(), to, subject, html });
  log.info("Scorecard email sent", { subject });
}

export async function sendScorecardDoi(
  params: { to: string; subject: string; confirmUrl: string; scorecardName: string } & BrandBits,
): Promise<void> {
  const tpl = await loadTemplate("scorecard-doi");
  const html = tpl({
    confirmUrl: params.confirmUrl,
    scorecardName: params.scorecardName,
    brandAuthor: params.brandAuthor,
    accent: params.accent,
    accentInk: params.accentInk,
  });
  await send(params.to, params.subject, html);
}

export async function sendScorecardDelivery(
  params: {
    to: string;
    subject: string;
    reportUrl: string;
    scorecardName: string;
    outcomeLabel: string;
    qualified: boolean;
    bookingUrl?: string;
  } & BrandBits,
): Promise<void> {
  const tpl = await loadTemplate("scorecard-delivery");
  const html = tpl({
    reportUrl: params.reportUrl,
    scorecardName: params.scorecardName,
    outcomeLabel: params.outcomeLabel,
    qualified: params.qualified,
    bookingUrl: params.bookingUrl,
    brandAuthor: params.brandAuthor,
    accent: params.accent,
    accentInk: params.accentInk,
  });
  await send(params.to, params.subject, html);
}
