import { resolveOutcome } from "./outcome";
import type { OutcomeConfig } from "./types";

const BANDS: OutcomeConfig = {
  type: "bands",
  bands: [
    { key: "einkaeufer", min: 0, max: 25 },
    { key: "verwalter", min: 26, max: 50 },
    { key: "mitmacher", min: 51, max: 75 },
    { key: "vorbild", min: 76, max: 100 },
  ],
};

describe("resolveOutcome — bands", () => {
  it.each([
    [0, "einkaeufer"],
    [25, "einkaeufer"],
    [26, "verwalter"],
    [50, "verwalter"],
    [51, "mitmacher"],
    [75, "mitmacher"],
    [76, "vorbild"],
    [100, "vorbild"],
  ])("score %i → %s", (score, key) => {
    expect(resolveOutcome(BANDS, { score, categoryScores: {} })).toBe(key);
  });

  it("throws (fail-fast) when no band matches the score", () => {
    const gappy: OutcomeConfig = { type: "bands", bands: [{ key: "a", min: 0, max: 10 }] };
    expect(() => resolveOutcome(gappy, { score: 50, categoryScores: {} })).toThrow(/no band/i);
  });
});

describe("resolveOutcome — argmax", () => {
  const ARGMAX: OutcomeConfig = {
    type: "argmax",
    over: "category",
    pick: "max",
    outcomes: { nutzung: "doer", sichtbarkeit: "communicator" },
  };

  it("picks the outcome of the highest category", () => {
    expect(resolveOutcome(ARGMAX, { score: 0, categoryScores: { nutzung: 3, sichtbarkeit: 1 } })).toBe(
      "doer",
    );
  });

  it("pick:min selects the lowest category", () => {
    const min: OutcomeConfig = { ...ARGMAX, pick: "min" };
    expect(resolveOutcome(min, { score: 0, categoryScores: { nutzung: 3, sichtbarkeit: 1 } })).toBe(
      "communicator",
    );
  });

  it("ties resolve to the first category in iteration order", () => {
    expect(resolveOutcome(ARGMAX, { score: 0, categoryScores: { nutzung: 2, sichtbarkeit: 2 } })).toBe(
      "doer",
    );
  });

  it("throws when there are no category scores", () => {
    expect(() => resolveOutcome(ARGMAX, { score: 0, categoryScores: {} })).toThrow(/categor/i);
  });

  it("throws when the winning category has no mapped outcome", () => {
    const bad: OutcomeConfig = { ...ARGMAX, outcomes: { sichtbarkeit: "communicator" } };
    expect(() => resolveOutcome(bad, { score: 0, categoryScores: { nutzung: 3 } })).toThrow(/outcome/i);
  });
});
