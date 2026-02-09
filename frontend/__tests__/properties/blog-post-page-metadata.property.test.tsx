/**
 * Property Test for Blog Post Page Metadata
 *
 * Feature: 007-blog-section, Property 3: Blog post page displays metadata
 *
 * *For any* BlogPost object, the rendered blog post page should display the post's
 * title, formatted date, and all tags above the content.
 *
 * **Validates: Requirements 3.2**
 */

import React from 'react';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import type { BlogPost } from '@/types/content';
import { formatBlogDate } from '@/components/blog/PostPreviewCard';

// =============================================================================
// Mocks
// =============================================================================

// Mock next/navigation to handle notFound()
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock react-markdown to avoid rendering MDX content (not relevant for metadata test)
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="mock-markdown">{children}</div>;
  };
});

// Mock the content loader — getBlogPost will be controlled per test iteration
jest.mock('@/lib/content', () => ({
  getBlogPost: jest.fn(),
  getBlogPosts: jest.fn().mockReturnValue([]),
}));

import { getBlogPost } from '@/lib/content';
const mockGetBlogPost = getBlogPost as jest.MockedFunction<typeof getBlogPost>;

// Import the component under test after mocks are set up
import BlogPostPage from '@/app/blog/[slug]/page';

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
// Property 3: Blog post page displays metadata
// =============================================================================

describe('Feature: 007-blog-section, Property 3: Blog post page displays metadata', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * For any BlogPost, the rendered blog post page should display the title,
   * formatted date, and all tags above the content.
   *
   * **Validates: Requirements 3.2**
   */
  it('displays title, formatted date, and tags for any BlogPost', async () => {
    await fc.assert(
      fc.asyncProperty(blogPostArbitrary, async (post: BlogPost) => {
        // Configure mock to return the generated post for its slug
        mockGetBlogPost.mockReturnValue(post);

        // Render the async server component
        // The component expects params: Promise<{ slug: string }>
        const params = Promise.resolve({ slug: post.slug });
        const Component = await BlogPostPage({ params });
        const { container, unmount } = render(Component as React.ReactElement);

        // Requirement 3.2: Title is displayed
        expect(container).toHaveTextContent(post.title);

        // Requirement 3.2: Formatted date is displayed
        const formattedDate = formatBlogDate(post.date);
        expect(container).toHaveTextContent(formattedDate);

        // Requirement 3.2: All tags are displayed
        for (const tag of post.tags) {
          expect(container).toHaveTextContent(tag);
        }

        // Clean up for next iteration
        unmount();
        jest.clearAllMocks();

        return true;
      }),
      { numRuns: 3 }
    );
  });
});
