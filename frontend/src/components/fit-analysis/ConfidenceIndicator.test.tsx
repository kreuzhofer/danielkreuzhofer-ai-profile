/**
 * ConfidenceIndicator Component Tests
 *
 * Tests for the ConfidenceIndicator component that displays confidence levels
 * with icon, label, and color (not color-only).
 *
 * @see Requirements 3.2, 7.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { ConfidenceLevel, CONFIDENCE_DISPLAY } from '@/types/fit-analysis';

describe('ConfidenceIndicator', () => {
  const confidenceLevels: ConfidenceLevel[] = [
    'strong_match',
    'partial_match',
    'limited_match',
  ];

  describe('rendering', () => {
    it.each(confidenceLevels)(
      'renders correctly for %s confidence level',
      (level) => {
        const ariaLabel = `Overall fit: ${CONFIDENCE_DISPLAY[level].label}`;

        render(<ConfidenceIndicator level={level} ariaLabel={ariaLabel} />);

        // Should render the container
        const container = screen.getByTestId('confidence-indicator');
        expect(container).toBeInTheDocument();

        // Should have the correct aria-label
        expect(container).toHaveAttribute('aria-label', ariaLabel);

        // Should have role="status" for accessibility
        expect(container).toHaveAttribute('role', 'status');
      }
    );
  });

  describe('label display (Requirement 7.5 - not color-only)', () => {
    it.each(confidenceLevels)(
      'displays text label for %s confidence level',
      (level) => {
        render(
          <ConfidenceIndicator
            level={level}
            ariaLabel={`Confidence: ${level}`}
          />
        );

        const label = screen.getByTestId('confidence-label');
        expect(label).toBeInTheDocument();
        expect(label).toHaveTextContent(CONFIDENCE_DISPLAY[level].label);
      }
    );

    it('displays "Strong Match" label for strong_match', () => {
      render(
        <ConfidenceIndicator
          level="strong_match"
          ariaLabel="Confidence level"
        />
      );

      expect(screen.getByTestId('confidence-label')).toHaveTextContent(
        'Strong Match'
      );
    });

    it('displays "Partial Match" label for partial_match', () => {
      render(
        <ConfidenceIndicator
          level="partial_match"
          ariaLabel="Confidence level"
        />
      );

      expect(screen.getByTestId('confidence-label')).toHaveTextContent(
        'Partial Match'
      );
    });

    it('displays "Limited Match" label for limited_match', () => {
      render(
        <ConfidenceIndicator
          level="limited_match"
          ariaLabel="Confidence level"
        />
      );

      expect(screen.getByTestId('confidence-label')).toHaveTextContent(
        'Limited Match'
      );
    });
  });

  describe('icon display (Requirement 7.5 - not color-only)', () => {
    it.each(confidenceLevels)(
      'displays an icon for %s confidence level',
      (level) => {
        render(
          <ConfidenceIndicator
            level={level}
            ariaLabel={`Confidence: ${level}`}
          />
        );

        const iconContainer = screen.getByTestId('confidence-icon');
        expect(iconContainer).toBeInTheDocument();

        // Icon should contain an SVG
        const svg = iconContainer.querySelector('svg');
        expect(svg).toBeInTheDocument();

        // SVG should be hidden from screen readers (aria-hidden)
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      }
    );
  });

  describe('description display', () => {
    it.each(confidenceLevels)(
      'displays description for %s confidence level',
      (level) => {
        render(
          <ConfidenceIndicator
            level={level}
            ariaLabel={`Confidence: ${level}`}
          />
        );

        const description = screen.getByTestId('confidence-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
          CONFIDENCE_DISPLAY[level].description
        );
      }
    );

    it('displays correct description for strong_match', () => {
      render(
        <ConfidenceIndicator
          level="strong_match"
          ariaLabel="Confidence level"
        />
      );

      expect(screen.getByTestId('confidence-description')).toHaveTextContent(
        'Experience aligns well with most key requirements'
      );
    });

    it('displays correct description for partial_match', () => {
      render(
        <ConfidenceIndicator
          level="partial_match"
          ariaLabel="Confidence level"
        />
      );

      expect(screen.getByTestId('confidence-description')).toHaveTextContent(
        'Some alignment with notable gaps to consider'
      );
    });

    it('displays correct description for limited_match', () => {
      render(
        <ConfidenceIndicator
          level="limited_match"
          ariaLabel="Confidence level"
        />
      );

      expect(screen.getByTestId('confidence-description')).toHaveTextContent(
        'Significant gaps between requirements and experience'
      );
    });
  });

  describe('accessibility', () => {
    it('has role="status" for screen reader announcements', () => {
      render(
        <ConfidenceIndicator
          level="strong_match"
          ariaLabel="Overall fit assessment"
        />
      );

      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveAttribute('role', 'status');
    });

    it('uses the provided ariaLabel', () => {
      const customAriaLabel = 'Custom accessibility label for confidence';

      render(
        <ConfidenceIndicator
          level="partial_match"
          ariaLabel={customAriaLabel}
        />
      );

      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveAttribute('aria-label', customAriaLabel);
    });

    it('icons are hidden from screen readers', () => {
      render(
        <ConfidenceIndicator
          level="limited_match"
          ariaLabel="Confidence level"
        />
      );

      const iconContainer = screen.getByTestId('confidence-icon');
      const svg = iconContainer.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('visual styling', () => {
    it('applies green styling for strong_match', () => {
      render(
        <ConfidenceIndicator
          level="strong_match"
          ariaLabel="Confidence level"
        />
      );

      const container = screen.getByTestId('confidence-indicator');
      expect(container.className).toContain('bg-green');
      expect(container.className).toContain('border-green');

      const label = screen.getByTestId('confidence-label');
      expect(label.className).toContain('text-green');
    });

    it('applies yellow styling for partial_match', () => {
      render(
        <ConfidenceIndicator
          level="partial_match"
          ariaLabel="Confidence level"
        />
      );

      const container = screen.getByTestId('confidence-indicator');
      expect(container.className).toContain('bg-yellow');
      expect(container.className).toContain('border-yellow');

      const label = screen.getByTestId('confidence-label');
      expect(label.className).toContain('text-yellow');
    });

    it('applies red styling for limited_match', () => {
      render(
        <ConfidenceIndicator
          level="limited_match"
          ariaLabel="Confidence level"
        />
      );

      const container = screen.getByTestId('confidence-indicator');
      expect(container.className).toContain('bg-red');
      expect(container.className).toContain('border-red');

      const label = screen.getByTestId('confidence-label');
      expect(label.className).toContain('text-red');
    });
  });

  describe('not color-only requirement (Requirement 7.5)', () => {
    it.each(confidenceLevels)(
      'provides both icon AND text label for %s (not relying solely on color)',
      (level) => {
        render(
          <ConfidenceIndicator
            level={level}
            ariaLabel={`Confidence: ${level}`}
          />
        );

        // Must have an icon
        const iconContainer = screen.getByTestId('confidence-icon');
        expect(iconContainer).toBeInTheDocument();
        expect(iconContainer.querySelector('svg')).toBeInTheDocument();

        // Must have a text label
        const label = screen.getByTestId('confidence-label');
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBeTruthy();
        expect(label.textContent!.length).toBeGreaterThan(0);

        // Must have a description
        const description = screen.getByTestId('confidence-description');
        expect(description).toBeInTheDocument();
        expect(description.textContent).toBeTruthy();
      }
    );
  });
});
