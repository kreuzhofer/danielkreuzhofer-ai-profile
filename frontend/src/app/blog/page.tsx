/**
 * Blog Listing Page
 *
 * Server component that displays all blog posts in a grid layout.
 * Uses PageHeader for consistent navigation and PostPreviewCard for each post.
 *
 * Features:
 * - Loads all blog posts via getBlogPosts() (sorted by date descending)
 * - Renders a responsive grid of PostPreviewCard components
 * - Shows empty state message when no posts exist
 * - Page metadata for SEO
 *
 * @see Requirements 2.1, 2.2, 2.5
 */

import { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PostPreviewCard } from '@/components/blog/PostPreviewCard';
import { getBlogPosts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog | Daniel Kreuzhofer',
  description:
    'Thoughts on cloud architecture, software engineering, and technology leadership.',
  openGraph: {
    title: 'Blog | Daniel Kreuzhofer',
    description:
      'Thoughts on cloud architecture, software engineering, and technology leadership.',
    type: 'website',
  },
};

export default function BlogListingPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page title and description */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Blog
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            Thoughts on cloud architecture, software engineering, and technology
            leadership.
          </p>
        </div>

        {/* Blog posts grid or empty state */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostPreviewCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-[var(--foreground-muted)]">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
