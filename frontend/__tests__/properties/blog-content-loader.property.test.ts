/**
 * Property Test for Content Loader Parsing
 *
 * Feature: 007-blog-section, Property 4: Content loader parses all valid MDX files
 *
 * *For any* set of MDX files with valid frontmatter (title, date, excerpt, tags, slug)
 * placed in the blog content directory, `getBlogPosts()` should return a BlogPost for
 * each file with all frontmatter fields correctly mapped to the corresponding BlogPost
 * properties.
 *
 * **Validates: Requirements 4.3, 4.5**
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
 * Uses gray-matter's stringify to produce valid YAML frontmatter.
 */
function buildMdxFile(
  frontmatter: {
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    slug: string;
  },
  body: string
): string {
  return matter.stringify(body, frontmatter);
}

// =============================================================================
// Property 4: Content loader parses all valid MDX files
// =============================================================================

describe("Feature: 007-blog-section, Property 4: Content loader parses all valid MDX files", () => {
  // Store original fs functions to restore after each test
  const originalExistsSync = fs.existsSync;
  const originalReaddirSync = fs.readdirSync;
  const originalReadFileSync = fs.readFileSync;

  afterEach(() => {
    // Restore original fs functions
    fs.existsSync = originalExistsSync;
    fs.readdirSync = originalReaddirSync;
    fs.readFileSync = originalReadFileSync;
    jest.resetModules();
  });

  /**
   * For any set of valid frontmatter objects, getBlogPosts() returns a BlogPost
   * for each file with all frontmatter fields correctly mapped.
   *
   * **Validates: Requirements 4.3, 4.5**
   */
  it("returns a BlogPost for each valid MDX file with all fields correctly mapped", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(validFrontmatterArbitrary, mdxBodyArbitrary),
          { minLength: 1, maxLength: 5 }
        ),
        (entries) => {
          // Ensure unique slugs to avoid collisions
          const seenSlugs = new Set<string>();
          const uniqueEntries = entries.filter(([fm]) => {
            if (seenSlugs.has(fm.slug)) return false;
            seenSlugs.add(fm.slug);
            return true;
          });

          // Build a virtual filesystem: filename -> MDX content
          const virtualFiles: Record<string, string> = {};
          for (const [fm, body] of uniqueEntries) {
            const filename = `${fm.slug}.mdx`;
            virtualFiles[filename] = buildMdxFile(fm, body);
          }

          const filenames = Object.keys(virtualFiles);

          // Compute the expected blog directory path
          const blogDir = path.join(process.cwd(), "content", "blog");

          // Mock fs.existsSync to return true for the blog directory
          fs.existsSync = ((p: fs.PathLike) => {
            if (String(p) === blogDir) return true;
            return originalExistsSync(p);
          }) as typeof fs.existsSync;

          // Mock fs.readdirSync to return our virtual filenames
          fs.readdirSync = ((p: fs.PathLike, ...args: unknown[]) => {
            if (String(p) === blogDir) return filenames as unknown as fs.Dirent[];
            return originalReaddirSync(p, ...(args as [any]));
          }) as typeof fs.readdirSync;

          // Mock fs.readFileSync to return virtual file content
          fs.readFileSync = ((p: fs.PathOrFileDescriptor, ...args: unknown[]) => {
            const filePath = String(p);
            for (const [name, content] of Object.entries(virtualFiles)) {
              if (filePath === path.join(blogDir, name)) {
                return content;
              }
            }
            return originalReadFileSync(p, ...(args as [any]));
          }) as typeof fs.readFileSync;

          // Re-import to get fresh module with our mocked fs
          // Since getBlogPosts uses the same fs module, our monkey-patches apply
          const { getBlogPosts } = require("@/lib/content");
          const posts = getBlogPosts();

          // Verify: one BlogPost returned per valid MDX file
          if (posts.length !== uniqueEntries.length) {
            return false;
          }

          // Verify: every generated frontmatter appears in the results with correct field mapping
          for (const [fm, _body] of uniqueEntries) {
            const matchingPost = posts.find(
              (p: { slug: string }) => p.slug === fm.slug
            );
            if (!matchingPost) return false;
            if (matchingPost.title !== fm.title) return false;
            if (matchingPost.date !== fm.date) return false;
            if (matchingPost.excerpt !== fm.excerpt) return false;
            if (matchingPost.slug !== fm.slug) return false;

            // Verify tags array matches
            if (matchingPost.tags.length !== fm.tags.length) return false;
            for (let i = 0; i < fm.tags.length; i++) {
              if (matchingPost.tags[i] !== fm.tags[i]) return false;
            }

            // Verify content is a non-empty string (MDX body was parsed)
            if (typeof matchingPost.content !== "string") return false;
            if (matchingPost.content.trim().length === 0) return false;
          }

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * For any valid frontmatter, the returned BlogPost content field contains
   * the MDX body (not the frontmatter YAML).
   *
   * **Validates: Requirements 4.5**
   */
  it("content field contains MDX body, not frontmatter YAML", () => {
    fc.assert(
      fc.property(
        validFrontmatterArbitrary,
        mdxBodyArbitrary,
        (fm, body) => {
          const filename = `${fm.slug}.mdx`;
          const fileContent = buildMdxFile(fm, body);
          const blogDir = path.join(process.cwd(), "content", "blog");

          fs.existsSync = ((p: fs.PathLike) => {
            if (String(p) === blogDir) return true;
            return originalExistsSync(p);
          }) as typeof fs.existsSync;

          fs.readdirSync = ((p: fs.PathLike, ...args: unknown[]) => {
            if (String(p) === blogDir)
              return [filename] as unknown as fs.Dirent[];
            return originalReaddirSync(p, ...(args as [any]));
          }) as typeof fs.readdirSync;

          fs.readFileSync = ((
            p: fs.PathOrFileDescriptor,
            ...args: unknown[]
          ) => {
            if (String(p) === path.join(blogDir, filename)) return fileContent;
            return originalReadFileSync(p, ...(args as [any]));
          }) as typeof fs.readFileSync;

          const { getBlogPosts } = require("@/lib/content");
          const posts = getBlogPosts();

          if (posts.length !== 1) return false;

          const post = posts[0];
          // Content should NOT contain the YAML frontmatter delimiters
          if (post.content.includes("---")) return false;
          // Content should contain the body text we generated
          if (!post.content.includes("blog content about")) return false;

          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
