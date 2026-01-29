import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation, NavLink, MobileMenuButton, MobileMenu, DEFAULT_SECTIONS } from './Navigation';

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
      expect(link).toHaveClass('text-gray-600');
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
      expect(link).toHaveClass('text-foreground');
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
          currentSection="about"
        />
      );

      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Experience' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
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
    it('marks the current section as active', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="experience"
        />
      );

      const experienceLink = screen.getByRole('link', { name: 'Experience' });
      expect(experienceLink).toHaveAttribute('aria-current', 'page');
    });

    it('only marks one section as active', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="projects"
        />
      );

      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link => link.getAttribute('aria-current') === 'page');
      
      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Projects');
    });

    it('marks no section as active when currentSection does not match', () => {
      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="nonexistent"
        />
      );

      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link => link.getAttribute('aria-current') === 'page');
      
      expect(activeLinks).toHaveLength(0);
    });
  });

  describe('Navigation Callback (Requirement 1.1)', () => {
    it('calls onNavigate with section ID when link is clicked', async () => {
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
      await user.click(experienceLink);

      expect(handleNavigate).toHaveBeenCalledWith('experience');
    });

    it('extracts section ID correctly from href', async () => {
      const handleNavigate = jest.fn();
      const user = userEvent.setup();

      render(
        <Navigation
          sections={DEFAULT_SECTIONS}
          currentSection="about"
          onNavigate={handleNavigate}
        />
      );

      const contactLink = screen.getByRole('link', { name: 'Contact' });
      await user.click(contactLink);

      expect(handleNavigate).toHaveBeenCalledWith('contact');
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
  });
});

describe('DEFAULT_SECTIONS', () => {
  it('contains all required content sections', () => {
    const sectionLabels = DEFAULT_SECTIONS.map(s => s.label);
    
    expect(sectionLabels).toContain('About');
    expect(sectionLabels).toContain('Experience');
    expect(sectionLabels).toContain('Projects');
    expect(sectionLabels).toContain('Skills');
    expect(sectionLabels).toContain('Contact');
  });

  it('has correct anchor hrefs', () => {
    const sectionHrefs = DEFAULT_SECTIONS.map(s => s.href);
    
    expect(sectionHrefs).toContain('#about');
    expect(sectionHrefs).toContain('#experience');
    expect(sectionHrefs).toContain('#projects');
    expect(sectionHrefs).toContain('#skills');
    expect(sectionHrefs).toContain('#contact');
  });

  it('has exactly 5 sections', () => {
    expect(DEFAULT_SECTIONS).toHaveLength(5);
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
  describe('Rendering', () => {
    it('renders navigation links when open', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
        />
      );

      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Experience' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
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

    it('marks active section with aria-current="page"', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="experience"
        />
      );

      const experienceLink = screen.getByRole('link', { name: 'Experience' });
      expect(experienceLink).toHaveAttribute('aria-current', 'page');
    });

    it('only marks one section as active', () => {
      render(
        <MobileMenu
          isOpen={true}
          onClose={() => {}}
          sections={DEFAULT_SECTIONS}
          currentSection="projects"
        />
      );

      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link => link.getAttribute('aria-current') === 'page');
      
      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent('Projects');
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
    it('calls onNavigate with section ID when link is clicked', async () => {
      const handleNavigate = jest.fn();
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(
        <MobileMenu
          isOpen={true}
          onClose={handleClose}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
          onNavigate={handleNavigate}
        />
      );

      const experienceLink = screen.getByRole('link', { name: 'Experience' });
      await user.click(experienceLink);

      expect(handleNavigate).toHaveBeenCalledWith('experience');
    });

    it('closes menu after navigation', async () => {
      const handleNavigate = jest.fn();
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(
        <MobileMenu
          isOpen={true}
          onClose={handleClose}
          sections={DEFAULT_SECTIONS}
          currentSection="about"
          onNavigate={handleNavigate}
        />
      );

      const experienceLink = screen.getByRole('link', { name: 'Experience' });
      await user.click(experienceLink);

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

      // Click on the backdrop (the element with bg-black class)
      const backdrop = document.querySelector('.bg-black');
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
          currentSection="about"
        />
      );

      await waitFor(() => {
        const aboutLink = screen.getByRole('link', { name: 'About' });
        expect(aboutLink).toHaveFocus();
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
          currentSection="about"
        />
      );

      // First link should be focused initially
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'About' })).toHaveFocus();
      });

      // Tab through all navigation links
      await user.tab();
      expect(screen.getByRole('link', { name: 'Experience' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Skills' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveFocus();
    });
  });
});
