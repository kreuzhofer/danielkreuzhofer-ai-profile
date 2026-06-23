import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to `max` hits per key within the window, then blocks", () => {
    const rl = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(rl.check("ip-a", 0)).toBe(true);
    expect(rl.check("ip-a", 100)).toBe(true);
    expect(rl.check("ip-a", 200)).toBe(false);
  });

  it("tracks keys independently", () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(rl.check("ip-a", 0)).toBe(true);
    expect(rl.check("ip-b", 0)).toBe(true);
    expect(rl.check("ip-a", 0)).toBe(false);
  });

  it("forgets hits older than the window", () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(rl.check("ip-a", 0)).toBe(true);
    expect(rl.check("ip-a", 500)).toBe(false);
    expect(rl.check("ip-a", 1001)).toBe(true);
  });
});
