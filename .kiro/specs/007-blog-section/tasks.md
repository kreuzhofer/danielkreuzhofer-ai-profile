# Implementation Plan: Blog Section

## Overview

Add a blog section to the portfolio with a listing page (`/blog`), individual post pages (`/blog/[slug]`), MDX-based content authoring, and navigation integration. Implementation follows the existing content loading and routing patterns.

## Tasks

- [x] 1. Add BlogPost types and content loader functions
  - [x] 1.1 Add `BlogPostFrontmatter` and `BlogPost` interfaces to `frontend/src/types/content.ts`
    - `BlogPostFrontmatter`: title (string), date (string), excerpt (string), tags (string[]), slug (string)
    - `BlogPost`: extends frontmatter fields plus content (string) for MDX body
    - _Requirements: 4.2, 4.5_

  - [x] 1.2 Add `getBlogPosts()` and `getBlogPost(slug)` functions to `frontend/src/lib/content.ts`
    - `getBlogPosts()`: reads all `.mdx` files from `content/blog/`, parses frontmatter via `gray-matter`, skips files with missing required fields (title, date, excerpt, tags, slug) using try/catch, sorts by date descending, returns `BlogPost[]`
    - `getBlogPost(slug)`: calls `getBlogPosts()` and finds by slug, returns `BlogPost | undefined`
    - Return empty array if `content/blog/` directory doesn't exist
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 2.2_

  - [x] 1.3 Write property test for date sort order (Property 1)
    - **Property 1: Blog posts are sorted by date descending**
    - Generate random arrays of BlogPost objects with varying dates, pass through sort logic, verify each date >= next date
    - Use `fast-check` with `{ numRuns: 3 }`
    - **Validates: Requirements 2.2**

  - [x] 1.4 Write property test for content loader parsing (Property 4)
    - **Property 4: Content loader parses all valid MDX files**
    - Generate random valid frontmatter objects, create temp MDX files, call `getBlogPosts()`, verify all fields match
    - Use `fast-check` with `{ numRuns: 3 }`
    - **Validates: Requirements 4.3, 4.5**

  - [x] 1.5 Write property test for invalid frontmatter exclusion (Property 5)
    - **Property 5: Invalid frontmatter files are excluded gracefully**
    - Generate mixes of valid and invalid frontmatter MDX files, call `getBlogPosts()`, verify only valid posts returned and no errors thrown
    - Use `fast-check` with `{ numRuns: 3 }`
    - **Validates: Requirements 4.4**

- [x] 2. Checkpoint - Ensure content loader tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create blog listing page and PostPreviewCard component
  - [x] 3.1 Create `PostPreviewCard` component at `frontend/src/components/blog/PostPreviewCard.tsx`
    - Renders clickable card with title, formatted date, excerpt, and tag badges
    - Links to `/blog/[slug]` using Next.js `<Link>`
    - Uses existing design tokens and Tailwind classes for consistent styling
    - _Requirements: 2.3, 2.4_

  - [x] 3.2 Create blog listing page at `frontend/src/app/blog/page.tsx`
    - Server component using `PageHeader` and `getBlogPosts()`
    - Renders grid of `PostPreviewCard` components
    - Shows empty state message when no posts exist
    - Includes page metadata via `export const metadata`
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 3.3 Write property test for PostPreviewCard (Property 2)
    - **Property 2: Preview card displays all required fields and correct link**
    - Generate random BlogPost objects, render PostPreviewCard, verify title, date, excerpt, tags, and `/blog/{slug}` link present
    - Use `fast-check` with `{ numRuns: 3 }`
    - **Validates: Requirements 2.3, 2.4**

  - [x] 3.4 Write unit tests for blog listing page
    - Test that listing renders post cards when posts exist
    - Test empty state message when no posts exist
    - _Requirements: 2.1, 2.5_

- [x] 4. Create individual blog post page
  - [x] 4.1 Create blog post page at `frontend/src/app/blog/[slug]/page.tsx`
    - Server component using `PageHeader` and `getBlogPost(slug)`
    - Calls `notFound()` if slug doesn't match any post
    - Renders post title, formatted date, tags, and MDX body content
    - Includes back link to `/blog`
    - Uses `generateStaticParams()` for static generation of all post slugs
    - Prose typography styles for readable long-form content (max-w-prose, Tailwind typography)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Write property test for blog post page metadata (Property 3)
    - **Property 3: Blog post page displays metadata**
    - Generate random BlogPost objects, render page metadata section, verify title, date, and tags present
    - Use `fast-check` with `{ numRuns: 3 }`
    - **Validates: Requirements 3.2**

  - [x] 4.3 Write unit tests for blog post page
    - Test 404 response for non-existent slug
    - Test back link to `/blog` is present
    - _Requirements: 3.3, 3.4_

- [x] 5. Checkpoint - Ensure all page tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Integrate blog into navigation
  - [x] 6.1 Update `Navigation.tsx` to support route-based links and add Blog entry
    - Add "Blog" to `DEFAULT_SECTIONS` with `href: '/blog'`
    - Update `NavLink` to detect route hrefs (not starting with `#`) and render Next.js `<Link>` instead of `<a>`
    - Update `MobileMenu` to handle route-based links the same way
    - Determine active state for Blog link based on current pathname (using `usePathname()` from `next/navigation`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 6.2 Write unit tests for navigation Blog link
    - Test Blog link present in desktop nav
    - Test Blog link present in mobile menu
    - Test Blog link href is `/blog`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Add sample blog content
  - [x] 7.1 Create `frontend/content/blog/` directory with a sample MDX post and `_index.ts`
    - Create at least one sample blog post MDX file with complete frontmatter
    - Create `_index.ts` following the existing pattern in `experience/_index.ts`
    - _Requirements: 4.1, 4.3_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `{ numRuns: 3 }` per workspace guidelines
- Tests run via `npm test --prefix frontend`
- The blog reuses `PageHeader`, design tokens, and content loading patterns from existing code
