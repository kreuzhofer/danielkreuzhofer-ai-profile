'use client';

import React from 'react';
import Link from 'next/link';

/**
 * PageHeader component - consistent header for standalone pages
 * 
 * Features:
 * - Site name/logo linking back to home
 * - Consistent styling with main Layout header
 * - Sticky positioning with backdrop blur
 */
export function PageHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Site title */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-semibold text-foreground hover:text-[var(--primary-600)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded-md"
            >
              Daniel Kreuzhofer
            </Link>
          </div>

          {/* Back link */}
          <nav>
            <Link
              href="/"
              className="text-sm text-[var(--neutral-600)] hover:text-[var(--primary-600)] transition-colors"
            >
              ← Back to Portfolio
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
