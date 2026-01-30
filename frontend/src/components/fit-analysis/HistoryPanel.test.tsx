/**
 * HistoryPanel Component Tests
 *
 * @see Requirements 5.2, 5.3, 5.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryPanel } from './HistoryPanel';
import { AnalysisHistoryItem } from '@/types/fit-analysis';

describe('HistoryPanel', () => {
  const mockItems: AnalysisHistoryItem[] = [
    {
      id: 'history-1',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      jobDescriptionPreview: 'Senior Software Engineer at Tech Company looking for...',
      confidenceScore: 'strong_match',
    },
    {
      id: 'history-2',
      timestamp: new Date('2024-01-14T14:00:00Z'),
      jobDescriptionPreview: 'Machine Learning Engineer with 5+ years experience...',
      confidenceScore: 'partial_match',
    },
    {
      id: 'history-3',
      timestamp: new Date('2024-01-13T09:00:00Z'),
      jobDescriptionPreview: 'Data Scientist specializing in NLP and deep learning...',
      confidenceScore: 'limited_match',
    },
  ];

  const mockOnSelectItem = jest.fn();
  const mockOnClearHistory = jest.fn();

  beforeEach(() => {
    mockOnSelectItem.mockClear();
    mockOnClearHistory.mockClear();
  });

  describe('rendering', () => {
    it('renders history panel', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      expect(screen.getByTestId('history-panel')).toBeInTheDocument();
    });

    it('renders toggle button with count', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      expect(screen.getByTestId('history-toggle')).toBeInTheDocument();
      expect(screen.getByText(/Recent Analyses \(3\/5\)/)).toBeInTheDocument();
    });

    it('is collapsed by default', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      expect(screen.queryByTestId('history-content')).not.toBeInTheDocument();
    });

    it('can be expanded by default', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      expect(screen.getByTestId('history-content')).toBeInTheDocument();
    });
  });

  describe('toggle behavior', () => {
    it('expands when toggle is clicked', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      fireEvent.click(screen.getByTestId('history-toggle'));
      expect(screen.getByTestId('history-content')).toBeInTheDocument();
    });

    it('collapses when toggle is clicked again', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      fireEvent.click(screen.getByTestId('history-toggle'));
      expect(screen.queryByTestId('history-content')).not.toBeInTheDocument();
    });

    it('has correct aria-expanded attribute', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      const toggle = screen.getByTestId('history-toggle');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('history items', () => {
    it('renders all history items when expanded', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      const items = screen.getAllByTestId('history-item');
      expect(items).toHaveLength(3);
    });

    it('displays job description preview', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      expect(screen.getByText(/Senior Software Engineer/)).toBeInTheDocument();
      expect(screen.getByText(/Machine Learning Engineer/)).toBeInTheDocument();
    });

    it('displays confidence badges', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      const badges = screen.getAllByTestId('history-item-confidence');
      expect(badges).toHaveLength(3);

      expect(screen.getByText('Strong Match')).toBeInTheDocument();
      expect(screen.getByText('Partial Match')).toBeInTheDocument();
      expect(screen.getByText('Limited Match')).toBeInTheDocument();
    });

    it('calls onSelectItem when item is clicked', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      const items = screen.getAllByTestId('history-item');
      fireEvent.click(items[0]);

      expect(mockOnSelectItem).toHaveBeenCalledWith('history-1');
    });
  });

  describe('clear history', () => {
    it('renders clear history button when expanded with items', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      expect(screen.getByTestId('clear-history-button')).toBeInTheDocument();
    });

    it('calls onClearHistory when clear button is clicked', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      fireEvent.click(screen.getByTestId('clear-history-button'));
      expect(mockOnClearHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('renders empty message when no items', () => {
      render(
        <HistoryPanel
          items={[]}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      expect(screen.getByTestId('history-empty')).toBeInTheDocument();
      expect(screen.getByText(/No previous analyses yet/)).toBeInTheDocument();
    });

    it('does not render clear button when empty', () => {
      render(
        <HistoryPanel
          items={[]}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      expect(screen.queryByTestId('clear-history-button')).not.toBeInTheDocument();
    });

    it('shows 0/5 count when empty', () => {
      render(
        <HistoryPanel
          items={[]}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      expect(screen.getByText(/Recent Analyses \(0\/5\)/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('toggle has aria-controls attribute', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      expect(screen.getByTestId('history-toggle')).toHaveAttribute(
        'aria-controls',
        'history-content'
      );
    });

    it('history items have aria-label', () => {
      render(
        <HistoryPanel
          items={mockItems}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
          defaultExpanded={true}
        />
      );

      const items = screen.getAllByTestId('history-item');
      items.forEach((item) => {
        expect(item).toHaveAttribute('aria-label');
      });
    });
  });
});
