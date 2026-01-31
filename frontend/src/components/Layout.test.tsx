import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';

// Mock matchMedia for useReducedMotion and useScrollProgress hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Layout Component', () => {
  describe('Semantic HTML Structure', () => {
    it('renders header, main, and footer landmarks', () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      // Check for semantic landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('renders children within main content area', () => {
      render(
        <Layout>
          <h1>Test Heading</h1>
          <p>Test paragraph content</p>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toContainElement(screen.getByRole('heading', { name: 'Test Heading' }));
      expect(main).toContainElement(screen.getByText('Test paragraph content'));
    });

    it('has proper ARIA roles on landmarks', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Verify explicit roles are set
      const header = screen.getByRole('banner');
      const main = screen.getByRole('main');
      const footer = screen.getByRole('contentinfo');

      expect(header).toHaveAttribute('role', 'banner');
      expect(main).toHaveAttribute('role', 'main');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });
  });

  describe('Skip Link for Keyboard Navigation (Requirement 7.5)', () => {
    it('renders skip link that targets main content', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link is visually hidden by default', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('sr-only');
    });

    it('main content has matching id for skip link target', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('main content is focusable for skip link navigation', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      // tabIndex -1 allows programmatic focus but not tab navigation
      expect(main).toHaveAttribute('tabIndex', '-1');
    });

    it('skip link becomes visible on focus', async () => {
      const user = userEvent.setup();
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');
      
      // Focus the skip link
      await user.tab();
      
      // Skip link should have focus:not-sr-only class to become visible
      expect(skipLink).toHaveClass('focus:not-sr-only');
    });
  });

  describe('Navigation Landmarks', () => {
    it('renders main navigation with proper aria-label', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const mainNav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(mainNav).toBeInTheDocument();
    });

    it('renders footer navigation with proper aria-label', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const footerNav = screen.getByRole('navigation', { name: 'Footer navigation' });
      expect(footerNav).toBeInTheDocument();
    });
  });

  describe('Responsive Container', () => {
    it('applies container class to header content', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const header = screen.getByRole('banner');
      const container = header.querySelector('.container');
      expect(container).toBeInTheDocument();
    });

    it('applies container class to main content', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      const container = main.querySelector('.container');
      expect(container).toBeInTheDocument();
    });

    it('applies container class to footer content', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const footer = screen.getByRole('contentinfo');
      const container = footer.querySelector('.container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Header Structure', () => {
    it('renders site logo/title link with accessible name', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const logoLink = screen.getByRole('link', { name: 'Portfolio - Go to top of page' });
      expect(logoLink).toBeInTheDocument();
    });

    it('logo link has visible focus indicator classes', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const logoLink = screen.getByRole('link', { name: 'Portfolio - Go to top of page' });
      expect(logoLink).toHaveClass('focus:ring-2');
      expect(logoLink).toHaveClass('focus:outline-none');
    });

    it('header is sticky positioned', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0');
    });
  });

  describe('Footer Structure', () => {
    it('renders copyright text', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no duplicate landmark roles', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Should have exactly one of each main landmark
      expect(screen.getAllByRole('banner')).toHaveLength(1);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    });

    it('main content has focus outline removed for visual cleanliness', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('focus:outline-none');
    });
  });
});
