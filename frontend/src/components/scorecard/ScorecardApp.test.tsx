import { render, screen, fireEvent, within } from "@testing-library/react";
import { ScorecardApp } from "./ScorecardApp";
import { SAMPLE_REGISTRATION } from "@/lib/scorecard/__fixtures__/sample-registration";

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
});
