/**
 * SMTP transporter (nodemailer) — lazy singleton from env config.
 *
 * Stack matches Daniel's existing transactional-email pattern: nodemailer over
 * SMTP, Handlebars templates (see ./templates), env-driven. No i18n lib in this
 * project → subjects are German constants in ./send.
 */

import nodemailer, { type Transporter } from "nodemailer";
import { createLogger } from "@/lib/logger";

const log = createLogger("Email");

function port(): number {
  const p = process.env.SMTP_PORT;
  return p ? Number(p) : 587;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM,
  );
}

/** Warn (do not throw) at startup when SMTP env vars are missing. */
export function validateEmailConfig(): void {
  if (!isEmailConfigured()) {
    log.warn("SMTP is not fully configured — Engpass-Check emails will not be sent");
  }
}

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port(),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587/STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      // Allow self-signed certs in dev (e.g. Mailtrap); strict in production.
      tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
    });
  }
  return transporter;
}

export function getFrom(): string {
  return process.env.SMTP_FROM ?? "";
}

/** Verify the SMTP connection (use in a health check). */
export async function verifyEmailService(): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    await getTransporter().verify();
    return true;
  } catch (error) {
    log.error("SMTP verification failed", error);
    return false;
  }
}
