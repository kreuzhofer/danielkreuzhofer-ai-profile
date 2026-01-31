'use client';

import React, { useState, useCallback } from 'react';
import { Navigation, MobileMenuButton, MobileMenu, DEFAULT_SECTIONS } from './Navigation';
import { useActiveSection, useScrollProgress, useReducedMotion } from '../hooks';
import { FloatingContactButton } from './FloatingContactButton';

/**
 * Props for the Layout component
 */
interface LayoutProps {
  /** Main content to render within the layout */
  children: React.ReactNode;
  /** Initially active section ID (without #) - will be overridden by scroll detection */
  initialSection?: string;
  /** Callback when a section is navigated to (via click or scroll) */
  onSectionChange?: (sectionId: string) => void;
}

/** Section IDs for scroll-based active section detection */
const SECTION_IDS = DEFAULT_SECTIONS.map((section) => section.href.replace('#', ''));

/**
 * Base Layout component providing semantic HTML structure with proper landmarks.
 * 
 * Features:
 * - Skip link for keyboard navigation (WCAG 2.1 AA - Requirement 7.5)
 * - Semantic HTML landmarks (header, main, footer)
 * - Responsive container with Tailwind
 * - Proper heading hierarchy support (Requirement 7.4)
 * - Mobile navigation with hamburger menu (Requirement 1.3)
 * - Scroll-based active section detection (Requirement 1.5)
 * 
 * @example
 * ```tsx
 * <Layout>
 *   <AboutSection />
 *   <ExperienceSection />
 * </Layout>
 * ```
 */
export function Layout({ children, initialSection = 'about', onSectionChange }: LayoutProps) {
  // Use the useActiveSection hook for scroll-based active section detection
  const { activeSection, setActiveSection } = useActiveSection({
    sectionIds: SECTION_IDS,
    defaultSection: initialSection,
  });
  
  // Use scroll progress hook for progress indicator
  const { progress } = useScrollProgress();
  
  // Check reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // State for mobile menu open/closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  /**
   * Handle navigation - updates active section and notifies parent
   */
  const handleNavigate = useCallback((sectionId: string) => {
    // Update the active section (this temporarily disables scroll detection)
    setActiveSection(sectionId);
    
    // Notify parent component if callback provided
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  }, [setActiveSection, onSectionChange]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip link for keyboard navigation - hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
      >
        Skip to main content
      </a>

      {/* Header landmark with navigation */}
      <header
        role="banner"
        className="sticky top-0 z-40 w-full border-b border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        {/* Scroll progress indicator (Requirement 5.3) */}
        <div
          className="absolute top-0 left-0 h-0.5 bg-[var(--primary-500)] z-50"
          style={{
            width: `${progress * 100}%`,
            transition: prefersReducedMotion ? 'none' : 'width 100ms ease-out',
          }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Page scroll progress"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Site title area */}
            <div className="flex-shrink-0">
              <a 
                href="#" 
                aria-label="Daniel Kreuzhofer - Go to top of page"
                className="text-xl font-semibold text-foreground hover:text-[var(--primary-600)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded-md"
              >
                Daniel Kreuzhofer
              </a>
            </div>

            {/* Navigation component for desktop */}
            <Navigation
              sections={DEFAULT_SECTIONS}
              currentSection={activeSection}
              onNavigate={handleNavigate}
            />

            {/* Mobile menu button (Requirement 1.3) */}
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={handleMobileMenuToggle}
            />
          </div>
        </div>
      </header>

      {/* Mobile menu overlay (Requirement 1.3) */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        sections={DEFAULT_SECTIONS}
        currentSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main content landmark */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer landmark */}
      <footer
        role="contentinfo"
        className="border-t border-gray-200 bg-background"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright and attribution */}
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Daniel Kreuzhofer. All rights reserved.
            </p>

            {/* Footer navigation/links */}
            <nav aria-label="Footer navigation" className="flex gap-4">
              {/* Footer links will be added as needed */}
            </nav>
          </div>
        </div>
      </footer>

      {/* Floating contact button - persistent contact option (Requirement 8.3) */}
      <FloatingContactButton />
    </div>
  );
}

export default Layout;
