import { YOUTUBE_EMBED_URL, ENGPASS_HREF, COACHING_HREF, homeContent } from './content';

describe('home content module', () => {
  it('embeds the uploads playlist via the privacy-friendly youtube-nocookie domain', () => {
    expect(YOUTUBE_EMBED_URL).toContain('youtube-nocookie.com');
    expect(YOUTUBE_EMBED_URL).toContain('UUAtR5ksFgUGuehXA4BMJwCw');
  });

  it('makes the micro-magnet the hero primary CTA (not a sales call)', () => {
    expect(homeContent.hero.primaryHref).toBe('/engpass-check');
    expect(ENGPASS_HREF).toBe('/engpass-check');
    expect(COACHING_HREF).toBe('/coaching');
  });
});
