'use client';

import React, { useState } from 'react';
import { validateWorkshopSignup } from '@/lib/workshop/validation';

/**
 * Workshop signup form (ticket #7). Client-side validation via the same Zod
 * schema as the server. On success: shows inline „Schau in Dein Postfach".
 * On error: shows per-field errors.
 *
 * The Rechnungsempfänger block is pre-filled from the Anmeldende Person
 * (name + email), editable. The Kleinunternehmer checkbox toggles USt-IdNr
 * requirement.
 */

interface WorkshopFormProps {
  slug: string;
}

type FieldErrors = Record<string, string>;

export function WorkshopForm({ slug }: WorkshopFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Anmeldende Person
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [secondPersonName, setSecondPersonName] = useState('');
  const [secondPersonEmail, setSecondPersonEmail] = useState('');

  // Rechnungsempfänger (pre-filled from Anmeldende Person, editable)
  const [invoiceCompany, setInvoiceCompany] = useState('');
  const [invoiceContactName, setInvoiceContactName] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceStreet, setInvoiceStreet] = useState('');
  const [invoiceZip, setInvoiceZip] = useState('');
  const [invoiceCity, setInvoiceCity] = useState('');
  const [invoiceCountry, setInvoiceCountry] = useState('Deutschland');
  const [invoiceUstId, setInvoiceUstId] = useState('');
  const [isSmallBusiness, setIsSmallBusiness] = useState(false);

  // Zahlung + Newsletter
  const [paymentPreference, setPaymentPreference] = useState<'bank_transfer' | 'payment_link'>('bank_transfer');
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  function preFillInvoice() {
    if (!invoiceContactName) setInvoiceContactName(`${firstName} ${lastName}`.trim());
    if (!invoiceEmail) setInvoiceEmail(email);
    if (!invoiceCompany) setInvoiceCompany(company);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const payload = {
      firstName, lastName, email, company, role: role || undefined,
      secondPersonName: secondPersonName || undefined,
      secondPersonEmail: secondPersonEmail || undefined,
      invoiceCompany, invoiceContactName, invoiceEmail,
      invoiceStreet, invoiceZip, invoiceCity, invoiceCountry,
      invoiceUstId: invoiceUstId || undefined,
      isSmallBusiness,
      paymentPreference,
      newsletterOptIn,
    };

    const validation = validateWorkshopSignup(payload);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/workshop/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
      } else {
        const codeMessages: Record<string, string> = {
          RATE_LIMITED: 'Zu viele Anmeldungen. Bitte versuche es später erneut.',
          SOLD_OUT: 'Alle Plätze sind belegt. Du kommst auf die Warteliste für die nächste Runde.',
          DUPLICATE_RESERVATION: 'Du hast bereits eine Reservierung für diese E-Mail-Adresse.',
          NOT_BOOKABLE: 'Die Anmeldung ist noch nicht freigeschaltet.',
          NOT_CONFIGURED: 'Der Versand ist noch nicht aktiviert.',
          INTERNAL_ERROR: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        };
        setFormError(codeMessages[data.code] ?? 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setFormError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section id="anmeldung" aria-label="Anmeldung" className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">
            Schau in Dein Postfach
          </h2>
          <p className="text-[var(--foreground-muted)] text-lg">
            Deine Reservierung ist eingegangen. Du erhältst eine Bestätigung per E-Mail.
            Der Platz ist fix, sobald die Rechnung bezahlt ist.
          </p>
        </div>
      </section>
    );
  }

  const inputClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]';
  const labelClass = 'block text-sm font-semibold text-[var(--foreground)] mb-1';
  const errorClass = 'text-[var(--primary-400)] text-xs mt-1';

  return (
    <section id="anmeldung" aria-label="Anmeldung" className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">Platz reservieren</h2>

        {formError && (
          <div className="mb-4 rounded-lg border border-[var(--primary-500)] bg-[var(--primary-500)]/10 px-4 py-3 text-[var(--foreground)]">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anmeldende Person */}
          <fieldset>
            <legend className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">Anmeldende Person</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="firstName">Vorname *</label>
                <input id="firstName" className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">Nachname *</label>
                <input id="lastName" className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="email">E-Mail *</label>
                <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={preFillInvoice} required />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="company">Firma *</label>
                <input id="company" className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} onBlur={preFillInvoice} required />
                {errors.company && <p className={errorClass}>{errors.company}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="role">Rolle</label>
                <input id="role" className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="GF / IT-Leiter / andere" />
              </div>
            </div>
          </fieldset>

          {/* Zweit-Person (optional) */}
          <fieldset>
            <legend className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">Zweit-Person (optional, bis 2 Personen pro Unternehmen)</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="secondPersonName">Name</label>
                <input id="secondPersonName" className={inputClass} value={secondPersonName} onChange={(e) => setSecondPersonName(e.target.value)} />
                {errors.secondPersonEmail && <p className={errorClass}>{errors.secondPersonEmail}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="secondPersonEmail">E-Mail</label>
                <input id="secondPersonEmail" type="email" className={inputClass} value={secondPersonEmail} onChange={(e) => setSecondPersonEmail(e.target.value)} />
              </div>
            </div>
            <p className="text-[var(--foreground-muted)] text-xs mt-1">
              Du meldest diese Person an; sie erhält die Workshop-Mails als CC.
            </p>
          </fieldset>

          {/* Rechnungsempfänger */}
          <fieldset>
            <legend className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">Rechnungsempfänger *</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="invoiceCompany">Firmenname / vollst. Name *</label>
                <input id="invoiceCompany" className={inputClass} value={invoiceCompany} onChange={(e) => setInvoiceCompany(e.target.value)} required />
                {errors.invoiceCompany && <p className={errorClass}>{errors.invoiceCompany}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="invoiceContactName">Ansprechpartner *</label>
                <input id="invoiceContactName" className={inputClass} value={invoiceContactName} onChange={(e) => setInvoiceContactName(e.target.value)} required />
                {errors.invoiceContactName && <p className={errorClass}>{errors.invoiceContactName}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="invoiceEmail">E-Mail für Rechnung *</label>
                <input id="invoiceEmail" type="email" className={inputClass} value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} required />
                {errors.invoiceEmail && <p className={errorClass}>{errors.invoiceEmail}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="invoiceStreet">Straße + Nr. *</label>
                <input id="invoiceStreet" className={inputClass} value={invoiceStreet} onChange={(e) => setInvoiceStreet(e.target.value)} required />
                {errors.invoiceStreet && <p className={errorClass}>{errors.invoiceStreet}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="invoiceZip">PLZ *</label>
                <input id="invoiceZip" className={inputClass} value={invoiceZip} onChange={(e) => setInvoiceZip(e.target.value)} required />
                {errors.invoiceZip && <p className={errorClass}>{errors.invoiceZip}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="invoiceCity">Ort *</label>
                <input id="invoiceCity" className={inputClass} value={invoiceCity} onChange={(e) => setInvoiceCity(e.target.value)} required />
                {errors.invoiceCity && <p className={errorClass}>{errors.invoiceCity}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="invoiceCountry">Land *</label>
                <input id="invoiceCountry" className={inputClass} value={invoiceCountry} onChange={(e) => setInvoiceCountry(e.target.value)} required />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input id="isSmallBusiness" type="checkbox" checked={isSmallBusiness} onChange={(e) => setIsSmallBusiness(e.target.checked)} className="rounded" />
                <label htmlFor="isSmallBusiness" className="text-sm text-[var(--foreground)]">
                  Kleinunternehmer §19 (keine USt-IdNr. nötig)
                </label>
              </div>
              {!isSmallBusiness && (
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="invoiceUstId">USt-IdNr. (Format DE123456789) *</label>
                  <input id="invoiceUstId" className={inputClass} value={invoiceUstId} onChange={(e) => setInvoiceUstId(e.target.value)} required />
                  {errors.invoiceUstId && <p className={errorClass}>{errors.invoiceUstId}</p>}
                </div>
              )}
            </div>
          </fieldset>

          {/* Zahlung + Newsletter */}
          <fieldset>
            <legend className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">Zahlung + Newsletter</legend>
            <div className="mb-3">
              <label className={labelClass}>Zahlungspräferenz *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[var(--foreground)]">
                  <input type="radio" name="paymentPreference" value="bank_transfer" checked={paymentPreference === 'bank_transfer'} onChange={() => setPaymentPreference('bank_transfer')} />
                  Überweisung
                </label>
                <label className="flex items-center gap-2 text-[var(--foreground)]">
                  <input type="radio" name="paymentPreference" value="payment_link" checked={paymentPreference === 'payment_link'} onChange={() => setPaymentPreference('payment_link')} />
                  Zahlung per Link
                </label>
              </div>
              {errors.paymentPreference && <p className={errorClass}>{errors.paymentPreference}</p>}
            </div>
            <div className="flex items-start gap-2">
              <input id="newsletterOptIn" type="checkbox" checked={newsletterOptIn} onChange={(e) => setNewsletterOptIn(e.target.checked)} className="rounded mt-1" />
              <label htmlFor="newsletterOptIn" className="text-sm text-[var(--foreground-muted)]">
                Ich möchte regelmäßig Informationen, Tipps und Angebote rund um KI per E-Mail erhalten. Meine Daten werden nicht an Dritte weitergegeben. Eine Abmeldung ist jederzeit möglich.
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center font-medium rounded-lg bg-[var(--primary-500)] text-[var(--accent-ink)] hover:bg-[var(--primary-400)] px-6 py-3 text-lg min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            {submitting ? 'Wird gesendet…' : 'Platz reservieren'}
          </button>
        </form>
      </div>
    </section>
  );
}
