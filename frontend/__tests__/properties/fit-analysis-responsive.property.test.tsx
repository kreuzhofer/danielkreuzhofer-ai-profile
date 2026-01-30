/**
 * Property Tests for Fit Analysis Responsive Behavior
 *
 * Tests Property 16 from the design document:
 * - Property 16: State Persistence Across Viewport Changes
 *
 * @see Requirements 8.4
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { InputSection } from '@/components/fit-analysis/InputSection';

// Clean up after each test
afterEach(() => {
  cleanup();
});

/**
 * Feature: fit-analysis-module, Property 16: State Persistence Across Viewport Changes
 *
 * For any Fit_Analysis_Module state (input text, current results, loading state),
 * resizing the viewport SHALL preserve all state values unchanged.
 *
 * **Validates: Requirements 8.4**
 */
describe('Property 16: State Persistence Across Viewport Changes', () => {
  describe('InputSection state persistence', () => {
    it('preserves input value across viewport changes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }),
          fc.array(fc.integer({ min: 320, max: 1920 }), { minLength: 2, maxLength: 5 }),
          (inputValue, viewportWidths) => {
            cleanup();
            const onChange = jest.fn();
            const onSubmit = jest.fn();

            const { rerender } = render(
              <InputSection
                value={inputValue}
                onChange={onChange}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            // Verify initial value
            const textarea = screen.getByTestId('job-description-textarea');
            expect(textarea).toHaveValue(inputValue);

            // Simulate viewport changes by re-rendering
            // (In a real browser, CSS would handle this, but the React state should persist)
            viewportWidths.forEach((width) => {
              // Simulate viewport change by triggering a resize event
              Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: width,
              });
              window.dispatchEvent(new Event('resize'));

              // Re-render with same props (simulating React's behavior during resize)
              rerender(
                <InputSection
                  value={inputValue}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  isDisabled={false}
                  maxLength={5000}
                  minLength={50}
                  placeholder="Test placeholder"
                />
              );

              // Value should be preserved
              expect(screen.getByTestId('job-description-textarea')).toHaveValue(
                inputValue
              );
            });

            cleanup();
            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('preserves character count across viewport changes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }),
          fc.array(fc.integer({ min: 320, max: 1920 }), { minLength: 2, maxLength: 5 }),
          (inputValue, viewportWidths) => {
            cleanup();
            const onChange = jest.fn();
            const onSubmit = jest.fn();

            const { rerender } = render(
              <InputSection
                value={inputValue}
                onChange={onChange}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            // Get initial character count
            const initialCount = screen.getByTestId('current-count').textContent;

            // Simulate viewport changes
            viewportWidths.forEach((width) => {
              Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: width,
              });
              window.dispatchEvent(new Event('resize'));

              rerender(
                <InputSection
                  value={inputValue}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  isDisabled={false}
                  maxLength={5000}
                  minLength={50}
                  placeholder="Test placeholder"
                />
              );

              // Character count should be preserved
              expect(screen.getByTestId('current-count').textContent).toBe(
                initialCount
              );
            });

            cleanup();
            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('preserves disabled state across viewport changes', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.array(fc.integer({ min: 320, max: 1920 }), { minLength: 2, maxLength: 5 }),
          (isDisabled, viewportWidths) => {
            cleanup();
            const onChange = jest.fn();
            const onSubmit = jest.fn();

            const { rerender } = render(
              <InputSection
                value="Test content with enough characters to be valid"
                onChange={onChange}
                onSubmit={onSubmit}
                isDisabled={isDisabled}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            // Simulate viewport changes
            viewportWidths.forEach((width) => {
              Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: width,
              });
              window.dispatchEvent(new Event('resize'));

              rerender(
                <InputSection
                  value="Test content with enough characters to be valid"
                  onChange={onChange}
                  onSubmit={onSubmit}
                  isDisabled={isDisabled}
                  maxLength={5000}
                  minLength={50}
                  placeholder="Test placeholder"
                />
              );

              // Disabled state should be preserved
              const textarea = screen.getByTestId('job-description-textarea');
              if (isDisabled) {
                expect(textarea).toBeDisabled();
              } else {
                expect(textarea).not.toBeDisabled();
              }
            });

            cleanup();
            return true;
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
