'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Navigation, MobileMenuButton, MobileMenu, DEFAULT_SECTIONS } from '../Navigation';
import { useScrollProgress, useReducedMotion } from '../../hooks';

interface BlogLayoutProps {
  children: React.ReactNode;
  currentSection?: string;
}

export function BlogLayout({ children, currentSection = 'blog' }: BlogLayoutProps) {
  const { progress } = useScrollProgress();
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleNavigate = useCallback(() => {
    // Navigation to anchor sections will scroll on the main page
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary-500)] focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60"
      >
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
            <div className="flex-shrink-0">
              <a
                href="/"
                aria-label="Daniel Kreuzhofer - Go to homepage"
                className="text-xl font-semibold text-[var(--foreground)] hover:text-[var(--primary-400)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)] rounded-md"
              >
                Daniel Kreuzhofer
              </a>
            </div>

            <Navigation
              sections={DEFAULT_SECTIONS}
              currentSection={currentSection}
              onNavigate={handleNavigate}
            />

            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sections={DEFAULT_SECTIONS}
        currentSection={currentSection}
        onNavigate={handleNavigate}
      />

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: prefersReducedMotion ? 'none' : 'opacity 400ms ease-out, transform 400ms ease-out',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer
        role="contentinfo"
        className="border-t border-[var(--border)] bg-[var(--background)]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-[var(--foreground-muted)]">
              &copy; {new Date().getFullYear()} Daniel Kreuzhofer. All rights reserved.
            </p>
            <nav aria-label="Footer navigation" className="flex gap-4" />
          </div>
        </div>
      </footer>
    </div>
  );
}
