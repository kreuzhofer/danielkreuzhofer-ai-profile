/**
 * GET/POST /api/cron/purge — auth + retention purge.
 *
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockPurge = jest.fn();
jest.mock("@/db/submissions", () => ({
  purgePendingOlderThan: (...a: unknown[]) => mockPurge(...a),
}));

class MockNextRequest {
  public headers: Map<string, string>;
  public nextUrl: { searchParams: URLSearchParams };
  constructor(init?: { headers?: Record<string, string>; search?: string }) {
    this.headers = new Map(Object.entries(init?.headers ?? {}));
    this.nextUrl = { searchParams: new URLSearchParams(init?.search ?? "") };
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

import { GET } from "./route";

const call = (req: MockNextRequest) => GET(req as unknown as Parameters<typeof GET>[0]);

beforeEach(() => {
  mockPurge.mockReset().mockResolvedValue(3);
  delete process.env.CRON_SECRET;
});

describe("GET /api/cron/purge", () => {
  it("returns 401 when CRON_SECRET is not set", async () => {
    const res = await call(new MockNextRequest({ search: "secret=anything" }));
    expect(res.status).toBe(401);
    expect(mockPurge).not.toHaveBeenCalled();
  });

  it("returns 401 on a wrong secret", async () => {
    process.env.CRON_SECRET = "right";
    const res = await call(new MockNextRequest({ search: "secret=wrong" }));
    expect(res.status).toBe(401);
    expect(mockPurge).not.toHaveBeenCalled();
  });

  it("purges with the correct secret via query and reports the count", async () => {
    process.env.CRON_SECRET = "right";
    const res = await call(new MockNextRequest({ search: "secret=right" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toMatchObject({ ok: true, deleted: 3, retentionDays: 7 });
    expect(mockPurge).toHaveBeenCalledTimes(1);
    // cutoff is a Date in the past (~7 days)
    expect(mockPurge.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it("accepts the secret via Authorization: Bearer", async () => {
    process.env.CRON_SECRET = "right";
    const res = await call(new MockNextRequest({ headers: { authorization: "Bearer right" } }));
    expect(res.status).toBe(200);
    expect(mockPurge).toHaveBeenCalledTimes(1);
  });
});
