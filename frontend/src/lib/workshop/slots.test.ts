import fc from 'fast-check';
import { calculateFreeSlots } from './slots';

describe('calculateFreeSlots (property-based)', () => {
  it('never returns a negative number', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100 }), fc.nat({ max: 200 }), (capacity, active) => {
        expect(calculateFreeSlots(capacity, active)).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 3 },
    );
  });

  it('is monotonic — more active submissions means fewer or equal free slots', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100 }), fc.nat({ max: 100 }), (a, b) => {
        const capacity = 50;
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        expect(calculateFreeSlots(capacity, hi)).toBeLessThanOrEqual(calculateFreeSlots(capacity, lo));
      }),
      { numRuns: 3 },
    );
  });

  it('returns zero when active >= capacity', () => {
    expect(calculateFreeSlots(5, 5)).toBe(0);
    expect(calculateFreeSlots(5, 10)).toBe(0);
  });

  it('returns capacity minus active when active < capacity', () => {
    expect(calculateFreeSlots(5, 0)).toBe(5);
    expect(calculateFreeSlots(5, 3)).toBe(2);
  });
});
