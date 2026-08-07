/**
 * Zod validation schema for the workshop signup form (ticket #7).
 *
 * One schema, used both server-side (API route) and client-side (form).
 * The discriminated union on `isSmallBusiness` determines whether
 * `invoiceUstId` is required (B2B) or omitted (Kleinunternehmer §19).
 */

import { z } from "zod";

const UST_ID_RE = /^DE\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const paymentPreferenceSchema = z.enum(["bank_transfer", "payment_link"]);

/** Base shape shared by both branches of the discriminated union. */
const baseFields = {
  // Anmeldende Person
  firstName: z.string().min(1, "Vorname ist Pflicht").max(100),
  lastName: z.string().min(1, "Nachname ist Pflicht").max(100),
  email: z.string().regex(EMAIL_RE, "Ungültige E-Mail-Adresse").max(200),
  company: z.string().min(1, "Firma ist Pflicht").max(200),
  role: z.string().max(100).optional(),

  // Zweit-Person (optional)
  secondPersonName: z.string().max(100).optional(),
  secondPersonEmail: z.string().max(200).optional(),

  // Rechnungsempfänger (immer Pflicht)
  invoiceCompany: z.string().min(1, "Firmenname ist Pflicht").max(200),
  invoiceContactName: z.string().min(1, "Ansprechpartner ist Pflicht").max(100),
  invoiceEmail: z.string().regex(EMAIL_RE, "Ungültige Rechnungs-E-Mail").max(200),
  invoiceStreet: z.string().min(1, "Straße ist Pflicht").max(200),
  invoiceZip: z.string().min(1, "PLZ ist Pflicht").max(20),
  invoiceCity: z.string().min(1, "Ort ist Pflicht").max(100),
  invoiceCountry: z.string().min(1).max(100).default("Deutschland"),

  // Zahlung
  paymentPreference: paymentPreferenceSchema,

  // Newsletter
  newsletterOptIn: z.boolean().default(false),

  // Tracking
  tid: z.string().max(255).optional(),
};

/** When Zweit-Person email is given, the name must also be given (and vice versa). */
const withSecondPersonRefinement = (data: {
  secondPersonName?: string;
  secondPersonEmail?: string;
}) => {
  const hasName = Boolean(data.secondPersonName);
  const hasEmail = Boolean(data.secondPersonEmail);
  if (hasName !== hasEmail) {
    return false;
  }
  if (hasEmail && data.secondPersonEmail && !EMAIL_RE.test(data.secondPersonEmail)) {
    return false;
  }
  return true;
};

export const workshopSignupSchema = z.discriminatedUnion("isSmallBusiness", [
  z.object({
    ...baseFields,
    isSmallBusiness: z.literal(true),
    invoiceUstId: z.string().max(50).optional(),
  }),
  z.object({
    ...baseFields,
    isSmallBusiness: z.literal(false),
    invoiceUstId: z.string().regex(UST_ID_RE, "USt-IdNr. muss das Format DE123456789 haben"),
  }),
]).refine(withSecondPersonRefinement, {
  message: "Zweit-Person: Name und E-Mail müssen beide angegeben werden (oder beide nicht).",
  path: ["secondPersonEmail"],
});

export type WorkshopSignup = z.infer<typeof workshopSignupSchema>;

/** Parse + validate, returning either the typed data or a map of field errors. */
export function validateWorkshopSignup(input: unknown):
  | { ok: true; data: WorkshopSignup }
  | { ok: false; errors: Record<string, string> } {
  const result = workshopSignupSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
