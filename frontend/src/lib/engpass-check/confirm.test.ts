/**
 * Double-Opt-in confirm logic — tests (mocked DB / email / CleverReach).
 *
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockFindByDoiToken = jest.fn();
const mockConfirm = jest.fn();
const mockMarkSynced = jest.fn();
jest.mock("@/db/submissions", () => ({
  findByDoiToken: (...a: unknown[]) => mockFindByDoiToken(...a),
  confirmSubmission: (...a: unknown[]) => mockConfirm(...a),
  markCleverreachSynced: (...a: unknown[]) => mockMarkSynced(...a),
}));

const mockSendDelivery = jest.fn();
jest.mock("@/lib/email/send", () => ({
  sendReportDelivery: (...a: unknown[]) => mockSendDelivery(...a),
}));

const mockAddNewsletter = jest.fn();
let cleverreachConfigured = true;
jest.mock("@/lib/engpass-check/cleverreach", () => ({
  addConfirmedNewsletterLead: (...a: unknown[]) => mockAddNewsletter(...a),
  isCleverReachConfigured: () => cleverreachConfigured,
}));

const mockReportLead = jest.fn();
let trackmysalesConfigured = true;
jest.mock("@/lib/engpass-check/trackmysales", () => ({
  reportLeadConversion: (...a: unknown[]) => mockReportLead(...a),
  isTrackmysalesConfigured: () => trackmysalesConfigured,
}));

import { confirmByToken } from "./confirm";

function submission(overrides: Record<string, unknown> = {}) {
  return {
    id: "row-1",
    scorecard: "engpass-check",
    email: "lead@firma.de",
    answers: { K1: "gf", S2: "alle" },
    score: 53,
    band: "spuerbar",
    typ: "uebergabe-stau",
    weg: "weg-a",
    qualified: true,
    doiStatus: "pending",
    reportToken: "rep_abc",
    ...overrides,
  };
}

beforeEach(() => {
  mockFindByDoiToken.mockReset();
  mockConfirm.mockReset().mockResolvedValue(undefined);
  mockMarkSynced.mockReset().mockResolvedValue(undefined);
  mockSendDelivery.mockReset().mockResolvedValue(undefined);
  mockAddNewsletter.mockReset().mockResolvedValue(undefined);
  cleverreachConfigured = true;
  mockReportLead.mockReset().mockResolvedValue({ attributed: true });
  trackmysalesConfigured = true;
});

describe("confirmByToken", () => {
  it("returns notfound for an unknown token", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(undefined);
    expect(await confirmByToken("nope")).toEqual({ status: "notfound" });
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("confirms a pending submission: marks confirmed, sends delivery, pushes newsletter", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(submission());
    const result = await confirmByToken("doi_abc");

    expect(result.status).toBe("confirmed");
    expect(result).toHaveProperty("reportUrl");
    if (result.status === "confirmed") expect(result.reportUrl).toContain("/engpass-check/report?token=rep_abc");

    expect(mockConfirm).toHaveBeenCalledWith("row-1");
    expect(mockSendDelivery).toHaveBeenCalledTimes(1);
    // Default submission is qualified → Variante-B delivery + the qualified segment tag.
    expect(mockSendDelivery).toHaveBeenCalledWith(expect.objectContaining({ qualified: true }));
    expect(mockAddNewsletter).toHaveBeenCalledTimes(1);
    expect(mockAddNewsletter).toHaveBeenCalledWith({
      email: "lead@firma.de",
      tags: ["engpass-check", "engpass-check-qualified"],
    });
    expect(mockMarkSynced).toHaveBeenCalledWith("row-1");
  });

  it("non-qualified lead: Variante-A delivery + only the base tag", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(submission({ qualified: false }));
    await confirmByToken("doi_abc");

    expect(mockSendDelivery).toHaveBeenCalledWith(expect.objectContaining({ qualified: false }));
    expect(mockAddNewsletter).toHaveBeenCalledWith({
      email: "lead@firma.de",
      tags: ["engpass-check"],
    });
  });

  it("is idempotent: an already-confirmed submission just returns the report link", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(submission({ doiStatus: "confirmed" }));
    const result = await confirmByToken("doi_abc");

    expect(result.status).toBe("already");
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockSendDelivery).not.toHaveBeenCalled();
  });

  it("still confirms when the delivery email fails (non-fatal)", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(submission());
    mockSendDelivery.mockRejectedValueOnce(new Error("smtp down"));
    const result = await confirmByToken("doi_abc");
    expect(result.status).toBe("confirmed");
  });

  it("skips the newsletter push when CleverReach is not configured", async () => {
    cleverreachConfigured = false;
    mockFindByDoiToken.mockResolvedValueOnce(submission());
    const result = await confirmByToken("doi_abc");
    expect(result.status).toBe("confirmed");
    expect(mockAddNewsletter).not.toHaveBeenCalled();
  });

  it("reports the trackmysales conversion when the submission has a tid", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(submission({ tid: "tid-xyz" }));
    await confirmByToken("doi_abc");
    expect(mockReportLead).toHaveBeenCalledWith("tid-xyz");
  });

  it("skips trackmysales when the submission has no tid", async () => {
    mockFindByDoiToken.mockResolvedValueOnce(submission()); // factory has no tid
    await confirmByToken("doi_abc");
    expect(mockReportLead).not.toHaveBeenCalled();
  });

  it("still confirms when the trackmysales report fails (non-fatal)", async () => {
    mockReportLead.mockRejectedValueOnce(new Error("tms down"));
    mockFindByDoiToken.mockResolvedValueOnce(submission({ tid: "tid-xyz" }));
    const result = await confirmByToken("doi_abc");
    expect(result.status).toBe("confirmed");
  });
});
