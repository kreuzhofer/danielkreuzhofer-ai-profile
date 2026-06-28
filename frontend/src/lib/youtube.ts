// src/lib/youtube.ts
// Fetches the channel's latest videos from the public RSS feed (no API key).
import { FEATURED_VIDEOS, type FeaturedVideo } from '@/components/home/content';

const CHANNEL_ID = 'UCAtR5ksFgUGuehXA4BMJwCw';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/**
 * Latest videos from the channel RSS feed, revalidated every 6h (ISR).
 * Falls back to the seeded {@link FEATURED_VIDEOS} on any network/parse failure —
 * the homepage must never render an empty videos section.
 */
export async function getLatestVideos(limit = 3): Promise<FeaturedVideo[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 21600 } });
    if (!res.ok) return FEATURED_VIDEOS.slice(0, limit);
    const parsed = parseFeed(await res.text()).slice(0, limit);
    return parsed.length > 0 ? parsed : FEATURED_VIDEOS.slice(0, limit);
  } catch {
    return FEATURED_VIDEOS.slice(0, limit);
  }
}

/** Pull videoId + title from each `<entry>` of the YouTube RSS feed. */
function parseFeed(xml: string): FeaturedVideo[] {
  const out: FeaturedVideo[] = [];
  // Each video is an <entry>; slice(1) drops the feed-level header (channel <title> etc.).
  for (const entry of xml.split('<entry>').slice(1)) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    if (id && title) out.push({ id, title: decodeXmlEntities(title.trim()) });
  }
  return out;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
