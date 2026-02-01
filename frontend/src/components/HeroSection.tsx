'use client';

import React from 'react';
import { useReducedMotion } from '@/hooks';
import { useChat } from '@/context/ChatContext';
import { Button } from './ui/Button';

/**
 * Chat bubble icon component - matches the floating chat button icon
 */
function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

/**
 * Professional affiliation/expertise tags for the hero section
 */
const HERO_TAGS = [
  'AWS',
  'Microsoft',
  'Founder',
];

/**
 * HeroSection component props
 */
export interface HeroSectionProps {
  /** Main headline text */
  headline: string;
  /** Supporting tagline or description */
  tagline: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button href */
  ctaHref?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Hero Section component for the portfolio landing page.
 *
 * Features:
 * - Strong headline capturing professional value proposition
 * - Supporting tagline with staggered animation
 * - Primary CTA button to encourage exploration
 * - Subtle animated gradient background
 * - Fully visible above the fold on desktop (1024px+)
 * - Responsive single-column layout on mobile (375px)
 * - Respects prefers-reduced-motion preference
 * - Smooth scroll navigation to About section
 *
 * @example
 * ```tsx
 * <HeroSection
 *   headline="Building Solutions That Matter"
 *   tagline="Senior Solutions Architect with 15+ years of experience"
 *   ctaText="Explore My Work"
 *   ctaHref="#about"
 * />
 * ```
 */
export function HeroSection({
  headline,
  tagline,
  ctaText = 'Explore My Work',
  ctaHref = '#about',
  className = '',
}: HeroSectionProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const { openChat } = useChat();

  // Animation classes for headline
  const headlineAnimationClasses = prefersReducedMotion
    ? 'opacity-100'
    : 'animate-fade-in-up';

  // Animation classes for tagline (staggered)
  const taglineAnimationClasses = prefersReducedMotion
    ? 'opacity-100'
    : 'animate-fade-in-up animation-delay-200';

  // Animation classes for CTA (more staggered)
  const ctaAnimationClasses = prefersReducedMotion
    ? 'opacity-100'
    : 'animate-fade-in-up animation-delay-400';

  return (
    <section
      id="hero"
      className={`
        relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center
        bg-[var(--gradient-hero)]
        px-4 pb-20
        -mx-4 sm:-mx-6 lg:-mx-8 -mt-8
        ${className}
      `}
      aria-label="Hero section"
    >
      {/* Animated gradient overlay (subtle) */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none animate-gradient-shift"
          aria-hidden="true"
        />
      )}

      {/* Content container - centered with flex-grow to push scroll indicator down */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Headline */}
        <h1
          className={`
            text-4xl md:text-5xl lg:text-6xl
            font-bold tracking-tight
            text-[var(--foreground)]
            mb-4
            ${headlineAnimationClasses}
          `}
        >
          {headline}
        </h1>

        {/* Professional tags */}
        <div
          className={`
            flex flex-wrap items-center justify-center gap-2
            mb-6
            ${taglineAnimationClasses}
          `}
        >
          {HERO_TAGS.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-900)] text-[var(--primary-300)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className={`
            text-lg md:text-xl lg:text-2xl
            text-[var(--foreground-muted)]
            max-w-2xl mx-auto
            mb-10
            ${taglineAnimationClasses}
          `}
        >
          {tagline}
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${ctaAnimationClasses}`}>
          <Button
            variant="primary"
            size="lg"
            href={ctaHref}
          >
            {ctaText}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={openChat}
          >
            <ChatIcon className="w-5 h-5 mr-2" />
            Ask AI about me
          </Button>
        </div>
      </div>

      {/* Scroll indicator - positioned at bottom of section */}
      <div
        className={`relative z-10 pb-4 ${
          prefersReducedMotion ? '' : 'animate-bounce'
        }`}
        aria-hidden="true"
      >
        <svg
          className="w-6 h-6 text-[var(--neutral-400)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
