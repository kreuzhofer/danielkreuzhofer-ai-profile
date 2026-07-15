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

test("shows score, Typ, the four status rows and the weakest dimension as erster Auftrag", () => {
  // S3 unbekannt (0), rest erledigt (3) → raw 9 → Score 75 · Fast startklar
  const a = answers({ S3: "weiss-nicht" });
  renderView(a);

  expect(screen.getByText(/75 von 100/)).toBeInTheDocument();
  expect(screen.getByText("Fast startklar")).toBeInTheDocument();

  // Vier Status-Zeilen: 3× erledigt, 1× unbekannt
  expect(screen.getAllByText(/erledigt/)).toHaveLength(3);
  expect(screen.getAllByText(/unbekannt/)).toHaveLength(1);

  // Erster Auftrag = schwächste Dimension (Berechtigungen), als kopierbarer Auftrag
  expect(screen.getByText(/Dein erster Auftrag an die IT/)).toBeInTheDocument();
  expect(screen.getByText(/Berechtigungs-Review/)).toBeInTheDocument();
});

test("with everything answered 'weiß nicht', the Anbieter-Auftrag comes first (tie → S1)", () => {
  const a = answers({
    S1: "weiss-nicht", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht",
  });
  renderView(a);
  expect(screen.getByText("Blindflug")).toBeInTheDocument();
  expect(screen.getByText(/KI-Anbieter-Schalter im M365 Admin Center/)).toBeInTheDocument();
});

test("a perfect score switches the Auftrag frame to 'bestätigen lassen'", () => {
  renderView(answers({}));
  expect(screen.getByText("Rollout-ready")).toBeInTheDocument();
  expect(screen.getByText(/keine der vier Entscheidungen offen/)).toBeInTheDocument();
  expect(screen.getAllByText(/erledigt/)).toHaveLength(4);
});

test("S1 = weiß nicht surfaces the date-robust Auto-Enable paragraph", () => {
  renderView(answers({ S1: "weiss-nicht" }));
  expect(screen.getByText(/24\. Juli 2026/)).toBeInTheDocument();
});
