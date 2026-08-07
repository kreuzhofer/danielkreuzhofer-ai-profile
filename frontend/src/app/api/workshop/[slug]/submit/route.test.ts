/**
 * POST /api/workshop/[slug]/submit — validation, slot logic, rate-limit, single-reservation, TrackMySales lead.
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockGetWorkshop = jest.fn();
jest.mock("@/lib/workshop/queries", () => ({
  getWorkshopBySlug: (...a: unknown[]) => mockGetWorkshop(...a),
}));

const mockInsert = jest.fn();
const mockMarkLeadReported = jest.fn();
jest.mock("@/db/workshop-submissions", () => ({
  insertWorkshopSubmission: (...a: unknown[]) => mockInsert(...a),
  markLeadReported: (...a: unknown[]) => mockMarkLeadReported(...a),
}));

let dbConfigured = true;
jest.mock("@/db/client", () => ({ isDatabaseConfigured: () => dbConfigured }));

const mockFreeSlots = jest.fn();
const mockOpenReservations = jest.fn();
jest.mock("@/lib/workshop/slots", () => ({
  getFreeSlots: (...a: unknown[]) => mockFreeSlots(...a),
  countOpenReservationsByEmail: (...a: unknown[]) => mockOpenReservations(...a),
}));

const mockReportLead = jest.fn();
let tmsConfigured = true;
jest.mock("@/lib/scorecard/trackmysales", () => ({
  reportLeadConversion: (...a: unknown[]) => mockReportLead(...a),
  isTrackmysalesConfigured: () => tmsConfigured,
}));

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

let testIpCounter = 0;
function nextIp(): string {
  testIpCounter += 1;
  return `10.0.0.${testIpCounter}`;
}

function post(slug: string, body: unknown, ip?: string): Promise<Response> {
  const resolvedIp = ip ?? nextIp();
  const req = new MockNextRequest(`http://localhost/api/workshop/${slug}/submit`, {
    headers: { "x-forwarded-for": resolvedIp },
    body: JSON.stringify(body),
  });
  return POST(req as never, { params: Promise.resolve({ slug }) } as never);
}

const WORKSHOP = {
  id: "ws-1",
  slug: "ki-souveraenitaet",
  title: "KI-Souveränität im Mittelstand",
  termin: new Date("2026-10-23T10:00:00Z"),
  durationMin: 90,
  priceNetEur: 99,
  capacity: 5,
  minBookedToRun: 3,
  status: "scheduled",
  format: "live_online",
  locationLabel: "live online",
  recordingHint: true,
  adminToken: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function validPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@firma.de",
    company: "Mustermann GmbH",
    role: "GF",
    invoiceCompany: "Mustermann GmbH",
    invoiceContactName: "Max Mustermann",
    invoiceEmail: "max@firma.de",
    invoiceStreet: "Hauptstr. 1",
    invoiceZip: "10115",
    invoiceCity: "Berlin",
    invoiceCountry: "Deutschland",
    isSmallBusiness: false,
    invoiceUstId: "DE123456789",
    paymentPreference: "bank_transfer",
    newsletterOptIn: false,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  dbConfigured = true;
  tmsConfigured = true;
  mockGetWorkshop.mockResolvedValue(WORKSHOP);
  mockInsert.mockResolvedValue({ id: "sub-1" });
  mockFreeSlots.mockResolvedValue(5);
  mockOpenReservations.mockResolvedValue(0);
  mockReportLead.mockResolvedValue({ attributed: true });
  mockMarkLeadReported.mockResolvedValue(undefined);
});

describe("POST /api/workshop/[slug]/submit", () => {
  it("404s an unknown workshop slug", async () => {
    mockGetWorkshop.mockResolvedValue(null);
    const res = await post("unknown", validPayload());
    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe("NOT_FOUND");
  });

  it("400s when termin is NULL (not bookable)", async () => {
    mockGetWorkshop.mockResolvedValue({ ...WORKSHOP, termin: null });
    const res = await post("ki-souveraenitaet", validPayload());
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("NOT_BOOKABLE");
  });

  it("400s on invalid form data (Zod)", async () => {
    const res = await post("ki-souveraenitaet", validPayload({ email: "nope" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_REQUEST");
    expect(json.errors).toBeDefined();
  });

  it("429s when rate-limited (4th submit from same IP)", async () => {
    const ip = "9.9.9.9";
    await post("ki-souveraenitaet", validPayload({ email: "a@firma.de" }), ip);
    await post("ki-souveraenitaet", validPayload({ email: "b@firma.de" }), ip);
    await post("ki-souveraenitaet", validPayload({ email: "c@firma.de" }), ip);
    const res = await post("ki-souveraenitaet", validPayload({ email: "d@firma.de" }), ip);
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("RATE_LIMITED");
  });

  it("409s when no free slots (SOLD_OUT)", async () => {
    mockFreeSlots.mockResolvedValue(0);
    const res = await post("ki-souveraenitaet", validPayload());
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("SOLD_OUT");
  });

  it("409s on duplicate reservation (same email already reserved)", async () => {
    mockOpenReservations.mockResolvedValue(1);
    const res = await post("ki-souveraenitaet", validPayload());
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("DUPLICATE_RESERVATION");
  });

  it("503s when database is not configured", async () => {
    dbConfigured = false;
    const res = await post("ki-souveraenitaet", validPayload());
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("NOT_CONFIGURED");
  });

  it("inserts a reserved submission with hashed action tokens on happy path", async () => {
    const res = await post("ki-souveraenitaet", validPayload({ tid: "abc123" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);

    const row = mockInsert.mock.calls[0][0];
    expect(row.status).toBe("reserved");
    expect(row.workshopId).toBe("ws-1");
    expect(row.email).toBe("max@firma.de");
    expect(row.confirmPaymentToken).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hash
    expect(row.cancelToken).toMatch(/^[0-9a-f]{64}$/);
    expect(row.ipAtSubmit).toMatch(/^10\.0\.0\.\d+$/);
    expect(row.trackingId).toBe("abc123");
  });

  it("fires TrackMySales lead conversion when tid is present", async () => {
    await post("ki-souveraenitaet", validPayload({ tid: "abc123" }));
    expect(mockReportLead).toHaveBeenCalledWith("abc123", "ki-souveraenitaet");
    expect(mockMarkLeadReported).toHaveBeenCalledWith("sub-1");
  });

  it("does not fire TrackMySales when tid is absent", async () => {
    await post("ki-souveraenitaet", validPayload());
    expect(mockReportLead).not.toHaveBeenCalled();
  });

  it("succeeds even if TrackMySales fails (non-fatal)", async () => {
    mockReportLead.mockRejectedValue(new Error("TMS down"));
    const res = await post("ki-souveraenitaet", validPayload({ tid: "abc123" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});
