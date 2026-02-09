/**
 * Individual Blog Post Page
 *
 * Server component that displays a single blog post by slug.
 * Uses PageHeader for consistent navigation and renders MDX body content
 * with readable prose typography.
 *
 * Features:
 * - Loads a single blog post via getBlogPost(slug)
 * - Returns 404 via notFound() if slug doesn't match any post
 * - Renders post title, formatted date, tags, and MDX body content
 * - Includes back link to /blog listing
 * - Uses generateStaticParams() for static generation of all post slugs
 * - Prose typography styles for readable long-form content
 *
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/PageHeader';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { formatBlogDate } from '@/components/blog/PostPreviewCard';

/**
 * Generate static params for all blog post slugs.
 * Enables static generation of all blog post pages at build time.
 */
export function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate dynamic metadata for each blog post page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Daniel Kreuzhofer',
    };
  }

  return {
    title: `${post.title} | Blog | Daniel Kreuzhofer`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Blog | Daniel Kreuzhofer`,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

/**
 * BlogPostPage component
 *
 * Renders a full blog post with metadata header and MDX body content.
 * Calls notFound() if the slug doesn't match any post (Requirement 3.4).
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  // Return 404 if slug doesn't match any post (Requirement 3.4)
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link to blog listing (Requirement 3.3) */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary-600)] transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Post metadata: title, date, tags (Requirement 3.2) */}
        <header className="mb-10 max-w-prose">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {post.title}
          </h1>
          <time
            dateTime={post.date}
            className="text-sm text-[var(--foreground-muted)]"
          >
            {formatBlogDate(post.date)}
          </time>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-900)] text-[var(--primary-300)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* MDX body content with prose typography (Requirements 3.1, 3.5) */}
        <article className="max-w-prose blog-prose">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg md:text-xl font-semibold text-foreground mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-base leading-relaxed text-[var(--foreground-muted)] mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1 text-[var(--foreground-muted)]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1 text-[var(--foreground-muted)]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-base leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[var(--primary-600)] pl-4 italic text-[var(--foreground-muted)] my-6">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary-400)] hover:text-[var(--primary-300)] underline transition-colors"
                >
                  {children}
                </a>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-[var(--surface)] text-[var(--foreground)] px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code
                    className={`${className || ''} block bg-[var(--surface)] text-[var(--foreground)] p-4 rounded-lg text-sm font-mono overflow-x-auto`}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-[var(--surface)] rounded-lg overflow-x-auto my-6">
                  {children}
                </pre>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              hr: () => (
                <hr className="border-[var(--border)] my-8" />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
