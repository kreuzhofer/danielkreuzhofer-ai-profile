/**
 * Blog Listing Page
 *
 * Server component that displays all blog posts with scroll-in animations.
 * Uses BlogLayout for consistent navigation with the main page (header, nav,
 * scroll progress, footer).
 *
 * @see Requirements 2.1, 2.2, 2.5
 */

import { Metadata } from 'next';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { AnimatedBlogCard } from '@/components/blog/AnimatedBlogCard';
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
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
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

        {/* Blog posts with scroll-in animations */}
        {posts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {posts.map((post, index) => (
              <AnimatedBlogCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-[var(--foreground-muted)]">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
