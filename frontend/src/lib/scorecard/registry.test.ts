import { buildRegistry, type ScorecardRegistration } from "./registry";
import { SAMPLE_DEFINITION } from "./__fixtures__/sample-definition";

const reg: ScorecardRegistration = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
};

describe("buildRegistry", () => {
  it("looks a scorecard up by its definition slug", () => {
    const get = buildRegistry([reg]);
    expect(get("sample")).toBe(reg);
  });

  it("returns undefined for an unknown slug", () => {
    const get = buildRegistry([reg]);
    expect(get("nope")).toBeUndefined();
  });
});
