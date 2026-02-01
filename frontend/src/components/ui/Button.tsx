'use client';

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { useReducedMotion } from '@/hooks';

/**
 * Button component props
 */
export interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is full width */
  fullWidth?: boolean;
  /** Link href (renders as anchor) */
  href?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

type ButtonElementProps = ButtonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>;
type AnchorElementProps = ButtonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>;

/**
 * Get variant-specific classes
 */
function getVariantClasses(variant: ButtonProps['variant']): string {
  switch (variant) {
    case 'primary':
      return 'bg-[var(--primary-500)] text-white hover:bg-[var(--primary-400)] focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]';
    case 'secondary':
      return 'bg-[var(--secondary-500)] text-white hover:bg-[var(--secondary-400)] focus:ring-[var(--secondary-500)] focus:ring-offset-[var(--background)]';
    case 'outline':
      return 'border-2 border-[var(--primary-500)] text-[var(--primary-400)] hover:bg-[var(--primary-500)]/20 focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]';
    case 'ghost':
      return 'text-[var(--primary-400)] hover:bg-[var(--primary-500)]/20 focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]';
    default:
      return 'bg-[var(--primary-500)] text-white hover:bg-[var(--primary-400)] focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]';
  }
}

/**
 * Get size-specific classes
 */
function getSizeClasses(size: ButtonProps['size']): string {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm min-h-[36px]';
    case 'md':
      return 'px-4 py-2 text-base min-h-[44px]';
    case 'lg':
      return 'px-6 py-3 text-lg min-h-[52px]';
    default:
      return 'px-4 py-2 text-base min-h-[44px]';
  }
}

/**
 * Enhanced Button component with variants, sizes, and hover effects.
 *
 * Features:
 * - Multiple variants: primary (teal), secondary (amber), outline, ghost
 * - Multiple sizes: sm, md, lg with appropriate padding and font sizes
 * - Hover transitions with color/scale feedback
 * - Supports both button and anchor rendering via href prop
 * - Maintains 44px minimum touch target
 * - Respects reduced motion for transitions
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" href="/about">Learn More</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonElementProps | AnchorElementProps>(
  function Button(props, ref) {
    const {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      href,
      className = '',
      disabled = false,
      ...rest
    } = props;

    const prefersReducedMotion = useReducedMotion();

    // Base classes
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      prefersReducedMotion
        ? ''
        : 'transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]',
    ].join(' ');

    // Combine all classes
    const combinedClasses = [
      baseClasses,
      getVariantClasses(variant),
      getSizeClasses(size),
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Render as anchor if href is provided
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClasses}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    // Render as button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        className={combinedClasses}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
