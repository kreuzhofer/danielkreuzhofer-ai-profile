/**
 * Scorecard DOI confirm — idempotent confirm + best-effort delivery/CleverReach.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";

const sampleReg = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
  content: { intro: { eyebrow: "Sample" }, outcomeLabel: {} },
  branding: { brandAuthor: "Daniel Kreuzhofer", accent: "#e89244", accentInk: "#1a1206" },
};
jest.mock("./registry", () => ({ getScorecard: () => sampleReg }));

const mockFind = jest.fn();
const mockConfirm = jest.fn();
const mockMarkSynced = jest.fn();
jest.mock("@/db/scorecard-submissions", () => ({
  findScorecardByDoiToken: (...a: unknown[]) => mockFind(...a),
  confirmScorecardSubmission: (...a: unknown[]) => mockConfirm(...a),
  markScorecardCleverreachSynced: (...a: unknown[]) => mockMarkSynced(...a),
}));

const mockSendDelivery = jest.fn();
jest.mock("./email", () => ({ sendScorecardDelivery: (...a: unknown[]) => mockSendDelivery(...a) }));

const mockAddNewsletter = jest.fn();
let cleverreachConfigured = true;
jest.mock("./cleverreach", () => ({
  addConfirmedNewsletterLead: (...a: unknown[]) => mockAddNewsletter(...a),
  isCleverReachConfigured: () => cleverreachConfigured,
}));

import { confirmScorecardByToken } from "./confirm";

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: "row-1",
    scorecard: "sample",
    email: "lead@firma.de",
    answers: { K1: "gf", K2: "mid", S1: "daily", S2: "no" },
    result: { score: 50, outcome: "verwalter", qualified: true },
    doiStatus: "pending",
    reportToken: "rep_abc",
    ...overrides,
  };
}

beforeEach(() => {
  mockFind.mockReset();
  mockConfirm.mockReset().mockResolvedValue(undefined);
  mockMarkSynced.mockReset().mockResolvedValue(undefined);
  mockSendDelivery.mockReset().mockResolvedValue(undefined);
  mockAddNewsletter.mockReset().mockResolvedValue(undefined);
  cleverreachConfigured = true;
});

describe("confirmScorecardByToken", () => {
  it("notfound for an unknown token", async () => {
    mockFind.mockResolvedValueOnce(undefined);
    expect(await confirmScorecardByToken("nope")).toEqual({ status: "notfound" });
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("confirms: marks confirmed, sends delivery, pushes newsletter with qualified tag", async () => {
    mockFind.mockResolvedValueOnce(row());
    const res = await confirmScorecardByToken("doi_abc");
    expect(res.status).toBe("confirmed");
    if (res.status === "confirmed") expect(res.reportUrl).toContain("/sample/report?token=rep_abc");
    expect(mockConfirm).toHaveBeenCalledWith("row-1");
    expect(mockSendDelivery).toHaveBeenCalledWith(expect.objectContaining({ qualified: true }));
    expect(mockAddNewsletter).toHaveBeenCalledWith({
      email: "lead@firma.de",
      tags: ["sample", "sample-qualified"],
      source: "sample",
    });
    expect(mockMarkSynced).toHaveBeenCalledWith("row-1");
  });

  it("non-qualified: only the base tag", async () => {
    mockFind.mockResolvedValueOnce(row({ result: { score: 0, outcome: "einkaeufer", qualified: false } }));
    await confirmScorecardByToken("doi_abc");
    expect(mockAddNewsletter).toHaveBeenCalledWith({
      email: "lead@firma.de",
      tags: ["sample"],
      source: "sample",
    });
  });

  it("idempotent: already-confirmed just returns the link, no side effects", async () => {
    mockFind.mockResolvedValueOnce(row({ doiStatus: "confirmed" }));
    const res = await confirmScorecardByToken("doi_abc");
    expect(res.status).toBe("already");
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockSendDelivery).not.toHaveBeenCalled();
    expect(mockAddNewsletter).not.toHaveBeenCalled();
  });

  it("still confirms when delivery email fails (non-fatal)", async () => {
    mockFind.mockResolvedValueOnce(row());
    mockSendDelivery.mockRejectedValueOnce(new Error("smtp down"));
    expect((await confirmScorecardByToken("doi_abc")).status).toBe("confirmed");
  });

  it("skips newsletter push when CleverReach is not configured", async () => {
    cleverreachConfigured = false;
    mockFind.mockResolvedValueOnce(row());
    await confirmScorecardByToken("doi_abc");
    expect(mockAddNewsletter).not.toHaveBeenCalled();
  });
});
