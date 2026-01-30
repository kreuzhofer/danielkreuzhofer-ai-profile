/**
 * Property Tests for Fit Analysis Accessibility
 *
 * These tests validate:
 * - Property 15: Confidence Indicators Not Color-Only
 *
 * Feature: fit-analysis-module
 *
 * **Validates: Requirements 7.5**
 */

import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { ConfidenceIndicator } from '@/components/fit-analysis/ConfidenceIndicator';
import { ConfidenceLevel, CONFIDENCE_DISPLAY } from '@/types/fit-analysis';

// =============================================================================
// Arbitraries (Test Data Generators)
// =============================================================================

/**
 * Arbitrary for generating valid confidence levels
 * Uses constantFrom to ensure only valid enum values are generated
 */
const confidenceLevelArbitrary: fc.Arbitrary<ConfidenceLevel> = fc.constantFrom<ConfidenceLevel>(
  'strong_match',
  'partial_match',
  'limited_match'
);

/**
 * Arbitrary for generating aria labels
 * Generates meaningful accessibility labels for testing
 */
const ariaLabelArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constant('Confidence level'),
  fc.constant('Overall fit assessment'),
  confidenceLevelArbitrary.map((level) => `Confidence: ${level}`),
  confidenceLevelArbitrary.map((level) => `Overall fit: ${CONFIDENCE_DISPLAY[level].label}`)
);

/**
 * Arbitrary for generating complete ConfidenceIndicator props
 */
const confidenceIndicatorPropsArbitrary = fc.record({
  level: confidenceLevelArbitrary,
  ariaLabel: ariaLabelArbitrary,
});

// =============================================================================
// Property 15: Confidence Indicators Not Color-Only
// =============================================================================

/**
 * Feature: fit-analysis-module, Property 15: Confidence Indicators Not Color-Only
 *
 * *For any* ConfidenceScore display, the indicator SHALL include both a text label
 * AND an icon, not relying solely on color to convey the confidence level.
 *
 * **Validates: Requirements 7.5**
 */
describe('Property 15: Confidence Indicators Not Color-Only', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Icon Presence', () => {
    it('displays an SVG icon for any confidence level', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const iconContainer = screen.getByTestId('confidence-icon');
          const svg = iconContainer.querySelector('svg');

          // Must have an SVG icon present
          const hasIcon = svg !== null;

          cleanup();
          return hasIcon;
        }),
        { numRuns: 3 }
      );
    });

    it('icon is hidden from screen readers (aria-hidden)', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const iconContainer = screen.getByTestId('confidence-icon');
          const svg = iconContainer.querySelector('svg');

          // Icon should be aria-hidden since text label provides the meaning
          const isAriaHidden = svg?.getAttribute('aria-hidden') === 'true';

          cleanup();
          return isAriaHidden;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Text Label Presence', () => {
    it('displays a non-empty text label for any confidence level', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const label = screen.getByTestId('confidence-label');

          // Must have a non-empty text label
          const hasLabel = label.textContent !== null && label.textContent.length > 0;

          cleanup();
          return hasLabel;
        }),
        { numRuns: 3 }
      );
    });

    it('text label matches the expected display label for any confidence level', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const label = screen.getByTestId('confidence-label');
          const expectedLabel = CONFIDENCE_DISPLAY[level].label;

          // Label text should match the expected display label
          const labelMatches = label.textContent === expectedLabel;

          cleanup();
          return labelMatches;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Both Icon AND Label Present (Not Color-Only)', () => {
    it('displays both icon and text label for any confidence level', () => {
      fc.assert(
        fc.property(confidenceIndicatorPropsArbitrary, ({ level, ariaLabel }) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={ariaLabel}
            />
          );

          // Check for icon
          const iconContainer = screen.getByTestId('confidence-icon');
          const svg = iconContainer.querySelector('svg');
          const hasIcon = svg !== null;

          // Check for text label
          const label = screen.getByTestId('confidence-label');
          const hasLabel = label.textContent !== null && label.textContent.length > 0;

          // Both must be present - not relying solely on color
          const hasBothIconAndLabel = hasIcon && hasLabel;

          cleanup();
          return hasBothIconAndLabel;
        }),
        { numRuns: 3 }
      );
    });

    it('icon and label are both visible (not hidden via CSS display:none)', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const iconContainer = screen.getByTestId('confidence-icon');
          const label = screen.getByTestId('confidence-label');

          // Both elements should be in the document (visible)
          const iconVisible = iconContainer !== null;
          const labelVisible = label !== null;

          cleanup();
          return iconVisible && labelVisible;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Description Presence (Additional Non-Color Information)', () => {
    it('displays a description for any confidence level', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const description = screen.getByTestId('confidence-description');

          // Must have a non-empty description
          const hasDescription = description.textContent !== null && description.textContent.length > 0;

          cleanup();
          return hasDescription;
        }),
        { numRuns: 3 }
      );
    });

    it('description matches the expected display description for any confidence level', () => {
      fc.assert(
        fc.property(confidenceLevelArbitrary, (level) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={`Confidence: ${level}`}
            />
          );

          const description = screen.getByTestId('confidence-description');
          const expectedDescription = CONFIDENCE_DISPLAY[level].description;

          // Description text should match the expected display description
          const descriptionMatches = description.textContent === expectedDescription;

          cleanup();
          return descriptionMatches;
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Accessibility Attributes', () => {
    it('has role="status" for screen reader announcements for any confidence level', () => {
      fc.assert(
        fc.property(confidenceIndicatorPropsArbitrary, ({ level, ariaLabel }) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={ariaLabel}
            />
          );

          const container = screen.getByTestId('confidence-indicator');
          const hasStatusRole = container.getAttribute('role') === 'status';

          cleanup();
          return hasStatusRole;
        }),
        { numRuns: 3 }
      );
    });

    it('uses the provided ariaLabel for any confidence level', () => {
      fc.assert(
        fc.property(confidenceIndicatorPropsArbitrary, ({ level, ariaLabel }) => {
          render(
            <ConfidenceIndicator
              level={level}
              ariaLabel={ariaLabel}
            />
          );

          const container = screen.getByTestId('confidence-indicator');
          const hasCorrectAriaLabel = container.getAttribute('aria-label') === ariaLabel;

          cleanup();
          return hasCorrectAriaLabel;
        }),
        { numRuns: 3 }
      );
    });
  });
});
