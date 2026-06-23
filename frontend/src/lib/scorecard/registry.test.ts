import { buildRegistry } from "./registry";
import { SAMPLE_REGISTRATION } from "./__fixtures__/sample-registration";

const reg = SAMPLE_REGISTRATION;

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
