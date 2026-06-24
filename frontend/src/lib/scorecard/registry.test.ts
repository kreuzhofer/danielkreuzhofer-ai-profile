import { buildRegistry, getScorecard } from "./registry";
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

test("dsgvo-check is registered with resolve + custom views + tags", () => {
  const reg = getScorecard("dsgvo-check");
  expect(reg).toBeDefined();
  expect(typeof reg!.resolve).toBe("function");
  expect(reg!.ResultView).toBeDefined();
  expect(reg!.ReportDoc).toBeDefined();
  expect(typeof reg!.cleverreachTags).toBe("function");
});
