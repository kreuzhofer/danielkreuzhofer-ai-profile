// src/components/home/VideosSection.tsx
import React from 'react';
import { homeContent, YOUTUBE_EMBED_URL, YOUTUBE_CHANNEL_URL } from './content';

export function VideosSection() {
  const { videos } = homeContent;
  return (
    <section id="videos" aria-label={videos.heading} className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {videos.eyebrow}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)]">{videos.heading}</h2>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-[var(--secondary-400)] hover:text-[var(--secondary-300)]"
          >
            {videos.channelCta}
            <span aria-hidden="true" className="ml-1">→</span>
          </a>
        </div>
        <p className="text-[var(--foreground-muted)] mb-6 max-w-2xl">{videos.intro}</p>
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <iframe
            className="h-full w-full"
            src={YOUTUBE_EMBED_URL}
            title="Neueste Videos von Daniel Kreuzhofer"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export default VideosSection;
