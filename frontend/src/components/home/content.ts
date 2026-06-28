// src/components/home/content.ts
// Top-of-funnel content homepage. The site's job here: promote Daniel's content
// (YouTube/POV) and route visitors to the micro-magnet (Engpass-Check). NO sales
// call CTA — the Erstgespräch lives on /coaching for warm leads only.

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@DanielKreuzhofer';

export interface FeaturedVideo {
  id: string;
  title: string;
}

/**
 * Featured videos = the channel's latest, seeded from the YouTube RSS feed (2026-06-28).
 * Rendered as click-to-play thumbnail cards (no YouTube player loads until click — privacy
 * friendly + reliable). Update this list when new videos land (or wire a build-time RSS fetch).
 */
export const FEATURED_VIDEOS: FeaturedVideo[] = [
  { id: 'OPuHZxOnkJw', title: 'Warum nutzt Dein Team keine KI? Der Grund bist Du.' },
  { id: 'C9jW0jqhRtY', title: 'Bevor du KI kaufst: Wo hakt dein Vertrieb wirklich?' },
  { id: 'hjEzcQncAIg', title: 'Freitag 17 Uhr, Last-Minute vom Chef — 30 Min mit KI statt Wochenende' },
];

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const ENGPASS_HREF = '/engpass-check';
export const COACHING_HREF = '/coaching';
export const ABOUT_HREF = '/about';
export const BLOG_HREF = '/blog';

export const homeContent = {
  hero: {
    eyebrow: 'KI-Coaching mit Kante',
    headline: 'Klartext zu KI — für Führungskräfte, die liefern müssen',
    tagline:
      'Ich teste KI in der Praxis und zeige, was wirklich funktioniert — ohne Hype, mit Kante. Fangen Sie mit einem Video oder dem 3-Minuten-Check an.',
    primaryCta: 'Engpass-Check (3 Min)',
    primaryHref: ENGPASS_HREF,
    secondaryCta: 'Videos ansehen',
    secondaryHref: '#videos',
  },
  videos: {
    eyebrow: 'Content',
    heading: 'Neueste Videos',
    intro: 'Konkrete KI-Hebel für den Mittelstand — selbst getestet, in Klartext erklärt.',
    channelCta: 'Zum YouTube-Kanal',
  },
  microMagnet: {
    eyebrow: 'Ihr erster Schritt',
    heading: 'Wo verliert Ihr Vertrieb täglich die meiste Zeit?',
    body:
      'Schauen Sie ein Video — und machen Sie dann den 3-Minuten-Engpass-Check: In wenigen Fragen sehen Sie Ihren größten KI-Hebel und den passenden ersten Schritt.',
    cta: 'Engpass-Check starten',
    href: ENGPASS_HREF,
  },
  about: {
    eyebrow: 'Wer ich bin',
    heading: 'Daniel Kreuzhofer',
    body:
      'Senior AI Solutions Architect bei AWS, 25+ Jahre in Softwareentwicklung & Enterprise-Architektur. Ich baue KI in der Praxis — und rede Klartext darüber.',
    cta: 'Mehr über mich',
    href: ABOUT_HREF,
  },
  blog: {
    eyebrow: 'Lesen',
    heading: 'Aus dem Blog',
    cta: 'Alle Artikel',
    href: BLOG_HREF,
  },
  coachingPointer: {
    heading: 'Sie wollen KI in Ihrem Bereich konkret umsetzen?',
    body:
      'Das 90-Tage-Pilot-System bringt Bereichsleitern im Mittelstand einen belastbaren ersten KI-Pilot — begleitet und messbar.',
    cta: 'Coaching ansehen',
    href: COACHING_HREF,
  },
} as const;
