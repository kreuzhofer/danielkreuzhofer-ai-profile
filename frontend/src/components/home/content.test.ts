import { FEATURED_VIDEOS, YOUTUBE_CHANNEL_URL, homeContent } from './content';

describe('home content module', () => {
  it('features the latest channel videos and links the channel', () => {
    expect(FEATURED_VIDEOS.length).toBeGreaterThan(0);
    expect(FEATURED_VIDEOS.every((v) => Boolean(v.id) && Boolean(v.title))).toBe(true);
    expect(YOUTUBE_CHANNEL_URL).toContain('@DanielKreuzhofer');
  });

  it('links the blog teaser to the blog index', () => {
    expect(homeContent.blog.href).toBe('/blog');
  });
});
