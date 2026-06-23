import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";
import { isQualified } from "./qualification";

describe("isQualified", () => {
  it("is true when every required question's answer qualifies", () => {
    expect(isQualified(SAMPLE_DEFINITION, { K1: "gf", K2: "mid" })).toBe(true);
  });

  it.each([
    ["K1 disqualifies", { K1: "team", K2: "mid" }],
    ["K2 disqualifies", { K1: "gf", K2: "small" }],
    ["K1 unanswered", { K2: "mid" }],
  ])("is false when %s", (_label, answers) => {
    expect(isQualified(SAMPLE_DEFINITION, answers)).toBe(false);
  });
});
