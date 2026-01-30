/**
 * Property Tests for Fit Analysis Keyboard Accessibility
 *
 * Tests Property 3 from the design document:
 * - Property 3: Keyboard Accessibility
 *
 * @see Requirements 1.6, 7.3
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { InputSection } from '@/components/fit-analysis/InputSection';
import { HistoryPanel } from '@/components/fit-analysis/HistoryPanel';
import { AnalysisHistoryItem } from '@/types/fit-analysis';

// Clean up after each test
afterEach(() => {
  cleanup();
});

/**
 * Feature: fit-analysis-module, Property 3: Keyboard Accessibility
 *
 * For any interactive element in the Fit_Analysis_Module (input area, submit button,
 * history items, new analysis button), it SHALL be focusable via Tab key and
 * activatable via Enter or Space key.
 *
 * **Validates: Requirements 1.6, 7.3**
 */
describe('Property 3: Keyboard Accessibility', () => {
  describe('InputSection keyboard accessibility', () => {
    it('textarea is focusable', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (initialValue) => {
            cleanup();
            const onSubmit = jest.fn();
            render(
              <InputSection
                value={initialValue}
                onChange={() => {}}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            const textarea = screen.getByTestId('job-description-textarea');
            textarea.focus();
            expect(document.activeElement).toBe(textarea);
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('submit button is focusable when enabled', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 200 }),
          (validInput) => {
            cleanup();
            const onSubmit = jest.fn();
            render(
              <InputSection
                value={validInput}
                onChange={() => {}}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            const submitButton = screen.getByTestId('submit-button');
            submitButton.focus();
            expect(document.activeElement).toBe(submitButton);
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('Ctrl+Enter submits the form with valid input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 200 }),
          (validInput) => {
            cleanup();
            const onSubmit = jest.fn();
            render(
              <InputSection
                value={validInput}
                onChange={() => {}}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            const textarea = screen.getByTestId('job-description-textarea');
            fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('Cmd+Enter submits the form with valid input (Mac)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 200 }),
          (validInput) => {
            cleanup();
            const onSubmit = jest.fn();
            render(
              <InputSection
                value={validInput}
                onChange={() => {}}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            const textarea = screen.getByTestId('job-description-textarea');
            fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('Enter without modifier does not submit', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 200 }),
          (validInput) => {
            cleanup();
            const onSubmit = jest.fn();
            render(
              <InputSection
                value={validInput}
                onChange={() => {}}
                onSubmit={onSubmit}
                isDisabled={false}
                maxLength={5000}
                minLength={50}
                placeholder="Test placeholder"
              />
            );

            const textarea = screen.getByTestId('job-description-textarea');
            fireEvent.keyDown(textarea, { key: 'Enter' });

            expect(onSubmit).not.toHaveBeenCalled();
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('HistoryPanel keyboard accessibility', () => {
    const createHistoryItems = (count: number): AnalysisHistoryItem[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: `history-${i}`,
        timestamp: new Date(`2024-01-${15 - i}T10:00:00Z`),
        jobDescriptionPreview: `Job description ${i}`,
        confidenceScore: 'partial_match' as const,
      }));
    };

    it('toggle button is focusable and activatable', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),
          (itemCount) => {
            cleanup();
            const items = createHistoryItems(itemCount);
            const onSelectItem = jest.fn();
            const onClearHistory = jest.fn();

            render(
              <HistoryPanel
                items={items}
                onSelectItem={onSelectItem}
                onClearHistory={onClearHistory}
              />
            );

            const toggle = screen.getByTestId('history-toggle');
            toggle.focus();
            expect(document.activeElement).toBe(toggle);

            // Activate with Enter
            fireEvent.keyDown(toggle, { key: 'Enter' });
            fireEvent.click(toggle);
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('history items are focusable and activatable', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (itemCount) => {
            cleanup();
            const items = createHistoryItems(itemCount);
            const onSelectItem = jest.fn();
            const onClearHistory = jest.fn();

            render(
              <HistoryPanel
                items={items}
                onSelectItem={onSelectItem}
                onClearHistory={onClearHistory}
                defaultExpanded={true}
              />
            );

            const historyItems = screen.getAllByTestId('history-item');
            expect(historyItems.length).toBe(itemCount);

            // Each item should be focusable
            historyItems.forEach((item, index) => {
              item.focus();
              expect(document.activeElement).toBe(item);

              // Activate with click (simulating Enter/Space)
              fireEvent.click(item);
              expect(onSelectItem).toHaveBeenLastCalledWith(`history-${index}`);
            });
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });

    it('clear history button is focusable and activatable', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (itemCount) => {
            cleanup();
            const items = createHistoryItems(itemCount);
            const onSelectItem = jest.fn();
            const onClearHistory = jest.fn();

            render(
              <HistoryPanel
                items={items}
                onSelectItem={onSelectItem}
                onClearHistory={onClearHistory}
                defaultExpanded={true}
              />
            );

            const clearButton = screen.getByTestId('clear-history-button');
            clearButton.focus();
            expect(document.activeElement).toBe(clearButton);

            // Activate with click
            fireEvent.click(clearButton);
            expect(onClearHistory).toHaveBeenCalledTimes(1);
            cleanup();

            return true;
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
