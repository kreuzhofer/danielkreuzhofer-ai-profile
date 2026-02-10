import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/types/content';

/**
 * Props for the PostPreviewCard component
 */
export interface PostPreviewCardProps {
  /** The blog post data to display */
  post: BlogPost;
}

/**
 * Format an ISO date string to a human-readable format.
 *
 * @param dateStr - ISO date string, e.g. "2025-01-15"
 * @returns Formatted date string, e.g. "January 15, 2025"
 */
export function formatBlogDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * PostPreviewCard component - displays a clickable blog post preview card
 * with header image on the left and content on the right.
 *
 * Features:
 * - Horizontal row layout: image left, content right
 * - Clickable card linking to the full blog post at `/blog/[slug]`
 * - Displays post title, formatted publication date, excerpt, and tag badges
 * - Responsive: stacks vertically on mobile, horizontal on md+
 * - Uses existing design tokens and Tailwind classes for consistent styling
 *
 * **Validates: Requirements 2.3, 2.4**
 */
export function PostPreviewCard({ post }: PostPreviewCardProps) {
  const { title, date, excerpt, tags, slug, headerImage } = post;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col md:flex-row border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Header image - left side */}
      {headerImage && (
        <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 aspect-[16/9] md:aspect-auto">
          <Image
            src={headerImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>
      )}

      {/* Content - right side */}
      <div className="flex flex-col justify-center p-6 flex-1 min-w-0">
        {/* Publication date */}
        <time
          dateTime={date}
          className="text-sm text-[var(--foreground-muted)] mb-1"
        >
          {formatBlogDate(date)}
        </time>

        {/* Post title */}
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 group-hover:text-[var(--primary-400)] transition-colors duration-200">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-900)] text-[var(--primary-300)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default PostPreviewCard;
