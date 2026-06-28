// src/components/home/content.ts
// Top-of-funnel content homepage. The site's job here: promote Daniel's content
// (YouTube/POV) and route visitors to the micro-magnet (Engpass-Check). NO sales
// call CTA — the Erstgespräch lives on /coaching for warm leads only.

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@DanielKreuzhofer';
/** Uploads playlist (UU + channelId tail) — embeds the channel's latest videos without an API key. */
export const YOUTUBE_UPLOADS_PLAYLIST = 'UUAtR5ksFgUGuehXA4BMJwCw';
/** Privacy-enhanced embed (youtube-nocookie) of the latest-uploads playlist. */
export const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST}`;

export const ENGPASS_HREF = '/engpass-check';
export const COACHING_HREF = '/coaching';
export const ABOUT_HREF = '/about';
export const BLOG_HREF = '/blog';

export const homeContent = {
  hero: {
    eyebrow: 'KI-Coaching mit Kante',
    headline: 'Klartext zu KI — für Führungskräfte, die Ergebnisse liefern müssen',
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
