import { getLatestVideos } from './youtube';
import { FEATURED_VIDEOS } from '@/components/home/content';

describe('getLatestVideos', () => {
  const realFetch = global.fetch;
  const realEnv = process.env.YOUTUBE_API_KEY;
  afterEach(() => {
    global.fetch = realFetch;
    process.env.YOUTUBE_API_KEY = realEnv;
  });

  function searchResponse(items: Array<{ id: { videoId: string }; snippet: { title: string } }>) {
    return { ok: true, json: async () => ({ items }) } as unknown as Response;
  }

  function videosResponse(items: Array<{ id: string; contentDetails: { duration: string } }>) {
    return { ok: true, json: async () => ({ items }) } as unknown as Response;
  }

  function isoDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `PT${h > 0 ? h + 'H' : ''}${m > 0 ? m + 'M' : ''}${s > 0 ? s + 'S' : ''}`;
  }

  function mockApiCalls(
    searchItems: Array<{ id: { videoId: string }; snippet: { title: string } }>,
    durationMap: Record<string, number>,
  ) {
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/search')) {
        return searchResponse(searchItems);
      }
      if (u.includes('/videos')) {
        const items = Object.entries(durationMap).map(([id, dur]) => ({
          id,
          contentDetails: { duration: isoDuration(dur) },
        }));
        return videosResponse(items);
      }
      throw new Error(`Unexpected fetch: ${u}`);
    }) as unknown as typeof fetch;
  }

  describe('with YOUTUBE_API_KEY', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-api-key';
    });

    it('returns only longform videos (>= 4 min) from the API, in search order', async () => {
      mockApiCalls(
        [
          { id: { videoId: 'short1' }, snippet: { title: 'Short Eins' } },
          { id: { videoId: 'long1' }, snippet: { title: 'Longform Eins' } },
          { id: { videoId: 'short2' }, snippet: { title: 'Short Zwei' } },
          { id: { videoId: 'long2' }, snippet: { title: 'Longform Zwei' } },
        ],
        { short1: 30, long1: 600, short2: 45, long2: 400 },
      );

      const videos = await getLatestVideos(10);
      expect(videos).toEqual([
        { id: 'long1', title: 'Longform Eins' },
        { id: 'long2', title: 'Longform Zwei' },
      ]);
    });

    it('slices to the limit after duration filtering — Shorts do not count', async () => {
      mockApiCalls(
        [
          { id: { videoId: 'short1' }, snippet: { title: 'Short Eins' } },
          { id: { videoId: 'long1' }, snippet: { title: 'Longform Eins' } },
          { id: { videoId: 'short2' }, snippet: { title: 'Short Zwei' } },
          { id: { videoId: 'long2' }, snippet: { title: 'Longform Zwei' } },
          { id: { videoId: 'long3' }, snippet: { title: 'Longform Drei' } },
        ],
        { short1: 30, long1: 600, short2: 45, long2: 400, long3: 500 },
      );

      const videos = await getLatestVideos(2);
      expect(videos).toEqual([
        { id: 'long1', title: 'Longform Eins' },
        { id: 'long2', title: 'Longform Zwei' },
      ]);
    });

    it('returns fewer than limit when the API returns fewer longforms — no backfill', async () => {
      mockApiCalls(
        [
          { id: { videoId: 'short1' }, snippet: { title: 'Short Eins' } },
          { id: { videoId: 'long1' }, snippet: { title: 'Longform Eins' } },
        ],
        { short1: 30, long1: 600 },
      );

      const videos = await getLatestVideos(3);
      expect(videos).toEqual([{ id: 'long1', title: 'Longform Eins' }]);
    });

    it('falls back to FEATURED_VIDEOS when the API call fails', async () => {
      global.fetch = jest.fn(async () => {
        throw new Error('network down');
      }) as unknown as typeof fetch;

      const videos = await getLatestVideos(3);
      expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
    });

    it('falls back to FEATURED_VIDEOS when the API returns a non-ok response', async () => {
      global.fetch = jest.fn(async () => ({ ok: false, status: 403 })) as unknown as typeof fetch;

      const videos = await getLatestVideos(3);
      expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
    });

    it('falls back to FEATURED_VIDEOS when no videos are long enough', async () => {
      mockApiCalls(
        [
          { id: { videoId: 'short1' }, snippet: { title: 'Short Eins' } },
          { id: { videoId: 'short2' }, snippet: { title: 'Short Zwei' } },
        ],
        { short1: 30, short2: 45 },
      );

      const videos = await getLatestVideos(3);
      expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
    });

    it('falls back to FEATURED_VIDEOS when search succeeds but videos.list fails', async () => {
      global.fetch = jest.fn(async (url: string | URL | Request) => {
        const u = typeof url === 'string' ? url : url.toString();
        if (u.includes('/search')) {
          return searchResponse([
            { id: { videoId: 'long1' }, snippet: { title: 'Longform Eins' } },
          ]);
        }
        if (u.includes('/videos')) {
          return { ok: false, status: 403 } as unknown as Response;
        }
        throw new Error(`Unexpected fetch: ${u}`);
      }) as unknown as typeof fetch;

      const videos = await getLatestVideos(3);
      expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
    });
  });

  describe('without YOUTUBE_API_KEY', () => {
    beforeEach(() => {
      delete process.env.YOUTUBE_API_KEY;
    });

    it('falls back to FEATURED_VIDEOS when no API key is set', async () => {
      global.fetch = jest.fn(async () => {
        throw new Error('should not fetch without API key');
      }) as unknown as typeof fetch;

      const videos = await getLatestVideos(3);
      expect(videos).toEqual(FEATURED_VIDEOS.slice(0, 3));
    });
  });
});
