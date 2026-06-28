// src/components/home/BlogTeaser.tsx
import React from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/types/content';
import { homeContent } from './content';

export interface BlogTeaserProps {
  /** Latest posts to feature (caller pre-sorts/slices). */
  posts: Pick<BlogPost, 'title' | 'excerpt' | 'slug'>[];
}

export function BlogTeaser({ posts }: BlogTeaserProps) {
  const { blog } = homeContent;
  if (posts.length === 0) return null;
  return (
    <section id="blog" aria-label={blog.heading} className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
              {blog.eyebrow}
            </p>
            <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)]">{blog.heading}</h2>
          </div>
          <Link href={blog.href} className="flex-shrink-0 text-sm font-medium text-[var(--secondary-400)] hover:text-[var(--secondary-300)]">
            {blog.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5
                         hover:border-[var(--secondary-500)] transition-colors"
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--secondary-400)]">
                {post.title}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] line-clamp-3">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogTeaser;
