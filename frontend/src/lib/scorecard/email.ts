/**
 * Generic scorecard transactional emails. Reuse the shared SMTP transporter
 * (IONOS). Subjects come from the scorecard registration; the v1 HTML is generic
 * (M3 can switch to per-scorecard templates). Throws EmailNotConfiguredError when
 * SMTP is absent so routes can map it to a 503, exactly like the Engpass funnel.
 */

import { createLogger } from "@/lib/logger";
import { getFrom, getTransporter, isEmailConfigured } from "@/lib/email/transporter";
import { EmailNotConfiguredError } from "@/lib/email/send";

const log = createLogger("ScorecardEmail");

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();
  await getTransporter().sendMail({ from: getFrom(), to, subject, html });
  log.info("Scorecard email sent", { subject });
}

export async function sendScorecardDoi(params: {
  to: string;
  subject: string;
  confirmUrl: string;
}): Promise<void> {
  const html =
    `<p>Ein Klick noch, dann ist Deine Anmeldung bestätigt und Dein Ergebnis unterwegs:</p>` +
    `<p><a href="${params.confirmUrl}">Jetzt bestätigen</a></p>` +
    `<p>Wenn Du das nicht angefordert hast, ignorier diese E-Mail einfach.</p>`;
  await send(params.to, params.subject, html);
}

export async function sendScorecardDelivery(params: {
  to: string;
  subject: string;
  reportUrl: string;
  qualified: boolean;
  bookingUrl?: string;
}): Promise<void> {
  const cta =
    params.qualified && params.bookingUrl
      ? `<p>Wenn Du magst, hol Dir eine zweite Meinung — kein Verkaufsgespräch: ` +
        `<a href="${params.bookingUrl}">15 Minuten buchen</a>.</p>`
      : "";
  const html =
    `<p>Dein Ergebnis und Dein Umsetzungs-Toolkit liegen hier:</p>` +
    `<p><a href="${params.reportUrl}">Zu Deinem Ergebnis</a></p>${cta}`;
  await send(params.to, params.subject, html);
}
