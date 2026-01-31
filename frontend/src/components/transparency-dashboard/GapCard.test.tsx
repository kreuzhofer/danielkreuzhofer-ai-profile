/**
 * GapCard Component Tests
 *
 * Tests for the GapCard component which displays an explicit gap
 * with its name, explanation, and optional alternative focus.
 *
 * @see Requirements 1.4, 4.1, 4.2, 4.6
 */

import { render, screen } from '@testing-library/react';
import { GapCard } from './GapCard';
import type { ExplicitGap } from '@/types/transparency-dashboard';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Create a mock explicit gap for testing
 */
function createMockGap(overrides?: Partial<ExplicitGap>): ExplicitGap {
  return {
    id: 'test-gap-id',
    name: 'Test Gap',
    explanation: 'Chose to focus on other areas',
    alternativeFocus: 'Alternative focus area',
    ...overrides,
  };
}

// =============================================================================
// GapCard Tests
// =============================================================================

describe('GapCard', () => {
  describe('Rendering', () => {
    it('renders gap name (Requirement 4.1)', () => {
      const gap = createMockGap({ name: 'Native Mobile Development' });
      render(<GapCard gap={gap} />);
      expect(screen.getByTestId('gap-name-test-gap-id')).toHaveTextContent(
        'Native Mobile Development'
      );
    });

    it('renders gap explanation (Requirement 4.2)', () => {
      const gap = createMockGap({
        explanation: 'Chose to focus on web and cloud architecture',
      });
      render(<GapCard gap={gap} />);
      expect(screen.getByTestId('gap-explanation-test-gap-id')).toHaveTextContent(
        'Chose to focus on web and cloud architecture'
      );
    });

    it('renders with correct data-testid', () => {
      const gap = createMockGap({ id: 'gap-blockchain' });
      render(<GapCard gap={gap} />);
      expect(screen.getByTestId('gap-card-gap-blockchain')).toBeInTheDocument();
    });

    it('renders with data-gap-id attribute', () => {
      const gap = createMockGap({ id: 'gap-mobile' });
      render(<GapCard gap={gap} />);
      expect(screen.getByTestId('gap-card-gap-mobile')).toHaveAttribute(
        'data-gap-id',
        'gap-mobile'
      );
    });
  });

  describe('Alternative Focus', () => {
    it('renders alternative focus when provided', () => {
      const gap = createMockGap({
        alternativeFocus: 'Progressive Web Apps and responsive design',
      });
      render(<GapCard gap={gap} />);
      expect(screen.getByTestId('gap-alternative-test-gap-id')).toHaveTextContent(
        'Progressive Web Apps and responsive design'
      );
    });

    it('includes "Instead:" label for alternative focus', () => {
      const gap = createMockGap({
        alternativeFocus: 'Cloud architecture',
      });
      render(<GapCard gap={gap} />);
      expect(screen.getByTestId('gap-alternative-test-gap-id')).toHaveTextContent(
        'Instead:'
      );
    });

    it('does not render alternative focus section when not provided', () => {
      const gap = createMockGap({ alternativeFocus: undefined });
      render(<GapCard gap={gap} />);
      expect(
        screen.queryByTestId('gap-alternative-test-gap-id')
      ).not.toBeInTheDocument();
    });
  });

  describe('Styling (Requirement 4.6)', () => {
    it('uses subtle slate/gray styling', () => {
      const gap = createMockGap();
      render(<GapCard gap={gap} />);
      const card = screen.getByTestId('gap-card-test-gap-id');
      // Verify subtle styling classes are applied
      expect(card.className).toContain('bg-slate-50');
      expect(card.className).toContain('border-slate-200');
    });

    it('is not a button element (non-interactive)', () => {
      const gap = createMockGap();
      render(<GapCard gap={gap} />);
      const card = screen.getByTestId('gap-card-test-gap-id');
      expect(card.tagName).toBe('DIV');
    });

    it('includes gap icon', () => {
      const gap = createMockGap();
      render(<GapCard gap={gap} />);
      const card = screen.getByTestId('gap-card-test-gap-id');
      const svg = card.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays both name and explanation together', () => {
      const gap = createMockGap({
        name: 'Blockchain/Web3',
        explanation: 'Prioritized enterprise cloud and AI technologies',
      });
      render(<GapCard gap={gap} />);

      expect(screen.getByTestId('gap-name-test-gap-id')).toHaveTextContent(
        'Blockchain/Web3'
      );
      expect(screen.getByTestId('gap-explanation-test-gap-id')).toHaveTextContent(
        'Prioritized enterprise cloud and AI technologies'
      );
    });

    it('displays all three fields when all are provided', () => {
      const gap = createMockGap({
        name: 'Native Mobile Development',
        explanation: 'Chose to focus on web and cloud architecture',
        alternativeFocus: 'Progressive Web Apps and responsive design',
      });
      render(<GapCard gap={gap} />);

      expect(screen.getByTestId('gap-name-test-gap-id')).toBeInTheDocument();
      expect(screen.getByTestId('gap-explanation-test-gap-id')).toBeInTheDocument();
      expect(screen.getByTestId('gap-alternative-test-gap-id')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading for gap name', () => {
      const gap = createMockGap();
      render(<GapCard gap={gap} />);
      const nameElement = screen.getByTestId('gap-name-test-gap-id');
      expect(nameElement.tagName).toBe('H3');
    });

    it('has aria-hidden on decorative icon', () => {
      const gap = createMockGap();
      render(<GapCard gap={gap} />);
      const card = screen.getByTestId('gap-card-test-gap-id');
      const iconContainer = card.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});
