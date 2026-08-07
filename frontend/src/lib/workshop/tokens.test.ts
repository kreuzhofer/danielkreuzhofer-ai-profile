import fc from 'fast-check';
import { hashToken, newWorkshopToken } from './tokens';

describe('workshop tokens (ADR-0002)', () => {
  describe('hashToken', () => {
    it('is deterministic — same input always produces the same hash', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 100 }), (s) => {
          expect(hashToken(s)).toBe(hashToken(s));
        }),
        { numRuns: 3 },
      );
    });

    it('produces a 64-char hex string (SHA-256)', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 100 }), (s) => {
          const h = hashToken(s);
          expect(h).toMatch(/^[0-9a-f]{64}$/);
        }),
        { numRuns: 3 },
      );
    });

    it('does not collide for distinct random tokens', () => {
      const tokens = Array.from({ length: 100 }, () => newWorkshopToken());
      const hashes = new Set(tokens.map(hashToken));
      expect(hashes.size).toBe(tokens.length);
    });
  });

  describe('newWorkshopToken', () => {
    it('produces a non-empty URL-safe string', () => {
      fc.assert(
        fc.property(fc.nat({ max: 0 }), () => {
          const t = newWorkshopToken();
          expect(t.length).toBeGreaterThan(20);
          expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
        }),
        { numRuns: 3 },
      );
    });
  });
});
