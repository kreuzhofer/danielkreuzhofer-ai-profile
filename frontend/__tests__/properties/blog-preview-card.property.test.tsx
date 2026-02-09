/**
 * Property Test for PostPreviewCard
 *
 * Feature: 007-blog-section, Property 2: Preview card displays all required fields and correct link
 *
 * *For any* BlogPost object, the rendered PostPreviewCard should contain the post's title,
 * formatted date, excerpt, all tags, and link to `/blog/{slug}`.
 *
 * **Validates: Requirements 2.3, 2.4**
 */

import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { PostPreviewCard, formatBlogDate } from '@/components/blog/PostPreviewCard';
import type { BlogPost } from '@/types/content';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid ISO date strings (YYYY-MM-DD format)
 */
const isoDateStringArbitrary = fc
  .integer({
    min: new Date('2020-01-01').getTime(),
    max: new Date('2030-12-31').getTime(),
  })
  .map((timestamp) => new Date(timestamp).toISOString().split('T')[0]);

/**
 * Arbitrary for generating non-empty trimmed strings (for required text fields)
 */
const nonEmptyStringArbitrary = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating valid slug strings (lowercase alphanumeric with hyphens)
 */
const slugArbitrary = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,29}[a-z0-9]$/)
  .filter((s) => s.length >= 2);

/**
 * Arbitrary for generating a valid BlogPost object
 */
const blogPostArbitrary: fc.Arbitrary<BlogPost> = fc.record({
  title: nonEmptyStringArbitrary,
  date: isoDateStringArbitrary,
  excerpt: nonEmptyStringArbitrary,
  tags: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 5 }),
  slug: slugArbitrary,
  content: nonEmptyStringArbitrary,
});

// =============================================================================
// Property 2: Preview card displays all required fields and correct link
// =============================================================================

describe('Feature: 007-blog-section, Property 2: Preview card displays all required fields and correct link', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * For any BlogPost, the rendered PostPreviewCard should display the title,
   * formatted date, excerpt, all tags, and a link to `/blog/{slug}`.
   *
   * **Validates: Requirements 2.3, 2.4**
   */
  it('displays title, date, excerpt, tags, and correct link for any BlogPost', () => {
    fc.assert(
      fc.property(blogPostArbitrary, (post: BlogPost) => {
        const { container, unmount } = render(<PostPreviewCard post={post} />);

        // Requirement 2.3: Title is displayed
        expect(container).toHaveTextContent(post.title);

        // Requirement 2.3: Formatted date is displayed
        const formattedDate = formatBlogDate(post.date);
        expect(container).toHaveTextContent(formattedDate);

        // Requirement 2.3: Excerpt is displayed
        expect(container).toHaveTextContent(post.excerpt);

        // Requirement 2.3: All tags are displayed
        for (const tag of post.tags) {
          expect(container).toHaveTextContent(tag);
        }

        // Requirement 2.4: Link to /blog/{slug} is present
        const link = container.querySelector('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', `/blog/${post.slug}`);

        // Clean up for next iteration
        unmount();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
