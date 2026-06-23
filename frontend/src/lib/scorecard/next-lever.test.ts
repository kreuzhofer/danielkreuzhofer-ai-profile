import { computeNextLever } from "./next-lever";

describe("computeNextLever", () => {
  it("pick:min returns the lowest-scoring category", () => {
    expect(computeNextLever({ over: "category", pick: "min" }, { nutzung: 3, sichtbarkeit: 0 })).toBe(
      "sichtbarkeit",
    );
  });

  it("pick:max returns the highest-scoring category", () => {
    expect(computeNextLever({ over: "category", pick: "max" }, { nutzung: 3, sichtbarkeit: 0 })).toBe(
      "nutzung",
    );
  });

  it("ties resolve to the first category in iteration order", () => {
    expect(computeNextLever({ over: "category", pick: "min" }, { a: 2, b: 2 })).toBe("a");
  });

  it("returns undefined when there are no categories", () => {
    expect(computeNextLever({ over: "category", pick: "min" }, {})).toBeUndefined();
  });
});
