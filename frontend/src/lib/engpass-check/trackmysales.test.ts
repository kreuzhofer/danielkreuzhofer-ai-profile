/**
 * trackmysales client tests.
 *
 * @jest-environment node
 */

import { isTrackmysalesConfigured, reportLeadConversion } from "./trackmysales";

const ENV = process.env;

beforeEach(() => {
  process.env = {
    ...ENV,
    TRACKMYSALES_BASE_URL: "https://tms.test",
    TRACKMYSALES_CONVERSION_CODE: "engpass-check",
    TRACKMYSALES_CONVERSION_SECRET: "s3cr3t",
  };
});

afterEach(() => {
  process.env = ENV;
  jest.restoreAllMocks();
});

describe("isTrackmysalesConfigured", () => {
  it("is true when all three vars are set", () => {
    expect(isTrackmysalesConfigured()).toBe(true);
  });
  it("is false when a var is missing", () => {
    delete process.env.TRACKMYSALES_CONVERSION_SECRET;
    expect(isTrackmysalesConfigured()).toBe(false);
  });
});

describe("reportLeadConversion", () => {
  it("POSTs code+trackingId with the secret header and returns attributed", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ attributed: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await reportLeadConversion("tid-123");

    expect(res.attributed).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://tms.test/api/webhook/conversion/lead",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-Conversion-Secret": "s3cr3t" }),
        body: JSON.stringify({ code: "engpass-check", trackingId: "tid-123" }),
      })
    );
  });

  it("throws on a non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(reportLeadConversion("tid-123")).rejects.toThrow();
  });
});
