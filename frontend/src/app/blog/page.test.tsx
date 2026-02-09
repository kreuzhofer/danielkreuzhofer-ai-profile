/**
 * Unit Tests for Blog Listing Page
 *
 * Tests the blog listing page renders post cards when posts exist
 * and shows an empty state message when no posts exist.
 *
 * @see Requirements 2.1, 2.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import type { BlogPost } from '@/types/content';

// Mock the content loader module
jest.mock('@/lib/content', () => ({
  getBlogPosts: jest.fn(),
}));

// Import the mocked function for controlling return values
import { getBlogPosts } from '@/lib/content';
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>;

// Import the component under test after mocks are set up
import BlogListingPage from './page';

// Sample blog posts for testing
const samplePosts: BlogPost[] = [
  {
    title: 'First Blog Post',
    date: '2025-01-15',
    excerpt: 'This is the excerpt for the first blog post.',
    tags: ['cloud', 'architecture'],
    slug: 'first-blog-post',
    content: 'Full content of the first post.',
  },
  {
    title: 'Second Blog Post',
    date: '2025-01-10',
    excerpt: 'This is the excerpt for the second blog post.',
    tags: ['typescript'],
    slug: 'second-blog-post',
    content: 'Full content of the second post.',
  },
];

describe('Blog Listing Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when posts exist (Requirement 2.1)', () => {
    beforeEach(() => {
      mockGetBlogPosts.mockReturnValue(samplePosts);
    });

    it('renders the page heading', () => {
      render(<BlogListingPage />);

      expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument();
    });

    it('renders a PostPreviewCard for each blog post', () => {
      render(<BlogListingPage />);

      // Verify each post title is rendered
      expect(screen.getByText('First Blog Post')).toBeInTheDocument();
      expect(screen.getByText('Second Blog Post')).toBeInTheDocument();
    });

    it('renders post excerpts', () => {
      render(<BlogListingPage />);

      expect(screen.getByText('This is the excerpt for the first blog post.')).toBeInTheDocument();
      expect(screen.getByText('This is the excerpt for the second blog post.')).toBeInTheDocument();
    });

    it('renders links to individual blog posts', () => {
      render(<BlogListingPage />);

      const links = screen.getAllByRole('link');
      const blogPostLinks = links.filter(
        (link) =>
          link.getAttribute('href') === '/blog/first-blog-post' ||
          link.getAttribute('href') === '/blog/second-blog-post'
      );
      expect(blogPostLinks).toHaveLength(2);
    });

    it('does not show the empty state message', () => {
      render(<BlogListingPage />);

      expect(
        screen.queryByText('No blog posts available yet. Check back soon!')
      ).not.toBeInTheDocument();
    });
  });

  describe('when no posts exist (Requirement 2.5)', () => {
    beforeEach(() => {
      mockGetBlogPosts.mockReturnValue([]);
    });

    it('renders the page heading', () => {
      render(<BlogListingPage />);

      expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument();
    });

    it('shows the empty state message', () => {
      render(<BlogListingPage />);

      expect(
        screen.getByText('No blog posts available yet. Check back soon!')
      ).toBeInTheDocument();
    });

    it('does not render any post cards', () => {
      render(<BlogListingPage />);

      // No links to blog posts should exist (only the PageHeader links)
      const links = screen.getAllByRole('link');
      const blogPostLinks = links.filter((link) =>
        link.getAttribute('href')?.startsWith('/blog/')
      );
      expect(blogPostLinks).toHaveLength(0);
    });
  });
});
