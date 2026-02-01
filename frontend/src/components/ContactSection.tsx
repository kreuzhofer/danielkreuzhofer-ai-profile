'use client';

import type { Contact, ContactOption } from '@/types/content';
import { useScrollAnimation } from '@/hooks';

/**
 * Props for the ContactOptionIcon component
 */
interface ContactOptionIconProps {
  /** The contact option type */
  type: ContactOption['type'];
  /** Additional CSS classes */
  className?: string;
}

/**
 * ContactOptionIcon component - renders the appropriate icon for each contact type.
 */
function ContactOptionIcon({ type, className = 'w-6 h-6' }: ContactOptionIconProps) {
  switch (type) {
    case 'email':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      );
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
    case 'calendar':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
          />
        </svg>
      );
    case 'form':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      );
    case 'phone':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
          />
        </svg>
      );
    case 'website':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
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
 * Props for the ContactOptionCard component
 */
export interface ContactOptionCardProps {
  /** The contact option data to display */
  option: ContactOption;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ContactOptionCard component - displays a single contact option with icon and description.
 * 
 * Features:
 * - Icon representing the contact type
 * - Label and description with inviting language
 * - Touch targets of 44x44px minimum (Requirement 5.2)
 * - Visible focus indicators for accessibility
 * - Hover effects for visual feedback
 * 
 * **Validates: Requirement 8.2**
 * - 8.2: THE Contact section SHALL provide multiple engagement options (email, LinkedIn, calendar booking)
 * 
 * @example
 * ```tsx
 * <ContactOptionCard
 *   option={{
 *     type: 'email',
 *     label: 'Send an email',
 *     url: 'mailto:hello@example.com',
 *     description: "I'd love to hear from you"
 *   }}
 * />
 * ```
 */
export function ContactOptionCard({ option, className = '' }: ContactOptionCardProps) {
  const { type, label, url, description } = option;

  // Determine if link should open in new tab
  const isExternal = type === 'linkedin' || type === 'calendar' || type === 'website';
  const linkProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <a
      href={url}
      {...linkProps}
      className={`
        group flex items-start gap-4 p-5
        bg-[var(--surface)] rounded-xl border border-[var(--border)]
        hover:border-[var(--primary-600)] hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]
        min-h-[44px]
        ${className}
      `}
      aria-label={`${label}: ${description}`}
    >
      {/* Icon container with minimum touch target size */}
      <div
        className="
          flex-shrink-0 flex items-center justify-center
          w-12 h-12 rounded-lg
          bg-[var(--surface-elevated)] group-hover:bg-[var(--primary-900)]
          text-[var(--foreground-muted)] group-hover:text-[var(--primary-400)]
          transition-colors duration-200
        "
      >
        <ContactOptionIcon type={type} className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--primary-400)]">
          {label}
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div
        className="
          flex-shrink-0 self-center
          text-[var(--foreground-subtle)] group-hover:text-[var(--primary-400)]
          transition-transform duration-200 group-hover:translate-x-1
        "
        aria-hidden="true"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </a>
  );
}

/**
 * Props for the ContactSection component
 */
export interface ContactSectionProps {
  /** Contact content data */
  contact: Contact;
  /** Additional CSS classes for the section */
  className?: string;
}

/**
 * ContactSection component - displays the Contact section with inviting headline and engagement options.
 * 
 * Features:
 * - Inviting headline and subtext with soft, welcoming language
 * - Multiple contact options (email, LinkedIn, calendar booking)
 * - Responsive grid layout (single column on mobile, multi-column on desktop)
 * - Proper heading hierarchy (h2 for section title)
 * - Accessible with proper ARIA attributes
 * - Non-intrusive design per Requirement 8.5
 * 
 * **Validates: Requirements 8.1, 8.2, 8.4**
 * - 8.1: THE Content_Architecture SHALL include a Contact section accessible from the Navigation_System
 * - 8.2: THE Contact section SHALL provide multiple engagement options (email, LinkedIn, calendar booking)
 * - 8.4: THE Contact engagement paths SHALL use inviting language ("Let's talk if this resonates") rather than demanding language
 * 
 * @example
 * ```tsx
 * const contact = await getContact();
 * <ContactSection contact={contact} />
 * ```
 */
export function ContactSection({ contact, className = '' }: ContactSectionProps) {
  const { headline, subtext, options } = contact;
  const { ref, animationStyle } = useScrollAnimation({ triggerOnce: true });

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={`py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div ref={ref} style={animationStyle} className="max-w-4xl mx-auto">
        {/* Section heading - h2 for proper hierarchy under page h1 */}
        <h2
          id="contact-heading"
          className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4"
        >
          {headline || 'Get in Touch'}
        </h2>

        {/* Inviting subtext with soft language */}
        {subtext && (
          <p className="text-lg md:text-xl text-[var(--foreground-muted)] mb-10 max-w-2xl leading-relaxed">
            {subtext}
          </p>
        )}

        {/* Contact options grid */}
        {options && options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {options.map((option, index) => (
              <ContactOptionCard
                key={`${option.type}-${index}`}
                option={option}
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--foreground-muted)] text-center py-8">
            Contact options coming soon.
          </p>
        )}

        {/* Soft closing message */}
        <p className="text-sm text-[var(--foreground-subtle)] mt-8 text-center">
          No pressure—reach out whenever feels right.
        </p>
      </div>
    </section>
  );
}

export default ContactSection;
