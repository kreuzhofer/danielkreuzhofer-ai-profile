/** @jest-environment node */
import { sendScorecardDoi, sendScorecardDelivery } from "./email";

const sendMail = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/email/transporter", () => ({
  isEmailConfigured: () => true,
  getTransporter: () => ({ sendMail }),
  getFrom: () => "Test <test@example.com>",
}));
jest.mock("@/lib/logger", () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

beforeEach(() => sendMail.mockClear());

const brand = { brandAuthor: "Daniel Kreuzhofer", accent: "#e89244", accentInk: "#1a1206" };

describe("scorecard branded emails", () => {
  it("DOI mail renders the branded template with brand, scorecard name and confirm link", async () => {
    await sendScorecardDoi({
      to: "lead@firma.de",
      subject: "Betreff",
      confirmUrl: "https://x.test/confirm?token=abc",
      scorecardName: "KI-Führungs-Check",
      ...brand,
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const { to, subject, html } = sendMail.mock.calls[0][0];
    expect(to).toBe("lead@firma.de");
    expect(subject).toBe("Betreff");
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("KI-Führungs-Check");
    expect(html).toContain("https://x.test/confirm?token=abc");
    expect(html).toContain("Daniel Kreuzhofer");
    expect(html).toContain("#e89244");
  });

  it("delivery mail shows the outcome + report link; booking CTA only when qualified", async () => {
    await sendScorecardDelivery({
      to: "lead@firma.de",
      subject: "Report",
      reportUrl: "https://x.test/r?token=xyz",
      scorecardName: "KI-Führungs-Check",
      outcomeLabel: "Einkäufer",
      qualified: false,
      ...brand,
    });
    let html = sendMail.mock.calls[0][0].html;
    expect(html).toContain("Einkäufer");
    expect(html).toContain("https://x.test/r?token=xyz");
    expect(html).not.toContain("30 Minuten buchen");

    sendMail.mockClear();
    await sendScorecardDelivery({
      to: "lead@firma.de",
      subject: "Report",
      reportUrl: "https://x.test/r?token=xyz",
      scorecardName: "KI-Führungs-Check",
      outcomeLabel: "Einkäufer",
      qualified: true,
      bookingUrl: "https://cal.test/30min",
      ...brand,
    });
    html = sendMail.mock.calls[0][0].html;
    expect(html).toContain("30 Minuten buchen");
    expect(html).toContain("https://cal.test/30min");
  });

  it("delivery mail shows no numeric score (score was dropped product-wide)", async () => {
    await sendScorecardDelivery({
      to: "x@y.de",
      subject: "s",
      reportUrl: "https://x.test/r",
      scorecardName: "KI-Führungs-Check",
      outcomeLabel: "Einkäufer",
      qualified: false,
      ...brand,
    });
    expect(sendMail.mock.calls[0][0].html).not.toMatch(/\bvon 100\b/);
  });
});
