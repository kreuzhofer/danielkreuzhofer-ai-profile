/**
 * EngpassCheck component — end-to-end flow (jsdom).
 * Intro → 11 Fragen → vollständiger Report (Punkte 1–10) inkl. Opt-in.
 * Der Report ist jetzt sofort sichtbar (kein Reveal-Button).
 */

import { StrictMode } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { EngpassCheck } from "./EngpassCheck";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => sessionStorage.clear());

/** Click the option with the given accessible label (auto-advances). */
function answer(label: string) {
  fireEvent.click(screen.getByRole("radio", { name: label }));
}

/** Click through all 11 questions taking the first option each. */
function completeQuiz() {
  fireEvent.click(screen.getByRole("button", { name: "Check starten" }));
  for (let i = 0; i < 11; i++) {
    const group = screen.getByRole("radiogroup");
    fireEvent.click(within(group).getAllByRole("radio")[0]);
  }
}

/** "Quellen & Belege" is point 8 — present on every result, absent elsewhere. */
const reportShown = () => screen.queryByText("Quellen & Belege") !== null;

describe("EngpassCheck flow", () => {
  it("renders the intro and starts the quiz", () => {
    render(<EngpassCheck />);
    expect(screen.getByRole("heading", { level: 1, name: "Der Engpass-Check" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Check starten" }));
    expect(screen.queryByRole("button", { name: "Check starten" })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        (_c, el) => el?.className === "ec-progress-label" && /Frage\s*1\s*\/\s*11/.test(el.textContent ?? ""),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Was beschreibt Deine Rolle am besten?" }),
    ).toBeInTheDocument();
  });

  it("walks all 11 questions and renders the full report (points 1–10)", () => {
    render(<EngpassCheck />);
    fireEvent.click(screen.getByRole("button", { name: "Check starten" }));

    // Worst-case diagnosis → score 100 / akut; S5 worst → Weg Stufe 0;
    // four dimensions tie → tie-break picks Mess-Blindflug; S6 = PoC.
    answer("Geschäftsführer / Inhaber");
    answer("50–250");
    answer("Ja, mit Budget");
    answer("Zwei Wochen oder länger");
    answer("Bei praktisch allen");
    answer("Fast alles");
    answer("Nichts — das Wissen ist in Köpfen");
    answer("Nein — oder ich weiß es nicht"); // S5 (3)
    answer("Ja — im Proof of Concept hängengeblieben"); // S6
    answer("Baut regelmäßig eigene Software");
    answer("Dieses Quartal");

    // 1 — Score-Block
    expect(screen.getByText("100", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Akuter Engpass")).toBeInTheDocument();
    // Kontext-Zeile (always)
    expect(screen.getByText(/27 Prozent der Vertriebszeit/)).toBeInTheDocument();

    // 2 — Engpass-Typ heading + Voll-Diagnose (verbatim)
    expect(screen.getByRole("heading", { name: /Mess-Blindflug/ })).toBeInTheDocument();
    expect(screen.getByText(/Du steuerst Deinen Vertrieb, ohne die Instrumente abzulesen/)).toBeInTheDocument();

    // 4 — Schritte (verbatim)
    expect(screen.getByText(/Leg drei Zahlen fest, die Deinen Vertrieb beschreiben/)).toBeInTheDocument();

    // 5 — Weg-Volltext (Stufe 0, weil S5 ≥ 2)
    expect(screen.getByText(/noch keiner — und das ist die richtige Antwort/)).toBeInTheDocument();

    // 6 — GF-Satz
    expect(screen.getByText(/sobald die Baseline steht/)).toBeInTheDocument();

    // 8 — Quellen: nur Salesforce 2024 (Kontext) + Gartner (Mess-Blindflug / PoC)
    expect(screen.getByText("Quellen & Belege")).toBeInTheDocument();
    expect(screen.getByText(/Gartner \(2024\)/)).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /Beleg ansehen/ });
    expect(links).toHaveLength(2);

    // 9 — Opt-in form
    expect(screen.getByLabelText("E-Mail-Adresse")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Report anfordern" })).toBeInTheDocument();

    // 10 — Video-Verweis
    expect(screen.getByText(/Software ist nicht mehr Dein Engpass/)).toBeInTheDocument();
  });

  it("shows the report immediately — there is no reveal button", () => {
    render(<EngpassCheck />);
    completeQuiz();
    expect(reportShown()).toBe(true);
    expect(
      screen.queryByRole("button", { name: /ausführlichen Report ansehen/ }),
    ).not.toBeInTheDocument();
  });

  it("renders only the sources that actually appear (Übergabe-Stau → Schulte + RSP, no Gartner)", () => {
    render(<EngpassCheck />);
    fireEvent.click(screen.getByRole("button", { name: "Check starten" }));
    answer("Vertriebsleiter / Head of Sales");
    answer("50–250");
    answer("Ja, mit Budget");
    answer("1–3 Tage");
    answer("Bei praktisch allen"); // S2 (3) → Übergabe-Stau
    answer("Kaum etwas");
    answer("Praktisch alles");
    answer("Teilweise"); // S5 (1) < 2 → not Stufe 0
    answer("Ja — läuft produktiv, mit messbarem Effekt"); // S6 not PoC → no Gartner
    answer("Reine Infrastruktur — Server, Netzwerk, Lizenzen");
    answer("Dieses Quartal");

    expect(screen.getByRole("heading", { name: /Übergabe-Stau/ })).toBeInTheDocument();
    // Source lines (specific enough to not collide with the diagnosis prose)
    expect(screen.getByText(/Schulte Elektrotechnik, 70 % schnellere Angebote/)).toBeInTheDocument();
    expect(screen.getByText(/RSP Spezialsaugtechnik, 2 Stunden → 10 Minuten/)).toBeInTheDocument();
    expect(screen.queryByText(/Gartner \(2024\)/)).not.toBeInTheDocument();
  });

  // --- Persistence guards (StrictMode = Next dev) ------------------------------

  it("keeps the report on the result after a reload — StrictMode + persistence", () => {
    const { unmount } = render(
      <StrictMode>
        <EngpassCheck />
      </StrictMode>,
    );
    completeQuiz();
    expect(reportShown()).toBe(true);

    unmount(); // simulate a full page reload (sessionStorage persists in jsdom)
    render(
      <StrictMode>
        <EngpassCheck />
      </StrictMode>,
    );

    expect(screen.queryByRole("button", { name: "Check starten" })).not.toBeInTheDocument();
    expect(reportShown()).toBe(true);
  });

  it("clears persistence on 'Neu starten' so a reload shows a fresh intro — StrictMode", () => {
    const { unmount } = render(
      <StrictMode>
        <EngpassCheck />
      </StrictMode>,
    );
    completeQuiz();
    fireEvent.click(screen.getByRole("button", { name: "Neu starten" }));
    expect(screen.getByRole("button", { name: "Check starten" })).toBeInTheDocument();

    unmount(); // reload
    render(
      <StrictMode>
        <EngpassCheck />
      </StrictMode>,
    );
    expect(screen.getByRole("button", { name: "Check starten" })).toBeInTheDocument();
    expect(reportShown()).toBe(false);
  });

  it("submits the opt-in and shows the confirmation on success", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<EngpassCheck />);
    completeQuiz();

    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "lead@firma.de" } });
    fireEvent.click(screen.getByRole("button", { name: "Report anfordern" }));

    expect(await screen.findByText(/schau in Dein Postfach/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/engpass-check", expect.objectContaining({ method: "POST" }));
  });
});
