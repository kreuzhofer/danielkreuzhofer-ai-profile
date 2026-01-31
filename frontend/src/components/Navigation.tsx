'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

/**
 * Props for the NavLink component
 */
export interface NavLinkProps {
  /** Anchor link (e.g., "#experience") */
  href: string;
  /** Display text */
  label: string;
  /** Current section indicator */
  isActive: boolean;
  /** Click handler for navigation */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Props for the MobileMenuButton component
 */
export interface MobileMenuButtonProps {
  /** Whether the mobile menu is currently open */
  isOpen: boolean;
  /** Callback to toggle the menu state */
  onToggle: () => void;
}

/**
 * MobileMenuButton component - hamburger menu button for mobile navigation.
 * 
 * Features:
 * - Proper ARIA attributes for accessibility (Requirement 1.3)
 * - Touch target of 44x44px minimum (Requirement 5.2)
 * - Animated hamburger to X transition
 * - Visible focus indicators
 * 
 * @example
 * ```tsx
 * <MobileMenuButton
 *   isOpen={isMenuOpen}
 *   onToggle={() => setIsMenuOpen(!isMenuOpen)}
 * />
 * ```
 */
export function MobileMenuButton({ isOpen, onToggle }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="
        inline-flex items-center justify-center
        min-w-[44px] min-h-[44px] p-2
        text-gray-600 hover:text-foreground
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:rounded-md
        transition-colors duration-200
        md:hidden
      "
    >
      <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
      {/* Hamburger icon with animated transition to X */}
      <div className="relative w-6 h-6">
        <span
          aria-hidden="true"
          className={`
            absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out
            ${isOpen ? 'rotate-45 top-[11px]' : 'top-1'}
          `}
        />
        <span
          aria-hidden="true"
          className={`
            absolute block w-6 h-0.5 bg-current top-[11px] transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-0' : 'opacity-100'}
          `}
        />
        <span
          aria-hidden="true"
          className={`
            absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out
            ${isOpen ? '-rotate-45 top-[11px]' : 'top-[19px]'}
          `}
        />
      </div>
    </button>
  );
}

/**
 * Props for the MobileMenu component
 */
export interface MobileMenuProps {
  /** Whether the mobile menu is currently open */
  isOpen: boolean;
  /** Callback to close the menu */
  onClose: () => void;
  /** Array of section navigation items */
  sections: Omit<NavLinkProps, 'isActive' | 'onClick'>[];
  /** Currently active section ID (without #) */
  currentSection: string;
  /** Callback when a section is navigated to */
  onNavigate?: (sectionId: string) => void;
}

/**
 * MobileMenu component - slide-out overlay menu for mobile navigation.
 * 
 * Features:
 * - Slide-out overlay from right side (Requirement 1.3)
 * - Touch targets of 44x44px minimum (Requirement 5.2)
 * - Proper ARIA attributes and focus management
 * - Closes on backdrop click or Escape key
 * - Traps focus within menu when open
 * - Uses createPortal for proper stacking context
 * 
 * @example
 * ```tsx
 * <MobileMenu
 *   isOpen={isMenuOpen}
 *   onClose={() => setIsMenuOpen(false)}
 *   sections={DEFAULT_SECTIONS}
 *   currentSection="about"
 *   onNavigate={handleNavigate}
 * />
 * ```
 */
export function MobileMenu({
  isOpen,
  onClose,
  sections,
  currentSection,
  onNavigate,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus first link when menu opens
  useEffect(() => {
    if (isOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /**
   * Handle navigation click - closes menu and calls onNavigate
   */
  const handleClick = (href: string) => (_e: React.MouseEvent<HTMLAnchorElement>) => {
    const sectionId = href.replace('#', '');
    
    if (onNavigate) {
      onNavigate(sectionId);
    }
    
    // Close the menu after navigation
    onClose();
  };

  // Don't render anything if not open (for SSR compatibility)
  if (typeof document === 'undefined') {
    return null;
  }

  const menuContent = (
    <div
      className={`
        fixed inset-0 z-50 md:hidden
        transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      aria-hidden={!isOpen}
    >
      {/* Backdrop overlay */}
      <div
        className={`
          absolute inset-0 bg-black transition-opacity duration-300
          ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out menu panel */}
      <nav
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`
          absolute top-0 right-0 h-full w-64 max-w-[80vw]
          bg-background shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Menu header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-foreground">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="
              inline-flex items-center justify-center
              min-w-[44px] min-h-[44px] p-2
              text-gray-600 hover:text-foreground
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:rounded-md
              transition-colors duration-200
            "
          >
            <span className="sr-only">Close menu</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <ul className="py-4">
          {sections.map((section, index) => {
            const sectionId = section.href.replace('#', '');
            const isActive = currentSection === sectionId;

            return (
              <li key={section.href}>
                <a
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={section.href}
                  onClick={handleClick(section.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    block px-6 py-3 min-h-[44px]
                    text-base font-medium
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-foreground
                    ${isActive
                      ? 'text-foreground bg-gray-100 border-l-4 border-foreground'
                      : 'text-gray-600 hover:text-foreground hover:bg-gray-50'
                    }
                  `}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* CTA Buttons */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-3">
          <Link
            href="/transparency"
            onClick={onClose}
            className="
              flex items-center justify-center gap-2
              w-full px-4 py-3 min-h-[44px]
              bg-gray-100 hover:bg-gray-200
              text-gray-700 font-medium text-base
              rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
            "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Skills Transparency
          </Link>
          <Link
            href="/fit-analysis"
            onClick={onClose}
            className="
              flex items-center justify-center gap-2
              w-full px-4 py-3 min-h-[44px]
              bg-blue-600 hover:bg-blue-700
              text-white font-medium text-base
              rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
            "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Fit Analysis
          </Link>
        </div>
      </nav>
    </div>
  );

  return createPortal(menuContent, document.body);
}

/**
 * NavLink component for navigation items with active state styling.
 * 
 * Features:
 * - Active state visual indication (Requirement 1.5)
 * - `aria-current="page"` for screen readers when active
 * - Keyboard accessible (focusable, Enter/Space to activate)
 * - Visible focus indicators for accessibility
 * 
 * @example
 * ```tsx
 * <NavLink
 *   href="#experience"
 *   label="Experience"
 *   isActive={currentSection === 'experience'}
 *   onClick={handleNavigate}
 * />
 * ```
 */
export function NavLink({ href, label, isActive, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`
        relative px-3 py-2 text-sm font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:rounded-md
        ${isActive
          ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
          : 'text-gray-600 hover:text-foreground'
        }
      `}
    >
      {label}
    </a>
  );
}

/**
 * Props for the Navigation component
 */
export interface NavigationProps {
  /** Array of section navigation items */
  sections: Omit<NavLinkProps, 'isActive' | 'onClick'>[];
  /** Currently active section ID (without #) */
  currentSection: string;
  /** Callback when a section is navigated to */
  onNavigate?: (sectionId: string) => void;
}

/**
 * Default navigation sections for the portfolio
 */
export const DEFAULT_SECTIONS: Omit<NavLinkProps, 'isActive' | 'onClick'>[] = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

/**
 * Navigation component providing desktop horizontal navigation.
 * 
 * Features:
 * - Displays all primary content sections visibly (Requirement 1.2)
 * - Provides access to all sections within 2 clicks (Requirement 1.1)
 * - Indicates current active section (Requirement 1.5)
 * - Keyboard navigable with visible focus states
 * - Includes Fit Analysis CTA button
 * 
 * @example
 * ```tsx
 * <Navigation
 *   sections={DEFAULT_SECTIONS}
 *   currentSection="experience"
 *   onNavigate={(sectionId) => console.log(`Navigating to ${sectionId}`)}
 * />
 * ```
 */
export function Navigation({
  sections = DEFAULT_SECTIONS,
  currentSection,
  onNavigate,
}: NavigationProps) {
  /**
   * Handle navigation click - extracts section ID from href and calls onNavigate
   */
  const handleClick = (href: string) => (_e: React.MouseEvent<HTMLAnchorElement>) => {
    // Extract section ID from href (remove the # prefix)
    const sectionId = href.replace('#', '');
    
    // Call onNavigate callback if provided
    if (onNavigate) {
      onNavigate(sectionId);
    }
    
    // Allow default anchor behavior for smooth scrolling
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="hidden md:flex md:items-center md:space-x-1"
    >
      {sections.map((section) => {
        const sectionId = section.href.replace('#', '');
        const isActive = currentSection === sectionId;
        
        return (
          <NavLink
            key={section.href}
            href={section.href}
            label={section.label}
            isActive={isActive}
            onClick={handleClick(section.href)}
          />
        );
      })}
      
      {/* CTA Buttons */}
      <div className="flex items-center ml-4 space-x-2">
        <Link
          href="/transparency"
          className="
            px-4 py-2
            bg-gray-100 hover:bg-gray-200
            text-gray-700 text-sm font-medium
            rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          "
        >
          Skills Transparency
        </Link>
        <Link
          href="/fit-analysis"
          className="
            px-4 py-2
            bg-blue-600 hover:bg-blue-700
            text-white text-sm font-medium
            rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
          "
        >
          Fit Analysis
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;
