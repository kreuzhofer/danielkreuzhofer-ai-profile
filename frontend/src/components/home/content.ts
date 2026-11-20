// src/components/home/content.ts
// Content sections shown on the home page below the personal profile:
// latest YouTube videos and the blog teaser.

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@DanielKreuzhofer';

export interface FeaturedVideo {
  id: string;
  title: string;
}

/**
 * Featured videos = the channel's latest longforms, seeded snapshot (2026-08-06).
 * Rendered as click-to-play thumbnail cards (no YouTube player loads until click — privacy
 * friendly + reliable). Titles sourced from the YouTube watch page (oEmbed), not the RSS
 * feed `<title>`, so the fallback state matches what visitors see on click-through.
 * Update this list when new longforms land (or wire a build-time RSS fetch).
 */
export const FEATURED_VIDEOS: FeaturedVideo[] = [
  { id: 'W_ItCApYJxg', title: 'Copilot gekauft, keiner nutzt ihn: was du als Entscheider jetzt tust' },
  { id: 'OPuHZxOnkJw', title: 'Du hast KI gekauft, keiner nutzt sie. Schuld ist nicht das Team.' },
  { id: 'C9jW0jqhRtY', title: 'Bevor du KI kaufst: Wo hakt dein Vertrieb wirklich?' },
];

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const BLOG_HREF = '/blog';

export const homeContent = {
  videos: {
    eyebrow: 'Content',
    heading: 'Latest videos',
    intro: 'Practical AI, tested hands-on and explained without the hype (videos in German).',
    channelCta: 'Visit the YouTube channel',
  },
  blog: {
    eyebrow: 'Read',
    heading: 'From the blog',
    cta: 'All articles',
    href: BLOG_HREF,
  },
} as const;
