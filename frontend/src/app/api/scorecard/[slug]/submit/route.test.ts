/**
 * POST /api/scorecard/[slug]/submit — validation, slug lookup, re-score, persist, DOI.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

import { SAMPLE_DEFINITION } from "@/lib/scorecard/__fixtures__/sample-definition";

const sampleReg = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
};
let known = true;
jest.mock("@/lib/scorecard/registry", () => ({
  getScorecard: (slug: string) => (slug === "sample" && known ? sampleReg : undefined),
}));

const mockInsert = jest.fn();
jest.mock("@/db/scorecard-submissions", () => ({
  insertScorecardSubmission: (...a: unknown[]) => mockInsert(...a),
}));

let dbConfigured = true;
jest.mock("@/db/client", () => ({ isDatabaseConfigured: () => dbConfigured }));

const mockSendDoi = jest.fn();
jest.mock("@/lib/scorecard/email", () => {
  return { sendScorecardDoi: (...a: unknown[]) => mockSendDoi(...a) };
});
jest.mock("@/lib/email/send", () => {
  class EmailNotConfiguredError extends Error {}
  return { EmailNotConfiguredError };
});

class MockNextRequest {
  private body: string;
  public headers: Map<string, string>;
  constructor(_url: string, init?: { headers?: Record<string, string>; body?: string }) {
    this.body = init?.body ?? "";
    this.headers = new Map(Object.entries(init?.headers ?? {}));
  }
  async json() {
    return JSON.parse(this.body);
  }
}
jest.mock("next/server", () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

import { POST } from "./route";

function post(slug: string, body: unknown, ip = "9.9.9.9"): Promise<Response> {
  const req = new MockNextRequest(`http://localhost/api/scorecard/${slug}/submit`, {
    headers: { "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
  return POST(req as never, { params: Promise.resolve({ slug }) } as never);
}

const answers = { K1: "gf", K2: "mid", S1: "daily", S2: "no" };

beforeEach(() => {
  mockInsert.mockReset().mockResolvedValue({ id: "row-1" });
  mockSendDoi.mockReset().mockResolvedValue(undefined);
  dbConfigured = true;
  known = true;
});

describe("POST /api/scorecard/[slug]/submit", () => {
  it("404s an unknown scorecard slug", async () => {
    known = false;
    const res = await post("sample", { email: "a@b.de", answers });
    expect(res.status).toBe(404);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("400s an invalid email", async () => {
    const res = await post("sample", { email: "nope", answers });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_EMAIL");
  });

  it("503s when the database is not configured", async () => {
    dbConfigured = false;
    const res = await post("sample", { email: "a@b.de", answers });
    expect(res.status).toBe(503);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("persists a pending submission with a server-side result + sends the DOI email", async () => {
    const res = await post("sample", { email: " lead@firma.de ", answers });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);

    const row = mockInsert.mock.calls[0][0];
    expect(row.scorecard).toBe("sample");
    expect(row.email).toBe("lead@firma.de");
    expect(row.result.outcome).toBe("verwalter");
    expect(row.result.qualified).toBe(true);
    expect(row.doiToken).not.toBe(row.reportToken);

    const mail = mockSendDoi.mock.calls[0][0];
    expect(mail.to).toBe("lead@firma.de");
    expect(mail.subject).toBe("Bestätige Deine Anmeldung");
    expect(mail.confirmUrl).toContain(`/api/scorecard/confirm?token=${row.doiToken}`);
  });

  it("400s when an answer value is not a string", async () => {
    const res = await post("sample", { email: "a@b.de", answers: { K1: 42 } }, "8.8.8.8");
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_REQUEST");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("429s once an IP exceeds the submit rate limit", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await post("sample", { email: "lead@firma.de", answers }, "7.7.7.7");
      expect(res.status).toBe(200);
    }
    const blocked = await post("sample", { email: "lead@firma.de", answers }, "7.7.7.7");
    expect(blocked.status).toBe(429);
  });
});
