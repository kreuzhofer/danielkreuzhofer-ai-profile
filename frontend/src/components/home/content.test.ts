import { FEATURED_VIDEOS, YOUTUBE_CHANNEL_URL, ENGPASS_HREF, COACHING_HREF, homeContent } from './content';

describe('home content module', () => {
  it('features the latest channel videos and links the channel', () => {
    expect(FEATURED_VIDEOS.length).toBeGreaterThan(0);
    expect(FEATURED_VIDEOS.every((v) => Boolean(v.id) && Boolean(v.title))).toBe(true);
    expect(YOUTUBE_CHANNEL_URL).toContain('@DanielKreuzhofer');
  });

  it('makes the micro-magnet the hero primary CTA (not a sales call)', () => {
    expect(homeContent.hero.primaryHref).toBe('/engpass-check');
    expect(ENGPASS_HREF).toBe('/engpass-check');
    expect(COACHING_HREF).toBe('/coaching');
  });
});
