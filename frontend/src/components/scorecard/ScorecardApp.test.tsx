import { render, screen, fireEvent, within } from "@testing-library/react";
import type { ComponentType } from "react";
import { ScorecardApp } from "./ScorecardApp";
import { SAMPLE_REGISTRATION } from "@/lib/scorecard/__fixtures__/sample-registration";
import type { ScorecardRegistration } from "@/lib/scorecard/registry";
import type { ScorecardResultViewProps } from "@/lib/scorecard/registry";

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/sample");
});

/** Click "start", then take the first option of each question. */
function completeQuiz() {
  fireEvent.click(screen.getByRole("button", { name: "Check starten" }));
  for (let i = 0; i < SAMPLE_REGISTRATION.definition.questions.length; i++) {
    const group = screen.getByRole("radiogroup");
    fireEvent.click(within(group).getAllByRole("radio")[0]);
  }
}

/** Minimal registration for multi-select tests: first Q is multi, second is a trivial score Q. */
const MULTI_REGISTRATION: ScorecardRegistration = {
  ...SAMPLE_REGISTRATION,
  definition: {
    ...SAMPLE_REGISTRATION.definition,
    slug: "multi-test",
    questions: [
      {
        id: "M1",
        kind: "multi",
        prompt: "Pick",
        options: [
          { id: "x", label: "X" },
          { id: "y", label: "Y" },
        ],
      },
      {
        id: "S1",
        kind: "score",
        prompt: "Wie oft?",
        category: "nutzung",
        options: [
          { id: "daily", label: "Täglich", points: 3 },
          { id: "never", label: "Nie", points: 0 },
        ],
      },
    ],
    scoring: { maxPoints: 3, direction: "higher-better" },
    outcome: {
      type: "bands",
      bands: [
        { key: "low", min: 0, max: 50 },
        { key: "high", min: 51, max: 100 },
      ],
    },
    qualification: { requireQualifies: [] },
  },
  content: {
    ...SAMPLE_REGISTRATION.content,
    resultHeading: "Dein Ergebnis",
    outcomeLabel: { low: "Niedrig", high: "Hoch" },
    byOutcome: {
      low: { diagnose: "Niedrig.", schritte: ["Schritt 1."], antiPattern: "X." },
      high: { diagnose: "Hoch.", schritte: ["Schritt 1."], antiPattern: "X." },
    },
  },
};

describe("ScorecardApp", () => {
  it("runs intro → quiz → result and shows the outcome + opt-in", () => {
    render(<ScorecardApp registration={SAMPLE_REGISTRATION} />);
    expect(screen.getByRole("heading", { name: "Der Sample-Check" })).toBeInTheDocument();
    completeQuiz();
    // first option of S1/S2 = daily(3)+active(3) → 100 → vorbild
    expect(screen.getByRole("heading", { name: /Vorbild/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toolkit anfordern" })).toBeInTheDocument();
  });

  it("submits the opt-in to /api/scorecard/<slug>/submit and shows success", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as never;

    render(<ScorecardApp registration={SAMPLE_REGISTRATION} />);
    completeQuiz();
    fireEvent.change(screen.getByLabelText("E-Mail-Adresse"), { target: { value: "a@b.de" } });
    fireEvent.click(screen.getByRole("button", { name: "Toolkit anfordern" }));

    await screen.findByText(/schau in Dein Postfach/);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scorecard/sample/submit",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.email).toBe("a@b.de");
    expect(body.answers.S1).toBe("daily");
  });

  it("multi-select toggles options and advances only via Weiter", () => {
    render(<ScorecardApp registration={MULTI_REGISTRATION} />);
    // Start the quiz
    fireEvent.click(screen.getByRole("button", { name: "Check starten" }));

    // "Pick" question should be visible
    expect(screen.getByText("Pick")).toBeInTheDocument();

    // Weiter button is disabled initially
    const weiter = screen.getByRole("button", { name: "Weiter →" });
    expect(weiter).toBeDisabled();

    // Click option X — it gets aria-checked="true", we stay on question 1
    const group = screen.getByRole("group");
    const optionX = within(group).getByRole("checkbox", { name: /X/ });
    fireEvent.click(optionX);
    expect(optionX).toHaveAttribute("aria-checked", "true");
    // Still on question 1 (prompt "Pick" still visible)
    expect(screen.getByText("Pick")).toBeInTheDocument();

    // Weiter now enabled — click it → advances to question 2
    const weiterAfter = screen.getByRole("button", { name: "Weiter →" });
    expect(weiterAfter).not.toBeDisabled();
    fireEvent.click(weiterAfter);

    // Question 2 prompt should now be visible (no longer on "Pick")
    expect(screen.queryByText("Pick")).not.toBeInTheDocument();
    expect(screen.getByText("Wie oft?")).toBeInTheDocument();
  });

  it("renders registration.ResultView at result phase", () => {
    const CustomResultView: ComponentType<ScorecardResultViewProps> = () => (
      <div data-testid="custom-result" />
    );

    // Single score question → answering it reaches result phase immediately
    const regWithResultView: ScorecardRegistration = {
      ...SAMPLE_REGISTRATION,
      ResultView: CustomResultView,
      definition: {
        ...SAMPLE_REGISTRATION.definition,
        slug: "custom-result-test",
        questions: [
          {
            id: "S1",
            kind: "score",
            prompt: "Wie oft?",
            category: "nutzung",
            options: [
              { id: "daily", label: "Täglich", points: 3 },
              { id: "never", label: "Nie", points: 0 },
            ],
          },
        ],
        scoring: { maxPoints: 3, direction: "higher-better" },
        outcome: {
          type: "bands",
          bands: [
            { key: "low", min: 0, max: 50 },
            { key: "high", min: 51, max: 100 },
          ],
        },
        qualification: { requireQualifies: [] },
      },
      content: {
        ...SAMPLE_REGISTRATION.content,
        resultHeading: "Dein Ergebnis",
        outcomeLabel: { low: "Niedrig", high: "Hoch" },
        byOutcome: {
          low: { diagnose: "Niedrig.", schritte: ["Schritt 1."], antiPattern: "X." },
          high: { diagnose: "Hoch.", schritte: ["Schritt 1."], antiPattern: "X." },
        },
      },
    };

    render(<ScorecardApp registration={regWithResultView} />);
    fireEvent.click(screen.getByRole("button", { name: "Check starten" }));

    // Answer the single question (radio auto-advances to result)
    const group = screen.getByRole("radiogroup");
    fireEvent.click(within(group).getAllByRole("radio")[0]);

    // Custom ResultView is rendered
    expect(screen.getByTestId("custom-result")).toBeInTheDocument();

    // OptIn is still rendered (email input present)
    expect(screen.getByLabelText("E-Mail-Adresse")).toBeInTheDocument();
  });
});
