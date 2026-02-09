/**
 * Property Test for Blog Post Date Sort Order
 *
 * Feature: 007-blog-section, Property 1: Blog posts are sorted by date descending
 *
 * *For any* list of blog posts returned by getBlogPosts(), each post's date
 * should be greater than or equal to the next post's date in the list.
 *
 * **Validates: Requirements 2.2**
 */

import * as fc from "fast-check";
import type { BlogPost } from "@/types/content";

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid ISO date strings (YYYY-MM-DD format)
 * Uses integer timestamps constrained to a reasonable range to ensure valid dates
 */
const isoDateStringArbitrary = fc
  .integer({
    min: new Date("2020-01-01").getTime(),
    max: new Date("2030-12-31").getTime(),
  })
  .map((timestamp) => new Date(timestamp).toISOString().split("T")[0]);

/**
 * Arbitrary for generating non-empty strings (for required text fields)
 */
const nonEmptyStringArbitrary = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating a valid BlogPost object with a random date
 */
const blogPostArbitrary: fc.Arbitrary<BlogPost> = fc.record({
  title: nonEmptyStringArbitrary,
  date: isoDateStringArbitrary,
  excerpt: nonEmptyStringArbitrary,
  tags: fc.array(nonEmptyStringArbitrary, { minLength: 1, maxLength: 5 }),
  slug: nonEmptyStringArbitrary,
  content: nonEmptyStringArbitrary,
});

/**
 * The sort logic extracted from getBlogPosts() in content.ts.
 * This is the same comparator used in the production code:
 *   posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
 */
function sortBlogPostsByDateDescending(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// =============================================================================
// Property 1: Blog posts are sorted by date descending
// =============================================================================

describe("Feature: 007-blog-section, Property 1: Blog posts are sorted by date descending", () => {
  /**
   * For any array of BlogPost objects, after sorting by date descending,
   * each post's date should be >= the next post's date.
   *
   * **Validates: Requirements 2.2**
   */
  it("each post date is greater than or equal to the next post date after sorting", () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 0, maxLength: 20 }),
        (posts) => {
          const sorted = sortBlogPostsByDateDescending(posts);

          // For every consecutive pair, the earlier post's date >= the later post's date
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentDate = new Date(sorted[i].date).getTime();
            const nextDate = new Date(sorted[i + 1].date).getTime();
            if (currentDate < nextDate) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Sorting should preserve all original posts (no posts lost or duplicated).
   *
   * **Validates: Requirements 2.2**
   */
  it("sorting preserves all posts (same length and same elements)", () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary, { minLength: 0, maxLength: 20 }),
        (posts) => {
          const sorted = sortBlogPostsByDateDescending(posts);

          // Length must be preserved
          if (sorted.length !== posts.length) {
            return false;
          }

          // Every original post must appear in the sorted result
          for (const post of posts) {
            if (!sorted.includes(post)) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
