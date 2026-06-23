/**
 * GET /api/scorecard/confirm?token= — confirm + redirect to the report.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockConfirm = jest.fn();
jest.mock("@/lib/scorecard/confirm", () => ({
  confirmScorecardByToken: (...a: unknown[]) => mockConfirm(...a),
}));

jest.mock("next/server", () => ({
  NextRequest: class {
    public nextUrl: URL;
    constructor(url: string) {
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200 }),
    redirect: (url: string | URL, status = 307) =>
      new Response(null, { status, headers: { location: String(url) } }),
  },
}));

import { GET } from "./route";

function get(token?: string): Promise<Response> {
  const qs = token === undefined ? "" : `?token=${token}`;
  const req = new (jest.requireMock("next/server").NextRequest)(
    `http://localhost/api/scorecard/confirm${qs}`,
  );
  return GET(req as never);
}

beforeEach(() => mockConfirm.mockReset());

describe("GET /api/scorecard/confirm", () => {
  it("400s without a token", async () => {
    const res = await get();
    expect(res.status).toBe(400);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("redirects to the report on confirm", async () => {
    mockConfirm.mockResolvedValueOnce({ status: "confirmed", reportUrl: "http://x/sample/report?token=r" });
    const res = await get("doi_abc");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://x/sample/report?token=r");
  });

  it("also redirects when already confirmed", async () => {
    mockConfirm.mockResolvedValueOnce({ status: "already", reportUrl: "http://x/sample/report?token=r" });
    const res = await get("doi_abc");
    expect(res.status).toBe(307);
  });

  it("404s an unknown token", async () => {
    mockConfirm.mockResolvedValueOnce({ status: "notfound" });
    const res = await get("nope");
    expect(res.status).toBe(404);
  });

  it("500s when confirm throws (internals not leaked)", async () => {
    mockConfirm.mockRejectedValueOnce(new Error("boom"));
    const res = await get("doi_abc");
    expect(res.status).toBe(500);
    expect((await res.json()).code).toBe("INTERNAL_ERROR");
  });
});
