/**
 * AlignmentList Component Tests
 *
 * @see Requirements 3.3, 3.5, 4.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AlignmentList } from './AlignmentList';
import { AlignmentArea } from '@/types/fit-analysis';

describe('AlignmentList', () => {
  const mockAlignments: AlignmentArea[] = [
    {
      id: 'align-1',
      title: 'TypeScript Experience',
      description: 'Strong background in TypeScript development',
      evidence: [
        {
          type: 'project',
          title: 'Portfolio Website',
          reference: 'portfolio-site',
          excerpt: 'Built with Next.js and TypeScript',
        },
        {
          type: 'experience',
          title: 'AWS Solutions Architect',
          reference: 'aws-current',
          excerpt: 'Led TypeScript migration for internal tools',
        },
      ],
    },
    {
      id: 'align-2',
      title: 'Cloud Architecture',
      description: 'Extensive AWS experience',
      evidence: [
        {
          type: 'skill',
          title: 'AWS Certified',
          reference: 'skills',
          excerpt: 'Solutions Architect Professional certification',
        },
      ],
    },
  ];

  describe('rendering', () => {
    it('renders alignment list with items', () => {
      render(<AlignmentList items={mockAlignments} />);

      expect(screen.getByTestId('alignment-list')).toBeInTheDocument();
      expect(screen.getByText('Strong Alignment Areas (2)')).toBeInTheDocument();
    });

    it('renders all alignment items', () => {
      render(<AlignmentList items={mockAlignments} />);

      const items = screen.getAllByTestId('alignment-item');
      expect(items).toHaveLength(2);
    });

    it('renders alignment titles and descriptions', () => {
      render(<AlignmentList items={mockAlignments} />);

      expect(screen.getByText('TypeScript Experience')).toBeInTheDocument();
      expect(screen.getByText('Strong background in TypeScript development')).toBeInTheDocument();
      expect(screen.getByText('Cloud Architecture')).toBeInTheDocument();
      expect(screen.getByText('Extensive AWS experience')).toBeInTheDocument();
    });

    it('renders evidence items', () => {
      render(<AlignmentList items={mockAlignments} />);

      const evidenceItems = screen.getAllByTestId('evidence-item');
      expect(evidenceItems).toHaveLength(3);
    });

    it('renders evidence titles and excerpts', () => {
      render(<AlignmentList items={mockAlignments} />);

      expect(screen.getByText('Portfolio Website')).toBeInTheDocument();
      // Uses curly quotes from &ldquo; and &rdquo;
      expect(screen.getByText(/Built with Next\.js and TypeScript/)).toBeInTheDocument();
      expect(screen.getByText('AWS Solutions Architect')).toBeInTheDocument();
    });

    it('renders evidence type labels', () => {
      render(<AlignmentList items={mockAlignments} />);

      expect(screen.getByText('Project')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('Skill')).toBeInTheDocument();
    });

    it('renders supporting evidence count', () => {
      render(<AlignmentList items={mockAlignments} />);

      expect(screen.getByText('Supporting Evidence (2)')).toBeInTheDocument();
      expect(screen.getByText('Supporting Evidence (1)')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders empty message when no items', () => {
      render(<AlignmentList items={[]} />);

      expect(screen.getByTestId('alignment-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No specific alignment areas identified.')).toBeInTheDocument();
    });

    it('does not render list when empty', () => {
      render(<AlignmentList items={[]} />);

      expect(screen.queryByTestId('alignment-list')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper section labeling', () => {
      render(<AlignmentList items={mockAlignments} />);

      const section = screen.getByRole('region', { name: /alignment/i });
      expect(section).toBeInTheDocument();
    });

    it('uses list role for items', () => {
      render(<AlignmentList items={mockAlignments} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('renders list items', () => {
      render(<AlignmentList items={mockAlignments} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('alignment without evidence', () => {
    it('renders alignment without evidence section', () => {
      const alignmentNoEvidence: AlignmentArea[] = [
        {
          id: 'align-no-evidence',
          title: 'General Skills',
          description: 'Broad technical background',
          evidence: [],
        },
      ];

      render(<AlignmentList items={alignmentNoEvidence} />);

      expect(screen.getByText('General Skills')).toBeInTheDocument();
      expect(screen.queryByText(/Supporting Evidence/)).not.toBeInTheDocument();
    });
  });
});
