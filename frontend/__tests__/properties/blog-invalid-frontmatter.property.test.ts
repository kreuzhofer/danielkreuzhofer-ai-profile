/**
 * Property Test for Invalid Frontmatter Exclusion
 *
 * Feature: 007-blog-section, Property 5: Invalid frontmatter files are excluded gracefully
 *
 * *For any* mix of valid and invalid MDX files in the blog content directory,
 * `getBlogPosts()` should return only the posts with complete valid frontmatter,
 * without throwing errors, and the count of returned posts should equal the count
 * of valid files.
 *
 * **Validates: Requirements 4.4**
 */

import * as fc from "fast-check";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid ISO date strings (YYYY-MM-DD format)
 */
const isoDateStringArbitrary = fc
  .integer({
    min: new Date("2020-01-01").getTime(),
    max: new Date("2030-12-31").getTime(),
  })
  .map((timestamp) => new Date(timestamp).toISOString().split("T")[0]);

/**
 * Arbitrary for generating non-empty alphanumeric strings suitable for frontmatter fields.
 * Avoids special YAML characters that could break frontmatter parsing.
 */
const safeStringArbitrary = fc
  .stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,29}$/)
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for generating valid slug strings (lowercase, hyphen-separated)
 */
const slugArbitrary = fc
  .stringMatching(/^[a-z][a-z0-9-]{2,20}$/)
  .filter((s) => !s.endsWith("-") && !s.includes("--"));

/**
 * Arbitrary for generating a valid blog post frontmatter object
 */
const validFrontmatterArbitrary = fc.record({
  title: safeStringArbitrary,
  date: isoDateStringArbitrary,
  excerpt: safeStringArbitrary,
  tags: fc.array(safeStringArbitrary, { minLength: 1, maxLength: 4 }),
  slug: slugArbitrary,
});

/**
 * Arbitrary for generating MDX body content (simple safe text)
 */
const mdxBodyArbitrary = safeStringArbitrary.map(
  (text) => `\n\nThis is blog content about ${text}.\n`
);

/**
 * Generates a complete MDX file string from frontmatter and body content.
 */
function buildMdxFile(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  return matter.stringify(body, frontmatter);
}

/**
 * The required frontmatter fields that getBlogPosts() validates.
 */
const REQUIRED_FIELDS = ["title", "date", "excerpt", "tags", "slug"] as const;

/**
 * Arbitrary for generating invalid frontmatter by removing one or more required fields
 * from a valid frontmatter object.
 */
const invalidFrontmatterMissingFieldArbitrary = validFrontmatterArbitrary.chain(
  (validFm) =>
    fc
      .subarray(REQUIRED_FIELDS.slice() as unknown as string[], {
        minLength: 1,
        maxLength: REQUIRED_FIELDS.length,
      })
      .map((fieldsToRemove) => {
        const invalidFm: Record<string, unknown> = { ...validFm };
        for (const field of fieldsToRemove) {
          delete invalidFm[field];
        }
        return invalidFm;
      })
);

/**
 * Arbitrary for generating invalid frontmatter where tags is not an array
 * (e.g., a plain string instead of string[]).
 */
const invalidFrontmatterBadTagsArbitrary = validFrontmatterArbitrary.map(
  (validFm) => ({
    ...validFm,
    tags: "not-an-array",
  })
);

/**
 * Arbitrary for generating any kind of invalid frontmatter:
 * either missing required fields or tags that isn't an array.
 */
const invalidFrontmatterArbitrary = fc.oneof(
  invalidFrontmatterMissingFieldArbitrary,
  invalidFrontmatterBadTagsArbitrary
);

// =============================================================================
// Property 5: Invalid frontmatter files are excluded gracefully
// =============================================================================

describe("Feature: 007-blog-section, Property 5: Invalid frontmatter files are excluded gracefully", () => {
  const originalExistsSync = fs.existsSync;
  const originalReaddirSync = fs.readdirSync;
  const originalReadFileSync = fs.readFileSync;

  afterEach(() => {
    fs.existsSync = originalExistsSync;
    fs.readdirSync = originalReaddirSync;
    fs.readFileSync = originalReadFileSync;
    jest.resetModules();
  });

  /**
   * For any mix of valid and invalid frontmatter MDX files, getBlogPosts()
   * returns only the valid posts, does not throw, and the count matches
   * the number of valid files.
   *
   * **Validates: Requirements 4.4**
   */
  it("returns only valid posts and excludes invalid frontmatter files without errors", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(validFrontmatterArbitrary, mdxBodyArbitrary),
          { minLength: 0, maxLength: 3 }
        ),
        fc.array(
          fc.tuple(invalidFrontmatterArbitrary, mdxBodyArbitrary),
          { minLength: 1, maxLength: 3 }
        ),
        (validEntries, invalidEntries) => {
          // Ensure unique slugs across all valid entries
          const seenSlugs = new Set<string>();
          const uniqueValidEntries = validEntries.filter(([fm]) => {
            if (seenSlugs.has(fm.slug)) return false;
            seenSlugs.add(fm.slug);
            return true;
          });

          // Build virtual filesystem with both valid and invalid files
          const virtualFiles: Record<string, string> = {};

          for (const [fm, body] of uniqueValidEntries) {
            const filename = `${fm.slug}.mdx`;
            virtualFiles[filename] = buildMdxFile(fm, body);
          }

          for (let i = 0; i < invalidEntries.length; i++) {
            const [fm, body] = invalidEntries[i];
            // Use a unique filename that won't collide with valid entries
            const filename = `invalid-post-${i}.mdx`;
            virtualFiles[filename] = buildMdxFile(fm, body);
          }

          const filenames = Object.keys(virtualFiles);
          const blogDir = path.join(process.cwd(), "content", "blog");

          // Mock fs
          fs.existsSync = ((p: fs.PathLike) => {
            if (String(p) === blogDir) return true;
            return originalExistsSync(p);
          }) as typeof fs.existsSync;

          fs.readdirSync = ((p: fs.PathLike, ...args: unknown[]) => {
            if (String(p) === blogDir)
              return filenames as unknown as fs.Dirent[];
            return originalReaddirSync(p, ...(args as [any]));
          }) as typeof fs.readdirSync;

          fs.readFileSync = ((
            p: fs.PathOrFileDescriptor,
            ...args: unknown[]
          ) => {
            const filePath = String(p);
            for (const [name, content] of Object.entries(virtualFiles)) {
              if (filePath === path.join(blogDir, name)) {
                return content;
              }
            }
            return originalReadFileSync(p, ...(args as [any]));
          }) as typeof fs.readFileSync;

          // Re-import to use mocked fs
          const { getBlogPosts } = require("@/lib/content");

          // Should not throw
          let posts: { slug: string }[];
          try {
            posts = getBlogPosts();
          } catch {
            // Property violated: getBlogPosts() should never throw
            return false;
          }

          // Count of returned posts must equal count of valid entries
          if (posts.length !== uniqueValidEntries.length) {
            return false;
          }

          // Every returned post must correspond to a valid entry
          for (const [fm] of uniqueValidEntries) {
            const matchingPost = posts.find((p) => p.slug === fm.slug);
            if (!matchingPost) return false;
          }

          // No returned post should have a slug from an invalid entry
          // (invalid entries use "invalid-post-N" filenames, not slug-based)
          // This is implicitly verified by the count check above

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
