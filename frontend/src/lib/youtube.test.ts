import { getLatestVideos } from './youtube';
import { FEATURED_VIDEOS } from '@/components/home/content';

describe('getLatestVideos', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('parses the latest videos (id + decoded title) from the channel RSS feed', async () => {
    const xml = `<feed><title>Daniel Kreuzhofer</title>
      <entry><yt:videoId>aaa111</yt:videoId><title>Erstes Video &amp; mehr</title></entry>
      <entry><yt:videoId>bbb222</yt:videoId><title>Zweites Video</title></entry>
      <entry><yt:videoId>ccc333</yt:videoId><title>Drittes Video</title></entry>
    </feed>`;
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => xml })) as unknown as typeof fetch;

    const videos = await getLatestVideos(2);
    expect(videos).toEqual([
      { id: 'aaa111', title: 'Erstes Video & mehr' },
      { id: 'bbb222', title: 'Zweites Video' },
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
});
