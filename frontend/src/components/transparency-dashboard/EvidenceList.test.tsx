/**
 * EvidenceList Component Tests
 *
 * Tests for the EvidenceList and EvidenceItem components.
 *
 * @see Requirements 3.3, 5.2, 5.3, 5.6
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EvidenceList, EvidenceItem } from './EvidenceList';
import type { Evidence } from '@/types/transparency-dashboard';

// =============================================================================
// Test Data
// =============================================================================

const createMockEvidence = (overrides?: Partial<Evidence>): Evidence => ({
  id: 'test-evidence-id',
  type: 'project',
  title: 'Test Project',
  reference: '/projects/test-project',
  excerpt: 'A test project excerpt',
  ...overrides,
});

// =============================================================================
// EvidenceItem Tests
// =============================================================================

describe('EvidenceItem', () => {
  it('renders evidence title', () => {
    const evidence = createMockEvidence({ title: 'My Project' });
    render(<EvidenceItem evidence={evidence} />);
    
    expect(screen.getByTestId(`evidence-title-${evidence.id}`)).toHaveTextContent('My Project');
  });

  it('renders evidence type label', () => {
    const evidence = createMockEvidence({ type: 'project' });
    render(<EvidenceItem evidence={evidence} />);
    
    expect(screen.getByTestId(`evidence-type-${evidence.id}`)).toHaveTextContent('Project');
  });

  it('renders experience type label', () => {
    const evidence = createMockEvidence({ type: 'experience', id: 'exp-1' });
    render(<EvidenceItem evidence={evidence} />);
    
    expect(screen.getByTestId('evidence-type-exp-1')).toHaveTextContent('Experience');
  });

  it('renders certification type label', () => {
    const evidence = createMockEvidence({ type: 'certification', id: 'cert-1' });
    render(<EvidenceItem evidence={evidence} />);
    
    expect(screen.getByTestId('evidence-type-cert-1')).toHaveTextContent('Certification');
  });

  it('renders excerpt when provided', () => {
    const evidence = createMockEvidence({ excerpt: 'This is an excerpt' });
    render(<EvidenceItem evidence={evidence} />);
    
    expect(screen.getByTestId(`evidence-excerpt-${evidence.id}`)).toHaveTextContent('This is an excerpt');
  });

  it('does not render excerpt when not provided', () => {
    const evidence = createMockEvidence({ excerpt: undefined });
    render(<EvidenceItem evidence={evidence} />);
    
    expect(screen.queryByTestId(`evidence-excerpt-${evidence.id}`)).not.toBeInTheDocument();
  });

  it('renders as a clickable link', () => {
    const evidence = createMockEvidence({ reference: '/projects/my-project' });
    render(<EvidenceItem evidence={evidence} />);
    
    const link = screen.getByTestId(`evidence-item-${evidence.id}`);
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/projects/my-project');
  });

  it('internal links do not have target="_blank" (Requirement 5.6)', () => {
    const evidence = createMockEvidence({ reference: '/projects/internal-project' });
    render(<EvidenceItem evidence={evidence} />);
    
    const link = screen.getByTestId(`evidence-item-${evidence.id}`);
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('external links have target="_blank"', () => {
    const evidence = createMockEvidence({ reference: 'https://external.com/project' });
    render(<EvidenceItem evidence={evidence} />);
    
    const link = screen.getByTestId(`evidence-item-${evidence.id}`);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders type icon', () => {
    const evidence = createMockEvidence({ type: 'project' });
    render(<EvidenceItem evidence={evidence} />);
    
    const iconContainer = screen.getByTestId(`evidence-type-icon-${evidence.id}`);
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer.querySelector('svg')).toBeInTheDocument();
  });

  it('has minimum touch target size', () => {
    const evidence = createMockEvidence();
    render(<EvidenceItem evidence={evidence} />);
    
    const link = screen.getByTestId(`evidence-item-${evidence.id}`);
    expect(link).toHaveClass('min-h-[44px]');
  });
});

// =============================================================================
// EvidenceList Tests
// =============================================================================

describe('EvidenceList', () => {
  it('renders all evidence items', () => {
    const evidence: Evidence[] = [
      createMockEvidence({ id: 'ev-1', title: 'Project 1' }),
      createMockEvidence({ id: 'ev-2', title: 'Project 2' }),
      createMockEvidence({ id: 'ev-3', title: 'Project 3' }),
    ];
    
    render(<EvidenceList evidence={evidence} />);
    
    expect(screen.getByTestId('evidence-item-ev-1')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-item-ev-2')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-item-ev-3')).toBeInTheDocument();
  });

  it('renders nothing when evidence array is empty', () => {
    const { container } = render(<EvidenceList evidence={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when evidence is undefined', () => {
    const { container } = render(<EvidenceList evidence={undefined as unknown as Evidence[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('has list role for accessibility', () => {
    const evidence = [createMockEvidence()];
    render(<EvidenceList evidence={evidence} />);
    
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    const evidence = [createMockEvidence()];
    render(<EvidenceList evidence={evidence} />);
    
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Evidence links');
  });

  it('renders list items with listitem role', () => {
    const evidence = [
      createMockEvidence({ id: 'ev-1' }),
      createMockEvidence({ id: 'ev-2' }),
    ];
    render(<EvidenceList evidence={evidence} />);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });

  it('applies custom className', () => {
    const evidence = [createMockEvidence()];
    render(<EvidenceList evidence={evidence} className="custom-class" />);
    
    expect(screen.getByTestId('evidence-list')).toHaveClass('custom-class');
  });

  it('renders mixed evidence types', () => {
    const evidence: Evidence[] = [
      createMockEvidence({ id: 'proj-1', type: 'project', title: 'Project' }),
      createMockEvidence({ id: 'exp-1', type: 'experience', title: 'Experience' }),
      createMockEvidence({ id: 'cert-1', type: 'certification', title: 'Certification' }),
    ];
    
    render(<EvidenceList evidence={evidence} />);
    
    expect(screen.getByTestId('evidence-type-proj-1')).toHaveTextContent('Project');
    expect(screen.getByTestId('evidence-type-exp-1')).toHaveTextContent('Experience');
    expect(screen.getByTestId('evidence-type-cert-1')).toHaveTextContent('Certification');
  });
});
