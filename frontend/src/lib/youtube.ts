// src/lib/youtube.ts
// Fetches the channel's latest longform videos from the YouTube Data API v3.
// Requires YOUTUBE_API_KEY. Falls back to FEATURED_VIDEOS on any failure.
import { FEATURED_VIDEOS, type FeaturedVideo } from '@/components/home/content';
import { createLogger } from '@/lib/logger';

const log = createLogger('YouTube');

const CHANNEL_ID = 'UCAtR5ksFgUGuehXA4BMJwCw';
const SEARCH_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${CHANNEL_ID}&order=date&maxResults=50`;
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails';
const MIN_LONGFORM_SECONDS = 240;

/**
 * Latest longform videos (>= 4 min) from the channel, revalidated every 6h (ISR).
 * Uses the YouTube Data API v3: search.list for recent uploads, then videos.list
 * for durations (search.list's videoDuration=long filter is unreliable).
 * Falls back to the seeded {@link FEATURED_VIDEOS} on any failure —
 * the homepage must never render an empty videos section.
 */
export async function getLatestVideos(limit = 3): Promise<FeaturedVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    log.warn('No YOUTUBE_API_KEY set — falling back to seeded videos');
    return FEATURED_VIDEOS.slice(0, limit);
  }

  try {
    const searchRes = await fetch(`${SEARCH_URL}&key=${apiKey}`, {
      next: { revalidate: 21600 },
    });
    if (!searchRes.ok) {
      log.warn(`YouTube search.list failed: ${searchRes.status} — falling back to seeded videos`);
      return FEATURED_VIDEOS.slice(0, limit);
    }
    const searchData = await searchRes.json();
    const items: Array<{ id: { videoId: string }; snippet: { title: string } }> =
      searchData.items ?? [];
    if (items.length === 0) {
      log.warn('YouTube search.list returned no items — falling back to seeded videos');
      return FEATURED_VIDEOS.slice(0, limit);
    }

    const ids = items.map((i) => i.id.videoId);
    const videosRes = await fetch(`${VIDEOS_URL}&id=${ids.join(',')}&key=${apiKey}`);
    if (!videosRes.ok) {
      log.warn(`YouTube videos.list failed: ${videosRes.status} — falling back to seeded videos`);
      return FEATURED_VIDEOS.slice(0, limit);
    }
    const videosData = await videosRes.json();
    const durations: Record<string, number> = {};
    for (const v of videosData.items ?? []) {
      durations[v.id] = parseIsoDuration(v.contentDetails.duration);
    }

    const longforms = items
      .filter((i) => (durations[i.id.videoId] ?? 0) >= MIN_LONGFORM_SECONDS)
      .map((i) => ({ id: i.id.videoId, title: i.snippet.title }))
      .slice(0, limit);

    if (longforms.length === 0) {
      log.warn('No longform videos (>= 4 min) found — falling back to seeded videos');
      return FEATURED_VIDEOS.slice(0, limit);
    }

    return longforms;
  } catch (err) {
    log.warn(`YouTube API fetch failed: ${err instanceof Error ? err.message : 'unknown'} — falling back to seeded videos`);
    return FEATURED_VIDEOS.slice(0, limit);
  }
}

/** Parse ISO 8601 duration (e.g. "PT6M38S") to seconds. */
function parseIsoDuration(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return (
    (parseInt(m[1] ?? '0', 10)) * 3600 +
    (parseInt(m[2] ?? '0', 10)) * 60 +
    (parseInt(m[3] ?? '0', 10))
  );
}
