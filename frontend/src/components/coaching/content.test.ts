import { BOOKING_URL, ENGPASS_HREF, ABOUT_HREF, coachingContent } from './content';

describe('coaching content module', () => {
  it('exposes the external Calendly booking URL', () => {
    expect(BOOKING_URL).toBe('https://calendly.com/danielkreuzhofer/30min');
    expect(ENGPASS_HREF).toBe('/engpass-check');
    expect(ABOUT_HREF).toBe('/about');
  });

  it('provides hero copy with both CTAs', () => {
    expect(coachingContent.hero.headline).toMatch(/90 Tagen/);
    expect(coachingContent.hero.primaryCta).toBe('Erstgespräch buchen');
    expect(coachingContent.hero.secondaryHref).toBe('/engpass-check');
  });

  it('provides four method phases and a price', () => {
    expect(coachingContent.method.phases).toHaveLength(4);
    expect(coachingContent.investment.heading).toMatch(/5\.900/);
    expect(coachingContent.investment.includes.length).toBeGreaterThanOrEqual(4);
  });

  it('lists the three lead magnets with internal hrefs', () => {
    const hrefs = coachingContent.leadMagnets.magnets.map((m) => m.href);
    expect(hrefs).toEqual(['/engpass-check', '/ki-fuehrungs-check', '/dsgvo-check']);
  });
});
