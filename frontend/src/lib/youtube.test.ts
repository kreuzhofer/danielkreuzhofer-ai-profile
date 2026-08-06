import { getLatestVideos } from './youtube';
import { FEATURED_VIDEOS } from '@/components/home/content';

describe('getLatestVideos', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('parses the latest videos (id + decoded title) from the channel RSS feed', async () => {
    const xml = `<feed><title>Daniel Kreuzhofer</title>
      <entry><yt:videoId>aaa111</yt:videoId><title>Erstes Video &amp; mehr</title><link rel="alternate" href="https://www.youtube.com/watch?v=aaa111"/></entry>
      <entry><yt:videoId>bbb222</yt:videoId><title>Zweites Video</title><link rel="alternate" href="https://www.youtube.com/watch?v=bbb222"/></entry>
      <entry><yt:videoId>ccc333</yt:videoId><title>Drittes Video</title><link rel="alternate" href="https://www.youtube.com/watch?v=ccc333"/></entry>
    </feed>`;
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => xml })) as unknown as typeof fetch;

    const videos = await getLatestVideos(2);
    expect(videos).toEqual([
      { id: 'aaa111', title: 'Erstes Video & mehr' },
      { id: 'bbb222', title: 'Zweites Video' },
    ]);
  });

  it('excludes Shorts and returns only longforms in feed order', async () => {
    const xml = `<feed><title>Daniel Kreuzhofer</title>
      <entry><yt:videoId>short1</yt:videoId><title>Short Eins</title><link rel="alternate" href="https://www.youtube.com/shorts/short1"/></entry>
      <entry><yt:videoId>long1</yt:videoId><title>Longform Eins</title><link rel="alternate" href="https://www.youtube.com/watch?v=long1"/></entry>
      <entry><yt:videoId>short2</yt:videoId><title>Short Zwei</title><link rel="alternate" href="https://www.youtube.com/shorts/short2"/></entry>
      <entry><yt:videoId>long2</yt:videoId><title>Longform Zwei</title><link rel="alternate" href="https://www.youtube.com/watch?v=long2"/></entry>
    </feed>`;
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => xml })) as unknown as typeof fetch;

    const videos = await getLatestVideos(10);
    expect(videos).toEqual([
      { id: 'long1', title: 'Longform Eins' },
      { id: 'long2', title: 'Longform Zwei' },
    ]);
  });

  it('falls back to the seeded videos when the fetch fails', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const videos = await getLatestVideos(3);
    expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
  });

  it('falls back when the feed is empty', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => '<feed></feed>' })) as unknown as typeof fetch;

    const videos = await getLatestVideos(3);
    expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
  });

  it('falls back to the seeded videos when the feed contains only Shorts', async () => {
    const xml = `<feed><title>Daniel Kreuzhofer</title>
      <entry><yt:videoId>short1</yt:videoId><title>Short Eins</title><link rel="alternate" href="https://www.youtube.com/shorts/short1"/></entry>
      <entry><yt:videoId>short2</yt:videoId><title>Short Zwei</title><link rel="alternate" href="https://www.youtube.com/shorts/short2"/></entry>
    </feed>`;
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => xml })) as unknown as typeof fetch;

    const videos = await getLatestVideos(3);
    expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
  });

  it('slices to the limit after filtering — Shorts do not count toward the limit', async () => {
    const xml = `<feed><title>Daniel Kreuzhofer</title>
      <entry><yt:videoId>short1</yt:videoId><title>Short Eins</title><link rel="alternate" href="https://www.youtube.com/shorts/short1"/></entry>
      <entry><yt:videoId>long1</yt:videoId><title>Longform Eins</title><link rel="alternate" href="https://www.youtube.com/watch?v=long1"/></entry>
      <entry><yt:videoId>short2</yt:videoId><title>Short Zwei</title><link rel="alternate" href="https://www.youtube.com/shorts/short2"/></entry>
      <entry><yt:videoId>long2</yt:videoId><title>Longform Zwei</title><link rel="alternate" href="https://www.youtube.com/watch?v=long2"/></entry>
      <entry><yt:videoId>long3</yt:videoId><title>Longform Drei</title><link rel="alternate" href="https://www.youtube.com/watch?v=long3"/></entry>
      <entry><yt:videoId>long4</yt:videoId><title>Longform Vier</title><link rel="alternate" href="https://www.youtube.com/watch?v=long4"/></entry>
    </feed>`;
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => xml })) as unknown as typeof fetch;

    const videos = await getLatestVideos(2);
    expect(videos).toEqual([
      { id: 'long1', title: 'Longform Eins' },
      { id: 'long2', title: 'Longform Zwei' },
    ]);
  });

  it('returns fewer than limit when the feed has fewer longforms — no backfill', async () => {
    const xml = `<feed><title>Daniel Kreuzhofer</title>
      <entry><yt:videoId>short1</yt:videoId><title>Short Eins</title><link rel="alternate" href="https://www.youtube.com/shorts/short1"/></entry>
      <entry><yt:videoId>long1</yt:videoId><title>Longform Eins</title><link rel="alternate" href="https://www.youtube.com/watch?v=long1"/></entry>
    </feed>`;
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => xml })) as unknown as typeof fetch;

    const videos = await getLatestVideos(3);
    expect(videos).toEqual([{ id: 'long1', title: 'Longform Eins' }]);
  });
});
