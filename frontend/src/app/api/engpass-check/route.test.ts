/**
 * POST /api/engpass-check route tests — validation + persist + DOI email.
 *
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockInsert = jest.fn();
jest.mock("@/db/submissions", () => ({
  insertSubmission: (...args: unknown[]) => mockInsert(...args),
}));

let dbConfigured = true;
jest.mock("@/db/client", () => ({
  isDatabaseConfigured: () => dbConfigured,
}));

const mockSendDoi = jest.fn();
jest.mock("@/lib/email/send", () => {
  class EmailNotConfiguredError extends Error {}
  return {
    sendDoiConfirmation: (...args: unknown[]) => mockSendDoi(...args),
    EmailNotConfiguredError,
  };
});

class MockNextRequest {
  private body: string;
  public method: string;
  public headers: Map<string, string>;
  constructor(_url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
    this.body = init?.body ?? "";
    this.method = init?.method ?? "POST";
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
import { EmailNotConfiguredError } from "@/lib/email/send";

function post(body: unknown): Promise<Response> {
  const request = new MockNextRequest("http://localhost/api/engpass-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(request as unknown as Parameters<typeof POST>[0]);
}

const validAnswers = { K1: "gf", K2: "50-250", K3: "ja-budget", K5: "quartal", S2: "alle" };

beforeEach(() => {
  mockInsert.mockReset().mockResolvedValue({ id: "row-1" });
  mockSendDoi.mockReset().mockResolvedValue(undefined);
  dbConfigured = true;
});

describe("POST /api/engpass-check", () => {
  it("rejects a non-object body with 400", async () => {
    const res = await post("nope");
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("rejects an invalid email with 400", async () => {
    const res = await post({ email: "not-an-email", answers: validAnswers });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_EMAIL");
  });

  it("returns 503 when the database is not configured", async () => {
    dbConfigured = false;
    const res = await post({ email: "lead@firma.de", answers: validAnswers });
    expect(res.status).toBe(503);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("persists a pending submission and sends the DOI email", async () => {
    const res = await post({ email: " lead@firma.de ", answers: validAnswers });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);

    const row = mockInsert.mock.calls[0][0];
    expect(row.email).toBe("lead@firma.de"); // trimmed
    expect(row.typ).toBe("uebergabe-stau"); // recomputed server-side
    expect(row.qualified).toBe(true);
    expect(typeof row.doiToken).toBe("string");
    expect(typeof row.reportToken).toBe("string");
    expect(row.doiToken).not.toBe(row.reportToken);

    const mail = mockSendDoi.mock.calls[0][0];
    expect(mail.to).toBe("lead@firma.de");
    expect(mail.confirmUrl).toContain(`token=${row.doiToken}`);
    expect(mail.confirmUrl).toContain("/engpass-check/bestaetigen");
  });

  it("returns 503 when SMTP is not configured (submission still stored)", async () => {
    mockSendDoi.mockRejectedValueOnce(new EmailNotConfiguredError());
    const res = await post({ email: "lead@firma.de", answers: validAnswers });
    expect(res.status).toBe(503);
    expect(mockInsert).toHaveBeenCalledTimes(1); // stored before the email attempt
  });
});
