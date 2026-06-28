// src/components/home/VideosSection.tsx
import React from 'react';
import {
  homeContent,
  FEATURED_VIDEOS,
  youtubeThumb,
  youtubeWatch,
  YOUTUBE_CHANNEL_URL,
} from './content';

function PlayIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-500)]/90
                 text-[var(--accent-ink)] shadow-lg transition-transform group-hover:scale-110"
    >
      <svg className="h-5 w-5 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

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
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURED_VIDEOS.map((video) => (
            <a
              key={video.id}
              href={youtubeWatch(video.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumb(video.id)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <PlayIcon />
                </span>
              </div>
              <h3 className="mt-3 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--secondary-400)]">
                {video.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VideosSection;
