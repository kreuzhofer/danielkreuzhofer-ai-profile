import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { Navigation, NavLink, MobileMenuButton, MobileMenu, DEFAULT_SECTIONS } from './Navigation';

// Mock next/navigation — usePathname() is used by Navigation and MobileMenu
const mockUsePathname = jest.fn(() => '/');
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

beforeEach(() => {
  mockUsePathname.mockReturnValue('/');
});

describe('NavLink Component', () => {
  describe('Rendering', () => {
    it('renders link with correct href and label', () => {
      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={false}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '#experience');
    });

    it('renders with inactive styling when not active', () => {
      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={false}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      expect(link).toHaveClass('text-[var(--foreground-muted)]');
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('renders with active styling when active', () => {
      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={true}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      expect(link).toHaveClass('text-[var(--foreground)]');
    });
  });

  describe('Accessibility (Requirement 1.5)', () => {
    it('sets aria-current="page" when active', () => {
      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={true}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('does not set aria-current when inactive', () => {
      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={false}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('has visible focus indicator classes', () => {
      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={false}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      expect(link).toHaveClass('focus:ring-2');
      expect(link).toHaveClass('focus:outline-none');
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <NavLink
          href="#experience"
          label="Experience"
          isActive={false}
          onClick={handleClick}
        />
      );

      const link = screen.getByRole('link', { name: 'Experience' });
      await user.click(link);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Navigation Component', () => {
  describe('Rendering (Requirement 1.2)', () => {
    it('renders all default sections', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      expect(screen.getByRole('link', { name: 'Coaching' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Über mich' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Experience' })).not.toBeInTheDocument();
    });

    it('renders the Erstgespräch booking CTA as an external link', () => {
      render(<Navigation sections={DEFAULT_SECTIONS} currentSection="" />);
      const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
      expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
      expect(cta).toHaveAttribute('target', '_blank');
    });

    it('renders navigation with proper aria-label', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('renders custom sections when provided', () => {
      const customSections = [
        { href: '#home', label: 'Home' },
        { href: '#work', label: 'Work' },
      ];

      render(
        <Navigation
          sections={customSections}
          currentSection="home"
        />
      );

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
    });
  });

  describe('Active Section Indication (Requirement 1.5)', () => {
    it('marks the current route as active based on pathname', () => {
      // usePathname() is mocked to '/' — Coaching (href '/') should be active
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      const coachingLink = screen.getByRole('link', { name: 'Coaching' });
      expect(coachingLink).toHaveAttribute('aria-current', 'page');
    });

    it('only marks one section as active', () => {
      // pathname '/' → only Coaching (href '/') is active
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link => link.getAttribute('aria-current') === 'page');

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Coaching');
    });

    it('marks no section as active when pathname does not match any section', () => {
      mockUsePathname.mockReturnValue('/nonexistent');
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link => link.getAttribute('aria-current') === 'page');

      expect(activeLinks).toHaveLength(0);
    });
  });

  describe('Route link active state (segment-aware)', () => {
    it('marks /blog active on /blog and on a /blog sub-path, but not on /', () => {
      mockUsePathname.mockReturnValue('/blog');
      const { rerender } = render(<Navigation sections={DEFAULT_SECTIONS} currentSection="" />);
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page');

      mockUsePathname.mockReturnValue('/blog/my-post');
      rerender(<Navigation sections={DEFAULT_SECTIONS} currentSection="" />);
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page');

      mockUsePathname.mockReturnValue('/');
      rerender(<Navigation sections={DEFAULT_SECTIONS} currentSection="" />);
      expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveAttribute('aria-current');
    });

    it('does not mark /blog active on a prefix-colliding route like /blogging', () => {
      mockUsePathname.mockReturnValue('/blogging');
      render(<Navigation sections={DEFAULT_SECTIONS} currentSection="" />);
      expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveAttribute('aria-current');
    });
  });

  describe('Navigation Route Links (Requirement 1.1)', () => {
    it('section links have correct route hrefs for navigation', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      expect(screen.getByRole('link', { name: 'Coaching' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Über mich' })).toHaveAttribute('href', '/about');
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    });
  });

  describe('Desktop Layout', () => {
    it('is hidden on mobile (md:flex)', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveClass('hidden', 'md:flex');
    });

    it('displays links horizontally with spacing', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toHaveClass('md:items-center', 'md:space-x-1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('all links are keyboard accessible via Tab', async () => {
      const user = userEvent.setup();

      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      // Tab through all navigation links and the booking CTA
      await user.tab();
      expect(screen.getByRole('link', { name: 'Coaching' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Über mich' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Erstgespräch buchen' })).toHaveFocus();
    });
  });
});

describe('DEFAULT_SECTIONS', () => {
  it('contains the three primary route sections', () => {
    const sectionLabels = DEFAULT_SECTIONS.map(s => s.label);

    expect(sectionLabels).toContain('Coaching');
    expect(sectionLabels).toContain('Über mich');
    expect(sectionLabels).toContain('Blog');
  });

  it('has correct route hrefs', () => {
    const sectionHrefs = DEFAULT_SECTIONS.map(s => s.href);

    expect(sectionHrefs).toContain('/');
    expect(sectionHrefs).toContain('/about');
    expect(sectionHrefs).toContain('/blog');
  });

  it('has exactly 3 sections', () => {
    expect(DEFAULT_SECTIONS).toHaveLength(3);
  });

  it('contains Blog entry with /blog href', () => {
    const blogSection = DEFAULT_SECTIONS.find(s => s.label === 'Blog');
    expect(blogSection).toBeDefined();
    expect(blogSection!.href).toBe('/blog');
  });
});


describe('MobileMenuButton Component', () => {
  describe('Rendering', () => {
    it('renders a button element', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toBeInTheDocument();
    });

    it('is hidden on desktop (md:hidden)', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toHaveClass('md:hidden');
    });
  });

  describe('Accessibility (Requirement 1.3)', () => {
    it('has aria-expanded="false" when menu is closed', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded="true" when menu is open', () => {
      render(
        <MobileMenuButton
          isOpen={true}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /close menu/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to mobile-menu', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toHaveAttribute('aria-controls', 'mobile-menu');
    });

    it('has appropriate aria-label when closed', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toHaveAttribute('aria-label', 'Open menu');
    });

    it('has appropriate aria-label when open', () => {
      render(
        <MobileMenuButton
          isOpen={true}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /close menu/i });
      expect(button).toHaveAttribute('aria-label', 'Close menu');
    });

    it('has visible focus indicator classes', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:outline-none');
    });
  });

  describe('Touch Target Sizing (Requirement 5.2)', () => {
    it('has minimum touch target of 44x44px', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toHaveClass('min-w-[44px]');
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Click Handler', () => {
    it('calls onToggle when clicked', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <MobileMenuButton
          isOpen={false}
          onToggle={handleToggle}
        />
      );

      const button = screen.getByRole('button', { name: /open menu/i });
      await user.click(button);

      expect(handleToggle).toHaveBeenCalledTimes(1);
    });
  });
});

describe('MobileMenu Component', () => {
  describe('SSR / hydration safety', () => {
    // The portal must not render during SSR or on the first client render —
    // otherwise server (null) and client (portal) disagree and React throws a
    // hydration mismatch. A mounted-gate keeps the first render null on both.
    it('renders nothing on the server (no portal in SSR markup)', () => {
      const html = renderToString(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />,
      );
      expect(html).toBe('');
    });
  });

  describe('Rendering', () => {
    it('renders navigation links when open', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      expect(screen.getByRole('link', { name: 'Coaching' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Über mich' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
    });

    it('is hidden on desktop (md:hidden)', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      // The container div should have md:hidden class
      const container = document.querySelector('.md\\:hidden');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility (Requirement 1.3)', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-label for mobile navigation', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation');
    });

    it('has id="mobile-menu" for aria-controls reference', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const menu = document.getElementById('mobile-menu');
      expect(menu).toBeInTheDocument();
    });

    it('marks active route with aria-current="page" based on pathname', () => {
      // usePathname() is mocked to '/' — Coaching (href '/') should be active
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      const coachingLink = screen.getByRole('link', { name: 'Coaching' });
      expect(coachingLink).toHaveAttribute('aria-current', 'page');
    });

    it('only marks one section as active', () => {
      // pathname '/' → only Coaching (href '/') is active
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link => link.getAttribute('aria-current') === 'page');

      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Coaching');
    });
  });

  describe('Touch Target Sizing (Requirement 5.2)', () => {
    it('navigation links have minimum height of 44px', () => {
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
        expect(link).toHaveClass('min-h-[44px]');
      });
    });

    it('close button has minimum touch target of 44x44px', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      const closeButton = screen.getByRole('button', { name: /close menu/i });
      expect(closeButton).toHaveClass('min-w-[44px]');
      expect(closeButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('Navigation Callback', () => {
    it('clicking a route section link closes menu without calling onNavigate', async () => {
      const handleNavigate = jest.fn();
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(
        <MobileMenu
          isOpen={true}
          onClose={handleClose}
          sections={DEFAULT_SECTIONS}
          currentSection=""
          onNavigate={handleNavigate}
        />
      );

      const coachingLink = screen.getByRole('link', { name: 'Coaching' });
      await user.click(coachingLink);

      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleNavigate).not.toHaveBeenCalled();
    });

    it('closes menu after navigation', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(
        <MobileMenu
          isOpen={true}
          onClose={handleClose}
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      const blogLink = screen.getByRole('link', { name: 'Blog' });
      await user.click(blogLink);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
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

      const closeButton = screen.getByRole('button', { name: /close menu/i });
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
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

      // Click on the backdrop (the element with bg-black/30 class)
      const backdrop = document.querySelector('.bg-black\\/30');
      expect(backdrop).toBeInTheDocument();
      await user.click(backdrop!);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
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
  });

  describe('Focus Management', () => {
    it('focuses first link when menu opens', async () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      await waitFor(() => {
        const coachingLink = screen.getByRole('link', { name: 'Coaching' });
        expect(coachingLink).toHaveFocus();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('all links are keyboard accessible via Tab', async () => {
      const user = userEvent.setup();

      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection=""
        />
      );

      // First link (Coaching) should be focused initially
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Coaching' })).toHaveFocus();
      });

      // Tab through remaining navigation links and booking CTA
      await user.tab();
      expect(screen.getByRole('link', { name: 'Über mich' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Erstgespräch buchen' })).toHaveFocus();
    });
  });
});
