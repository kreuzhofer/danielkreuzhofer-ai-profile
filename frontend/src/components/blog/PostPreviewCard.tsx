import Link from 'next/link';
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
 * PostPreviewCard component - displays a clickable blog post preview card.
 *
 * Features:
 * - Clickable card linking to the full blog post at `/blog/[slug]`
 * - Displays post title, formatted publication date, excerpt, and tag badges
 * - Uses existing design tokens and Tailwind classes for consistent styling
 * - Hover effect with shadow and slight lift
 *
 * **Validates: Requirements 2.3, 2.4**
 * - 2.3: THE Post_Preview_Card SHALL display the post title, publication date, excerpt, and tags
 * - 2.4: WHEN a visitor clicks a Post_Preview_Card, THE Blog_Section SHALL navigate to the corresponding Blog_Post page
 *
 * @example
 * ```tsx
 * <PostPreviewCard post={blogPost} />
 * ```
 */
export function PostPreviewCard({ post }: PostPreviewCardProps) {
  const { title, date, excerpt, tags, slug } = post;

  return (
    <Link
      href={`/blog/${slug}`}
      className="block border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="p-6">
        {/* Post title */}
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>

        {/* Publication date */}
        <time
          dateTime={date}
          className="text-sm text-[var(--foreground-muted)]"
        >
          {formatBlogDate(date)}
        </time>

        {/* Excerpt */}
        <p className="mt-3 text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
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
