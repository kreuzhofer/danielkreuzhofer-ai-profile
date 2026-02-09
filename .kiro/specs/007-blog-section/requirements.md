# Requirements Document

## Introduction

This feature adds a blog section to the existing Next.js portfolio website. The blog serves as a dedicated page (`/blog`) with individual post pages (`/blog/[slug]`), repurposing LinkedIn posts as blog articles. Blog posts are authored as MDX files following the existing content patterns, with frontmatter metadata for title, date, tags, and excerpt. A new navigation entry integrates the blog into the site's existing navigation structure.

## Glossary

- **Blog_Section**: The top-level blog listing page accessible at `/blog`, displaying post previews
- **Blog_Post**: An individual blog article page accessible at `/blog/[slug]`, rendered from an MDX file
- **Blog_Listing**: The collection of post preview cards shown on the Blog_Section page
- **Post_Frontmatter**: The YAML metadata block at the top of each blog MDX file containing title, date, excerpt, tags, and slug
- **Navigation_System**: The existing desktop and mobile navigation components (`Navigation.tsx`, `MobileMenu`)
- **Content_Loader**: The utility module (`frontend/src/lib/content.ts`) that reads and parses MDX files with frontmatter
- **Post_Preview_Card**: A UI component displaying a blog post's title, date, excerpt, and tags on the listing page
- **MDX_Content**: Markdown content with JSX support, used for authoring blog posts following the existing content pattern

## Requirements

### Requirement 1: Blog Navigation Integration

**User Story:** As a visitor, I want to see a Blog entry in the site navigation, so that I can discover and access blog content from any page.

#### Acceptance Criteria

1. THE Navigation_System SHALL display a "Blog" link in the desktop navigation alongside the existing section links (About, Experience, Projects, Skills, Contact)
2. THE Navigation_System SHALL display a "Blog" link in the mobile menu alongside the existing section links
3. WHEN a visitor clicks the Blog navigation link, THE Navigation_System SHALL navigate to the `/blog` route
4. WHEN a visitor is on the `/blog` route, THE Navigation_System SHALL visually indicate the Blog link as active

### Requirement 2: Blog Listing Page

**User Story:** As a visitor, I want to browse a listing of all blog posts, so that I can find articles that interest me.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog`, THE Blog_Section SHALL display a page header and a list of Post_Preview_Cards
2. THE Blog_Section SHALL sort posts by date in descending order (newest first)
3. THE Post_Preview_Card SHALL display the post title, publication date, excerpt, and tags
4. WHEN a visitor clicks a Post_Preview_Card, THE Blog_Section SHALL navigate to the corresponding Blog_Post page at `/blog/[slug]`
5. WHEN no blog posts exist, THE Blog_Section SHALL display a message indicating no posts are available

### Requirement 3: Individual Blog Post Page

**User Story:** As a visitor, I want to read a full blog article on its own page, so that I can consume the content in a focused reading experience.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog/[slug]`, THE Blog_Post page SHALL render the full MDX content of the corresponding post
2. THE Blog_Post page SHALL display the post title, publication date, and tags above the content
3. THE Blog_Post page SHALL provide a link to navigate back to the Blog_Section listing
4. IF a visitor navigates to a slug that does not match any post, THEN THE Blog_Post page SHALL return a 404 not-found response
5. THE Blog_Post page SHALL render MDX content with consistent typography and styling matching the portfolio design language

### Requirement 4: Blog Content Authoring via MDX

**User Story:** As the site owner, I want to author blog posts as MDX files with frontmatter, so that I can manage content using the same pattern as the rest of the portfolio.

#### Acceptance Criteria

1. THE Content_Loader SHALL read blog post MDX files from the `frontend/content/blog/` directory
2. THE Post_Frontmatter SHALL include the fields: title (string), date (ISO date string), excerpt (string), tags (array of strings), and slug (string)
3. WHEN a blog MDX file is added to the content directory, THE Content_Loader SHALL include the new post in the blog listing without code changes
4. IF a blog MDX file has missing or invalid required frontmatter fields, THEN THE Content_Loader SHALL exclude that post from the listing and continue loading remaining posts
5. THE Content_Loader SHALL parse Post_Frontmatter and return it as a typed BlogPost object

### Requirement 5: Blog Visual Design Consistency

**User Story:** As a visitor, I want the blog to look and feel like the rest of the portfolio, so that the experience is cohesive.

#### Acceptance Criteria

1. THE Blog_Section SHALL use the same layout structure, color tokens, and typography as the existing portfolio pages
2. THE Blog_Post page SHALL use a readable content width and typographic styles suitable for long-form reading
3. THE Blog_Section SHALL be responsive across mobile, tablet, and desktop viewports
