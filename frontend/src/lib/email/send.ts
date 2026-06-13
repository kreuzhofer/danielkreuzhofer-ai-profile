/**
 * Engpass-Check transactional emails.
 *
 * One exported function per email type. Each renders its Handlebars template,
 * builds links from the caller-supplied URLs, and sends via the SMTP transporter.
 * Subjects are German constants (no i18n lib in this project).
 */

import { createLogger } from "@/lib/logger";
import { getFrom, getTransporter, isEmailConfigured } from "./transporter";
import { loadTemplate } from "./templates";

const log = createLogger("Email");

/** Raised when SMTP isn't configured — the route maps this to a 503. */
export class EmailNotConfiguredError extends Error {
  constructor() {
    super("SMTP is not configured");
    this.name = "EmailNotConfiguredError";
  }
}

const SUBJECTS = {
  doiConfirmation: "Ein Klick noch, dann hast Du Deinen Engpass-Report",
  reportDelivery: "Dein Engpass-Report ist da — plus Dein Umsetzungs-Toolkit",
} as const;

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();
  await getTransporter().sendMail({ from: getFrom(), to, subject, html });
  log.info("Email sent", { subject });
}

/** Double-Opt-in confirmation (DSGVO). Copy verbatim from funnel 03. */
export async function sendDoiConfirmation(params: { to: string; confirmUrl: string }): Promise<void> {
  const tpl = await loadTemplate("doi-confirmation");
  await send(params.to, SUBJECTS.doiConfirmation, tpl({ confirmUrl: params.confirmUrl }));
}

/** Delivery email with the link to the personalized report + toolkit. */
export async function sendReportDelivery(params: {
  to: string;
  reportUrl: string;
  typName: string;
  score: number;
}): Promise<void> {
  const tpl = await loadTemplate("report-delivery");
  await send(
    params.to,
    SUBJECTS.reportDelivery,
    tpl({ reportUrl: params.reportUrl, typName: params.typName, score: params.score }),
  );
}
