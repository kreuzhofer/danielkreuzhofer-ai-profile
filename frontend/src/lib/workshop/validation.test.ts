import { workshopSignupSchema, validateWorkshopSignup } from './validation';

/** Minimal valid base payload — tests override individual fields. */
function basePayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@firma.de',
    company: 'Mustermann GmbH',
    role: 'GF',
    invoiceCompany: 'Mustermann GmbH',
    invoiceContactName: 'Max Mustermann',
    invoiceEmail: 'max@firma.de',
    invoiceStreet: 'Hauptstr. 1',
    invoiceZip: '10115',
    invoiceCity: 'Berlin',
    invoiceCountry: 'Deutschland',
    isSmallBusiness: false,
    invoiceUstId: 'DE123456789',
    paymentPreference: 'bank_transfer',
    newsletterOptIn: false,
    ...overrides,
  };
}

describe('workshopSignupSchema', () => {
  it('accepts a valid B2B payload with USt-IdNr', () => {
    const result = workshopSignupSchema.safeParse(basePayload());
    expect(result.success).toBe(true);
  });

  it('accepts a Kleinunternehmer payload without USt-IdNr', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ isSmallBusiness: true, invoiceUstId: undefined }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects a non-Kleinunternehmer without USt-IdNr', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ invoiceUstId: undefined }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects an invalid USt-IdNr format', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ invoiceUstId: 'FR123' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ email: 'nope' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields (firstName)', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ firstName: '' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects an invalid payment preference', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ paymentPreference: 'cash' }),
    );
    expect(result.success).toBe(false);
  });

  it('accepts optional Zweit-Person when both name + email are given', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ secondPersonName: 'Anna', secondPersonEmail: 'anna@firma.de' }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects Zweit-Person with only a name (no email)', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ secondPersonName: 'Anna', secondPersonEmail: undefined }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects Zweit-Person with an invalid email', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ secondPersonName: 'Anna', secondPersonEmail: 'nope' }),
    );
    expect(result.success).toBe(false);
  });

  it('accepts no Zweit-Person (both undefined)', () => {
    const result = workshopSignupSchema.safeParse(
      basePayload({ secondPersonName: undefined, secondPersonEmail: undefined }),
    );
    expect(result.success).toBe(true);
  });
});

describe('validateWorkshopSignup', () => {
  it('returns ok:true with typed data on valid input', () => {
    const result = validateWorkshopSignup(basePayload());
    expect(result.ok).toBe(true);
  });

  it('returns ok:false with field errors on invalid input', () => {
    const result = validateWorkshopSignup(basePayload({ email: 'bad', invoiceUstId: 'bad' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(2);
    }
  });
});
