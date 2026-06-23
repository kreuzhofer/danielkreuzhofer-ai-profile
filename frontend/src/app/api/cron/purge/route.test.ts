/**
 * Retention purge — covers both submissions tables.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockPurgeEngpass = jest.fn();
jest.mock("@/db/submissions", () => ({ purgePendingOlderThan: (...a: unknown[]) => mockPurgeEngpass(...a) }));

const mockPurgeScorecard = jest.fn();
jest.mock("@/db/scorecard-submissions", () => ({
  purgeScorecardPendingOlderThan: (...a: unknown[]) => mockPurgeScorecard(...a),
}));

jest.mock("next/server", () => ({
  NextRequest: class {
    public headers: Map<string, string>;
    public nextUrl: URL;
    constructor(url: string, init?: { headers?: Record<string, string> }) {
      this.headers = new Map(Object.entries(init?.headers ?? {}));
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200 }),
  },
}));

const OLD = process.env.CRON_SECRET;
beforeEach(() => {
  mockPurgeEngpass.mockReset().mockResolvedValue(2);
  mockPurgeScorecard.mockReset().mockResolvedValue(3);
  process.env.CRON_SECRET = "s3cret";
});
afterAll(() => {
  process.env.CRON_SECRET = OLD;
});

import { GET } from "./route";

function get(secret?: string): Promise<Response> {
  const url = `http://localhost/api/cron/purge${secret ? `?secret=${secret}` : ""}`;
  const req = new (jest.requireMock("next/server").NextRequest)(url, {});
  return GET(req as never);
}

describe("GET /api/cron/purge", () => {
  it("401s without the secret", async () => {
    const res = await get();
    expect(res.status).toBe(401);
    expect(mockPurgeScorecard).not.toHaveBeenCalled();
  });

  it("purges both tables and reports the combined count", async () => {
    const res = await get("s3cret");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(mockPurgeEngpass).toHaveBeenCalledTimes(1);
    expect(mockPurgeScorecard).toHaveBeenCalledTimes(1);
    expect(data.deleted).toBe(5);
  });
});
