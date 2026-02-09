/**
 * Unit Tests for Blog Post Page
 *
 * Tests the individual blog post page returns 404 for non-existent slugs
 * and includes a back link to /blog.
 *
 * @see Requirements 3.3, 3.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import type { BlogPost } from '@/types/content';

// Mock next/navigation — notFound() throws in real Next.js to halt rendering
const NOT_FOUND_ERROR = 'NEXT_NOT_FOUND';
const mockNotFound = jest.fn(() => {
  throw new Error(NOT_FOUND_ERROR);
});
jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

// Mock react-markdown to simplify rendering
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="mock-markdown">{children}</div>;
  };
});

// Mock the content loader module
jest.mock('@/lib/content', () => ({
  getBlogPost: jest.fn(),
  getBlogPosts: jest.fn().mockReturnValue([]),
}));

// Import the mocked function for controlling return values
import { getBlogPost } from '@/lib/content';
const mockGetBlogPost = getBlogPost as jest.MockedFunction<typeof getBlogPost>;

// Import the component under test after mocks are set up
import BlogPostPage from '@/app/blog/[slug]/page';

// Sample blog post for testing
const samplePost: BlogPost = {
  title: 'Test Blog Post',
  date: '2025-01-15',
  excerpt: 'This is a test excerpt.',
  tags: ['cloud', 'architecture'],
  slug: 'test-blog-post',
  content: 'This is the full content of the test blog post.',
};

describe('Blog Post Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('404 for non-existent slug (Requirement 3.4)', () => {
    it('calls notFound() when slug does not match any post', async () => {
      mockGetBlogPost.mockReturnValue(undefined);

      const params = Promise.resolve({ slug: 'non-existent-slug' });
      await expect(BlogPostPage({ params })).rejects.toThrow(NOT_FOUND_ERROR);

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('calls getBlogPost with the provided slug', async () => {
      mockGetBlogPost.mockReturnValue(undefined);

      const params = Promise.resolve({ slug: 'some-slug' });
      await expect(BlogPostPage({ params })).rejects.toThrow(NOT_FOUND_ERROR);

      expect(mockGetBlogPost).toHaveBeenCalledWith('some-slug');
    });
  });

  describe('back link to /blog (Requirement 3.3)', () => {
    beforeEach(() => {
      mockGetBlogPost.mockReturnValue(samplePost);
    });

    it('renders a back link to /blog', async () => {
      const params = Promise.resolve({ slug: samplePost.slug });
      const Component = await BlogPostPage({ params });
      render(Component as React.ReactElement);

      const backLink = screen.getByText('← Back to Blog');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/blog');
    });
  });
});
