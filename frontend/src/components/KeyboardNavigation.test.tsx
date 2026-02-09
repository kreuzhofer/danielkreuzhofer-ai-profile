/**
 * Keyboard Navigation Tests
 * 
 * Verifies keyboard accessibility throughout the site:
 * - Tab order follows visual layout (top to bottom, left to right)
 * - Skip link at top of page for keyboard users
 * - Navigation links are focusable and activatable with Enter
 * - Expand/collapse buttons respond to Enter and Space
 * - Social links are focusable
 * - Contact option links are focusable
 * - Filter dropdowns are keyboard accessible
 * - Mobile menu is keyboard accessible
 * - All focusable elements have visible focus indicators
 * 
 * **Validates: Requirements 1.6, 7.2**
 * - 1.6: THE Navigation_System SHALL support keyboard navigation for accessibility compliance
 * - 7.2: THE Expansion_Controls SHALL be operable via keyboard (Enter/Space to toggle)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';
import { Navigation, MobileMenu, DEFAULT_SECTIONS } from './Navigation';
import { AboutSection, SocialLinks } from './AboutSection';
import { ContactSection, ContactOptionCard } from './ContactSection';
import { Expandable } from './Expandable';
import { ExperienceFilter } from './ExperienceSection';
import type { About, Contact, ContactOption } from '@/types/content';

// Mock next/navigation — usePathname() is used by Navigation and MobileMenu
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

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

describe('Keyboard Navigation (Requirements 1.6, 7.2)', () => {
  describe('Skip Link Navigation', () => {
    it('skip link is first focusable element on page', async () => {
      const user = userEvent.setup();
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // First tab should focus the skip link
      await user.tab();
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();
    });

    it('skip link has visible focus indicator', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('focus:not-sr-only');
      expect(skipLink).toHaveClass('focus:ring-2');
    });

    it('skip link targets main content area', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Navigation Links Keyboard Access', () => {
    it('all navigation links are focusable via Tab', async () => {
      const user = userEvent.setup();
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      // Tab through all navigation links
      await user.tab();
      expect(screen.getByRole('link', { name: 'About' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Experience' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Skills' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveFocus();
    });

    it('navigation links have visible focus indicators', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('focus:ring-2');
        expect(link).toHaveClass('focus:outline-none');
      });
    });

    it('navigation links are activatable with Enter key', async () => {
      const handleNavigate = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
          onNavigate={handleNavigate}
        />
      );

      const experienceLink = screen.getByRole('link', { name: 'Experience' });
      experienceLink.focus();
      await user.keyboard('{Enter}');

      expect(handleNavigate).toHaveBeenCalledWith('experience');
    });
  });

  describe('Expand/Collapse Keyboard Controls (Requirement 7.2)', () => {
    it('expand button responds to Enter key', () => {
      const onToggle = jest.fn();
      render(
        <Expandable
          id="test-item"
          isExpanded={false}
          onToggle={onToggle}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('expand button responds to Space key', () => {
      const onToggle = jest.fn();
      render(
        <Expandable
          id="test-item"
          isExpanded={false}
          onToggle={onToggle}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('expand button has visible focus indicator', () => {
      render(
        <Expandable
          id="test-item"
          isExpanded={false}
          onToggle={() => {}}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:outline-none');
    });

    it('expand button does not respond to other keys', () => {
      const onToggle = jest.fn();
      render(
        <Expandable
          id="test-item"
          isExpanded={false}
          onToggle={onToggle}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'a' });

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Social Links Keyboard Access', () => {
    const sampleSocialLinks = [
      { platform: 'linkedin' as const, url: 'https://linkedin.com/in/test', label: 'LinkedIn Profile' },
      { platform: 'github' as const, url: 'https://github.com/test', label: 'GitHub Profile' },
      { platform: 'email' as const, url: 'mailto:test@example.com', label: 'Email' },
    ];

    it('social links are focusable', async () => {
      const user = userEvent.setup();
      render(<SocialLinks links={sampleSocialLinks} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);

      // Tab through all social links
      await user.tab();
      expect(links[0]).toHaveFocus();

      await user.tab();
      expect(links[1]).toHaveFocus();

      await user.tab();
      expect(links[2]).toHaveFocus();
    });

    it('social links have visible focus indicators', () => {
      render(<SocialLinks links={sampleSocialLinks} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('focus:ring-2');
        expect(link).toHaveClass('focus:outline-none');
      });
    });
  });

  describe('Contact Options Keyboard Access', () => {
    const sampleContactOption: ContactOption = {
      type: 'email',
      label: 'Send an email',
      url: 'mailto:hello@example.com',
      description: "I'd love to hear from you",
    };

    it('contact option card is focusable', async () => {
      const user = userEvent.setup();
      render(<ContactOptionCard option={sampleContactOption} />);

      const link = screen.getByRole('link');
      await user.tab();
      expect(link).toHaveFocus();
    });

    it('contact option card has visible focus indicator', () => {
      render(<ContactOptionCard option={sampleContactOption} />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('focus:ring-2');
      expect(link).toHaveClass('focus:outline-none');
    });
  });

  describe('Filter Dropdowns Keyboard Access', () => {
    const companies = ['Tech Corp', 'Startup Inc', 'Big Company'];

    it('filter dropdown is focusable', async () => {
      const user = userEvent.setup();
      render(
        <ExperienceFilter
          companies={companies}
          selectedCompany=""
          onFilterChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      await user.tab();
      expect(select).toHaveFocus();
    });

    it('filter dropdown has visible focus indicator', () => {
      render(
        <ExperienceFilter
          companies={companies}
          selectedCompany=""
          onFilterChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('focus:ring-2');
      expect(select).toHaveClass('focus:outline-none');
    });

    it('filter dropdown can be operated with keyboard', async () => {
      const handleFilterChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <ExperienceFilter
          companies={companies}
          selectedCompany=""
          onFilterChange={handleFilterChange}
        />
      );

      const select = screen.getByRole('combobox');
      await user.tab();
      expect(select).toHaveFocus();

      // Select an option using keyboard
      await user.selectOptions(select, 'Tech Corp');
      expect(handleFilterChange).toHaveBeenCalledWith('Tech Corp');
    });

    it('clear filter button has visible focus indicator when shown', () => {
      render(
        <ExperienceFilter
          companies={companies}
          selectedCompany="Tech Corp"
          onFilterChange={() => {}}
        />
      );

      const clearButton = screen.getByRole('button', { name: /clear filter/i });
      expect(clearButton).toHaveClass('focus:ring-2');
      expect(clearButton).toHaveClass('focus:outline-none');
    });
  });

  describe('Mobile Menu Keyboard Access', () => {
    it('mobile menu links are focusable', async () => {
      const user = userEvent.setup();
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      // First link should be focused when menu opens
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'About' })).toHaveFocus();
      });

      // Tab through remaining links
      await user.tab();
      expect(screen.getByRole('link', { name: 'Experience' })).toHaveFocus();
    });

    it('mobile menu links have visible focus indicators', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('focus:ring-2');
      });
    });

    it('mobile menu closes on Escape key', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();
      
      render(
        <MobileMenu
          isOpen={true}
          onClose={handleClose}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('mobile menu close button has visible focus indicator', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const closeButton = screen.getByRole('button', { name: /close menu/i });
      expect(closeButton).toHaveClass('focus:ring-2');
      expect(closeButton).toHaveClass('focus:outline-none');
    });
  });

  describe('Focus Indicator Contrast', () => {
    it('focus indicators use ring color for sufficient contrast', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      // Get only the section navigation links (not the CTA buttons)
      const sectionLinks = DEFAULT_SECTIONS.map(section => 
        screen.getByRole('link', { name: section.label })
      );
      
      sectionLinks.forEach(link => {
        // Using ring with primary color ensures contrast against background
        expect(link).toHaveClass('focus:ring-2');
        expect(link).toHaveClass('focus:ring-[var(--primary-500)]');
      });
    });

    it('Fit Analysis button has visible focus indicator', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const fitAnalysisLink = screen.getByRole('link', { name: 'Fit Analysis' });
      expect(fitAnalysisLink).toHaveClass('focus:ring-2');
      expect(fitAnalysisLink).toHaveClass('focus:ring-[var(--secondary-500)]');
    });

    it('focus indicators use ring-offset for visibility', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('focus:ring-offset-2');
      });
    });
  });

  describe('Tab Order Follows Visual Layout', () => {
    it('tab order in Layout follows top-to-bottom flow', async () => {
      const user = userEvent.setup();
      render(
        <Layout>
          <div>
            <button data-testid="content-button">Content Button</button>
          </div>
        </Layout>
      );

      // 1. Skip link (first)
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      // 2. Logo link
      await user.tab();
      expect(screen.getByRole('link', { name: 'Daniel Kreuzhofer - Go to top of page' })).toHaveFocus();

      // 3-8. Navigation links (About, Experience, Projects, Skills, Contact, Blog)
      await user.tab();
      expect(screen.getByRole('link', { name: 'About' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Experience' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Skills' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveFocus();

      // 9. Skills Transparency CTA button
      await user.tab();
      expect(screen.getByRole('link', { name: 'Skills Transparency' })).toHaveFocus();

      // 10. Fit Analysis CTA button
      await user.tab();
      expect(screen.getByRole('link', { name: 'Fit Analysis' })).toHaveFocus();

      // 11. Mobile menu button (visible in DOM even if hidden on desktop)
      await user.tab();
      expect(screen.getByRole('button', { name: /open menu/i })).toHaveFocus();

      // 12. Content area elements
      await user.tab();
      expect(screen.getByTestId('content-button')).toHaveFocus();
    });
  });
});
