import { render, screen } from "@testing-library/react";
import { RolloutResultView } from "./RolloutResultView";
import { copilotRolloutCheck } from "./index";
import { buildResult } from "@/lib/scorecard/result";
import type { Answers } from "@/lib/scorecard/types";

const reg = copilotRolloutCheck;

function answers(overrides: Partial<Answers>): Answers {
  const base: Answers = {};
  for (const q of reg.definition.questions) base[q.id] = q.options[0].id;
  return { ...base, ...overrides } as Answers;
}

function renderView(a: Answers) {
  return render(
    <RolloutResultView registration={reg} answers={a} result={buildResult(reg.definition, a)} />,
  );
}

test("shows Typ, acht Status-Zeilen in zwei Gruppen and the weakest dimension as erster Auftrag, but NO numeric score", () => {
  // S3 unbekannt (0), Rest erledigt (3) → raw 21 → intern 88 · Läuft und liefert
  const a = answers({ S3: "weiss-nicht" });
  renderView(a);

  expect(screen.queryByText(/von 100/)).toBeNull();
  expect(screen.getByText("Läuft und liefert")).toBeInTheDocument();

  // Acht Status-Zeilen: 7× erledigt, 1× unbekannt, gruppiert nach Einführung/Nutzung
  expect(screen.getAllByText(/erledigt/)).toHaveLength(7);
  expect(screen.getAllByText(/unbekannt/)).toHaveLength(1);
  expect(screen.getByText("Einführung")).toBeInTheDocument();
  expect(screen.getByText("Nutzung")).toBeInTheDocument();

  // Erster Auftrag = schwächste Dimension (Berechtigungen) → IT-Auftrag
  expect(screen.getByText(/Dein erster Auftrag an die IT/)).toBeInTheDocument();
  expect(screen.getByText(/Berechtigungs-Review/)).toBeInTheDocument();
});

test("a weakest Nutzungs-Dimension addresses the Entscheider, not the IT", () => {
  // N2 unbekannt (0), Rest erledigt → schwächste Dimension: Basislinie
  const a = answers({ N2: "weiss-nicht" });
  renderView(a);
  expect(screen.getByText(/Dein erster Auftrag, und der ist Chefsache/)).toBeInTheDocument();
  expect(screen.queryByText(/Dein erster Auftrag an die IT/)).toBeNull();
  expect(screen.getByText(/Miss den Ist-Zustand, bevor jemand einen Prompt schreibt/)).toBeInTheDocument();
});

test("with everything answered 'weiß nicht', the Anbieter-Auftrag comes first (tie → S1)", () => {
  const a = answers({
    S1: "weiss-nicht", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht",
    N1: "weiss-nicht", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht",
  });
  renderView(a);
  expect(screen.getByText("Blindflug")).toBeInTheDocument();
  expect(screen.getByText(/KI-Anbieter-Schalter im M365 Admin Center/)).toBeInTheDocument();
});

test("a perfect score switches the Auftrag frame to 'bestätigen lassen' over acht Entscheidungen", () => {
  renderView(answers({}));
  expect(screen.getByText("Läuft und liefert")).toBeInTheDocument();
  expect(screen.getByText(/keine der acht Entscheidungen offen/)).toBeInTheDocument();
  expect(screen.getAllByText(/erledigt/)).toHaveLength(8);
});

test("S1 = weiß nicht surfaces the date-robust Auto-Enable paragraph", () => {
  renderView(answers({ S1: "weiss-nicht" }));
  expect(screen.getByText(/24\. Juli 2026/)).toBeInTheDocument();
});
