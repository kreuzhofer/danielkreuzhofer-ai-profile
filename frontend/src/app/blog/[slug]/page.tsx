/**
 * Individual Blog Post Page
 *
 * Server component that displays a single blog post by slug.
 * Uses BlogLayout for consistent navigation with the main page (header, nav,
 * scroll progress, footer). Content is centered with max-w-4xl.
 *
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { formatBlogDate } from '@/components/blog/PostPreviewCard';

/**
 * Generate static params for all blog post slugs.
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
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogLayout>
      {/* Hero banner — full bleed with title overlay */}
      {post.headerImage && (
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-10 overflow-hidden rounded-b-2xl">
          <div className="relative aspect-[21/9] md:aspect-[3/1]">
            <img
              src={post.headerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
              <div className="max-w-4xl mx-auto w-full">
                <Link
                  href="/blog"
                  className="text-sm text-white/70 hover:text-white transition-colors mb-4 inline-block"
                >
                  ← Back to Blog
                </Link>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <time
                    dateTime={post.date}
                    className="text-sm text-white/80"
                  >
                    {formatBlogDate(post.date)}
                  </time>
                  {post.linkedinUrl && (
                    <>
                      <span className="text-white/40">·</span>
                      <a
                        href={post.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        Read on LinkedIn
                      </a>
                    </>
                  )}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white/90 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Fallback header when no hero image */}
        {!post.headerImage && (
          <>
            <div className="mb-8">
              <Link
                href="/blog"
                className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary-400)] transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>
            <header className="mb-10">
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
            {post.linkedinUrl && (
              <div className="mb-8">
                <a
                  href={post.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Read on LinkedIn
                </a>
              </div>
            )}
          </>
        )}

        {/* MDX body content with prose typography */}
        <article className="blog-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
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
              img: ({ src, alt }) => (
                <figure className="my-8">
                  <img
                    src={src}
                    alt={alt || ''}
                    className="w-full rounded-lg border border-[var(--border)]"
                    loading="lazy"
                  />
                  {alt && (
                    <figcaption className="mt-2 text-center text-sm text-[var(--foreground-muted)] italic">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              hr: () => (
                <hr className="border-[var(--border)] my-8" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border-collapse text-sm text-[var(--foreground-muted)]">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-[var(--border)] text-foreground">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-[var(--border)]">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-[var(--surface)]">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2">{children}</td>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </div>
    </BlogLayout>
  );
}
