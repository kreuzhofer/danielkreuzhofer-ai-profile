/**
 * GapList Component Tests
 *
 * @see Requirements 3.4, 4.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { GapList } from './GapList';
import { GapArea } from '@/types/fit-analysis';

describe('GapList', () => {
  const mockGaps: GapArea[] = [
    {
      id: 'gap-1',
      title: 'Machine Learning',
      description: 'No documented ML experience',
      severity: 'moderate',
    },
    {
      id: 'gap-2',
      title: 'Kubernetes',
      description: 'Limited container orchestration experience',
      severity: 'minor',
    },
    {
      id: 'gap-3',
      title: 'Team Leadership',
      description: 'No direct management experience documented',
      severity: 'significant',
    },
  ];

  describe('rendering', () => {
    it('renders gap list with items', () => {
      render(<GapList items={mockGaps} />);

      expect(screen.getByTestId('gap-list')).toBeInTheDocument();
      expect(screen.getByText('Areas to Consider (3)')).toBeInTheDocument();
    });

    it('renders all gap items', () => {
      render(<GapList items={mockGaps} />);

      const items = screen.getAllByTestId('gap-item');
      expect(items).toHaveLength(3);
    });

    it('renders gap titles and descriptions', () => {
      render(<GapList items={mockGaps} />);

      expect(screen.getByText('Machine Learning')).toBeInTheDocument();
      expect(screen.getByText('No documented ML experience')).toBeInTheDocument();
      expect(screen.getByText('Kubernetes')).toBeInTheDocument();
      expect(screen.getByText('Team Leadership')).toBeInTheDocument();
    });
  });

  describe('severity indicators', () => {
    it('renders severity badges', () => {
      render(<GapList items={mockGaps} />);

      const badges = screen.getAllByTestId('severity-badge');
      expect(badges).toHaveLength(3);
    });

    it('displays correct severity labels', () => {
      render(<GapList items={mockGaps} />);

      expect(screen.getByText('Moderate Gap')).toBeInTheDocument();
      expect(screen.getByText('Minor Gap')).toBeInTheDocument();
      expect(screen.getByText('Significant Gap')).toBeInTheDocument();
    });

    it('applies severity data attribute', () => {
      render(<GapList items={mockGaps} />);

      const items = screen.getAllByTestId('gap-item');
      const severities = items.map(item => item.getAttribute('data-severity'));
      
      // Should be sorted: significant, moderate, minor
      expect(severities).toContain('significant');
      expect(severities).toContain('moderate');
      expect(severities).toContain('minor');
    });
  });

  describe('sorting', () => {
    it('sorts gaps by severity (significant first)', () => {
      render(<GapList items={mockGaps} />);

      const items = screen.getAllByTestId('gap-item');
      
      // First item should be significant
      expect(items[0]).toHaveAttribute('data-severity', 'significant');
      // Second should be moderate
      expect(items[1]).toHaveAttribute('data-severity', 'moderate');
      // Third should be minor
      expect(items[2]).toHaveAttribute('data-severity', 'minor');
    });
  });

  describe('empty state', () => {
    it('renders empty message when no items', () => {
      render(<GapList items={[]} />);

      expect(screen.getByTestId('gap-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No significant gaps identified.')).toBeInTheDocument();
    });

    it('does not render list when empty', () => {
      render(<GapList items={[]} />);

      expect(screen.queryByTestId('gap-list')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper section labeling', () => {
      render(<GapList items={mockGaps} />);

      const section = screen.getByRole('region', { name: /areas to consider/i });
      expect(section).toBeInTheDocument();
    });

    it('uses list role for items', () => {
      render(<GapList items={mockGaps} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('renders list items', () => {
      render(<GapList items={mockGaps} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('single severity', () => {
    it('renders single minor gap correctly', () => {
      const singleGap: GapArea[] = [
        {
          id: 'gap-single',
          title: 'Minor Issue',
          description: 'Small gap',
          severity: 'minor',
        },
      ];

      render(<GapList items={singleGap} />);

      expect(screen.getByText('Areas to Consider (1)')).toBeInTheDocument();
      expect(screen.getByText('Minor Gap')).toBeInTheDocument();
    });

    it('renders single significant gap correctly', () => {
      const singleGap: GapArea[] = [
        {
          id: 'gap-single',
          title: 'Major Issue',
          description: 'Big gap',
          severity: 'significant',
        },
      ];

      render(<GapList items={singleGap} />);

      expect(screen.getByText('Significant Gap')).toBeInTheDocument();
    });
  });
});
