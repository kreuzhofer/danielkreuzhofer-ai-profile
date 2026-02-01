'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { useScrollAnimation, useReducedMotion } from '@/hooks';

/**
 * Card component props
 */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Card content */
  children: React.ReactNode;
  /** Whether to apply hover lift effect */
  hoverable?: boolean;
  /** Whether to animate on scroll into view */
  animateOnScroll?: boolean;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get variant-specific classes
 */
function getVariantClasses(variant: CardProps['variant']): string {
  switch (variant) {
    case 'default':
      return 'bg-[var(--surface)]';
    case 'outlined':
      return 'bg-transparent border border-[var(--border)]';
    case 'elevated':
      return 'bg-[var(--surface-elevated)] shadow-lg';
    default:
      return 'bg-[var(--surface)]';
  }
}

/**
 * Enhanced Card component with hover effects and scroll animations.
 *
 * Features:
 * - Multiple variants: default, outlined, elevated
 * - Hoverable prop for lift effect with shadow enhancement
 * - Integrates useScrollAnimation for animateOnScroll prop
 * - Applies CSS containment for performance
 * - Respects reduced motion preference
 *
 * @example
 * ```tsx
 * <Card variant="elevated" hoverable>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    children,
    hoverable = true,
    animateOnScroll = true,
    variant = 'default',
    className = '',
    ...rest
  },
  forwardedRef
) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: scrollRef, animationStyle } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
    respectReducedMotion: true,
  });

  // Base classes
  const baseClasses = [
    'rounded-lg p-6',
    'contain-layout contain-paint', // CSS containment for performance
  ].join(' ');

  // Hover classes (only if hoverable and not reduced motion)
  const hoverClasses =
    hoverable && !prefersReducedMotion
      ? 'transition-all duration-200 ease-out hover:shadow-[var(--shadow-hover)] hover:-translate-y-1'
      : '';

  // Combine all classes
  const combinedClasses = [
    baseClasses,
    getVariantClasses(variant),
    hoverClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Combine refs if animateOnScroll is enabled
  const handleRef = (node: HTMLDivElement | null) => {
    // Call the scroll animation ref
    if (animateOnScroll) {
      scrollRef(node);
    }
    // Call the forwarded ref
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <div
      ref={handleRef}
      className={combinedClasses}
      style={animateOnScroll ? animationStyle : undefined}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
