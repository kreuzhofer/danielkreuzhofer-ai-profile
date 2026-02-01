'use client';

import type { About, SocialLink } from '@/types/content';
import { useScrollAnimation } from '@/hooks';

/**
 * Props for the SocialLinkIcon component
 */
interface SocialLinkIconProps {
  /** The social platform type */
  platform: SocialLink['platform'];
  /** Additional CSS classes */
  className?: string;
}

/**
 * SocialLinkIcon component - renders the appropriate icon for each social platform.
 */
function SocialLinkIcon({ platform, className = 'w-5 h-5' }: SocialLinkIconProps) {
  switch (platform) {
    case 'linkedin':
      return (
        <svg
          className={className}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'github':
      return (
        <svg
          className={className}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'twitter':
      return (
        <svg
          className={className}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'email':
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg
          className={className}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'website':
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
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Props for the SocialLinks component
 */
interface SocialLinksProps {
  /** Array of social links to display */
  links: SocialLink[];
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * SocialLinks component - renders a list of social media links with icons.
 * 
 * Features:
 * - Accessible links with proper labels
 * - Touch targets of 44x44px minimum (Requirement 5.2)
 * - Visible focus indicators
 * 
 * @example
 * ```tsx
 * <SocialLinks links={about.socialLinks} />
 * ```
 */
export function SocialLinks({ links, className = '' }: SocialLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link) => (
        <a
          key={`${link.platform}-${link.url}`}
          href={link.url}
          target={link.platform !== 'email' ? '_blank' : undefined}
          rel={link.platform !== 'email' ? 'noopener noreferrer' : undefined}
          aria-label={link.label}
          className="
            inline-flex items-center justify-center
            min-w-[44px] min-h-[44px] p-2
            text-[var(--foreground-muted)] hover:text-[var(--foreground)]
            bg-[var(--surface-elevated)] hover:bg-[var(--primary-900)]
            rounded-full
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]
          "
        >
          <SocialLinkIcon platform={link.platform} />
          <span className="sr-only">{link.label}</span>
        </a>
      ))}
    </div>
  );
}

/**
 * Props for the AboutSection component
 */
export interface AboutSectionProps {
  /** About content data */
  about: About;
  /** Additional CSS classes for the section */
  className?: string;
}

/**
 * AboutSection component - displays the About section with headline, bio, and value proposition.
 * 
 * Features:
 * - Renders professional headline prominently
 * - Displays brief bio (under 100 words) with proper formatting
 * - Shows primary value proposition
 * - Displays social links with accessible icons
 * - Responsive layout (single column on mobile, optimized for desktop)
 * - Proper heading hierarchy (h2 for section title)
 * 
 * **Validates: Requirement 2.5**
 * - 2.5: THE Summary_Layer for About SHALL display a professional headline, brief bio (under 100 words), and primary value proposition
 * 
 * @example
 * ```tsx
 * const about = await getAbout();
 * <AboutSection about={about} />
 * ```
 */
export function AboutSection({ about, className = '' }: AboutSectionProps) {
  const { headline, bio, valueProposition, profileImage, socialLinks } = about;
  const { ref, animationStyle } = useScrollAnimation({ triggerOnce: true });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div ref={ref} style={animationStyle} className="max-w-4xl mx-auto">
        {/* Section heading - h2 for proper hierarchy under page h1 */}
        <h2
          id="about-heading"
          className="text-3xl md:text-4xl font-bold text-foreground mb-8"
        >
          About
        </h2>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Profile image (optional) */}
          {profileImage && (
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-[var(--surface-elevated)]">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 space-y-6">
            {/* Professional headline - prominent display */}
            {headline && (
              <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                {headline}
              </h3>
            )}

            {/* Brief bio (under 100 words) */}
            {bio && (
              <p className="text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed">
                {bio}
              </p>
            )}

            {/* Primary value proposition */}
            {valueProposition && (
              <p className="text-base md:text-lg text-[var(--foreground-subtle)] italic border-l-4 border-[var(--primary-600)] pl-4">
                {valueProposition}
              </p>
            )}

            {/* Social links */}
            <SocialLinks links={socialLinks} className="pt-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
