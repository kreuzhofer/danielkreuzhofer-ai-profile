/**
 * SkillDetailPanel Component Tests
 *
 * Tests for the SkillDetailPanel component which displays detailed
 * information about a selected skill including full context and evidence links.
 *
 * @see Requirements 3.1, 3.2, 3.4, 3.5, 3.6, 6.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SkillDetailPanel, LiveRegion } from './SkillDetailPanel';
import type { Skill, Evidence } from '@/types/transparency-dashboard';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Create a mock skill for testing
 */
function createMockSkill(overrides?: Partial<Skill>): Skill {
  return {
    id: 'test-skill-id',
    name: 'Test Skill',
    tier: 'core_strength',
    context: 'This is the full context description for the test skill. It provides detailed information about the expertise level and experience.',
    yearsOfExperience: 5,
    category: 'test-category',
    evidence: [
      {
        id: 'evidence-1',
        type: 'project',
        title: 'Test Project',
        reference: '/projects/test-project',
        excerpt: 'A sample project demonstrating this skill.',
      },
      {
        id: 'evidence-2',
        type: 'experience',
        title: 'Work Experience',
        reference: '/experience/work',
      },
    ],
    ...overrides,
  };
}

/**
 * Create a mock evidence item for testing
 */
function createMockEvidence(overrides?: Partial<Evidence>): Evidence {
  return {
    id: 'test-evidence-id',
    type: 'project',
    title: 'Test Evidence',
    reference: '/test/reference',
    ...overrides,
  };
}

// =============================================================================
// SkillDetailPanel Tests
// =============================================================================

describe('SkillDetailPanel', () => {
  const defaultProps = {
    skill: createMockSkill(),
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-panel')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<SkillDetailPanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('skill-detail-panel')).not.toBeInTheDocument();
    });

    it('renders skill name in header', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-name')).toHaveTextContent('Test Skill');
    });

    it('renders tier badge', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('tier-indicator')).toBeInTheDocument();
    });

    it('renders with correct data-skill-id attribute', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-panel')).toHaveAttribute(
        'data-skill-id',
        'test-skill-id'
      );
    });
  });

  describe('Full Context Description (Requirement 3.2)', () => {
    it('displays full context description', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-context')).toHaveTextContent(
        'This is the full context description for the test skill.'
      );
    });

    it('displays context heading', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-context-heading')).toHaveTextContent('Context');
    });
  });

  describe('Evidence Links (Requirement 3.2)', () => {
    it('displays all evidence links', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('evidence-item-evidence-1')).toBeInTheDocument();
      expect(screen.getByTestId('evidence-item-evidence-2')).toBeInTheDocument();
    });

    it('displays evidence count in heading', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-evidence-heading')).toHaveTextContent('Evidence (2)');
    });

    it('displays evidence titles', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('evidence-title-evidence-1')).toHaveTextContent('Test Project');
      expect(screen.getByTestId('evidence-title-evidence-2')).toHaveTextContent('Work Experience');
    });

    it('displays evidence type labels', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('evidence-type-evidence-1')).toHaveTextContent('Project');
      expect(screen.getByTestId('evidence-type-evidence-2')).toHaveTextContent('Experience');
    });

    it('displays evidence excerpt when available', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('evidence-excerpt-evidence-1')).toHaveTextContent(
        'A sample project demonstrating this skill.'
      );
    });

    it('does not display excerpt when not available', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.queryByTestId('evidence-excerpt-evidence-2')).not.toBeInTheDocument();
    });

    it('does not display evidence section when evidence array is empty', () => {
      const skill = createMockSkill({ evidence: [] });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.queryByTestId('skill-detail-evidence-section')).not.toBeInTheDocument();
    });

    it('displays "Learning in progress" message for working_knowledge without evidence', () => {
      const skill = createMockSkill({ tier: 'working_knowledge', evidence: [] });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('skill-detail-no-evidence')).toHaveTextContent(
        'Learning in progress'
      );
    });
  });

  describe('Evidence Link Behavior (Requirement 5.6)', () => {
    it('internal links do not have target="_blank"', () => {
      const skill = createMockSkill({
        evidence: [
          {
            id: 'internal-evidence',
            type: 'project',
            title: 'Internal Project',
            reference: '/projects/internal',
          },
        ],
      });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      const link = screen.getByTestId('evidence-item-internal-evidence');
      expect(link).not.toHaveAttribute('target', '_blank');
    });

    it('external links have target="_blank"', () => {
      const skill = createMockSkill({
        evidence: [
          {
            id: 'external-evidence',
            type: 'certification',
            title: 'External Cert',
            reference: 'https://example.com/cert',
          },
        ],
      });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      const link = screen.getByTestId('evidence-item-external-evidence');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Years of Experience', () => {
    it('displays years of experience when available', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-years')).toBeInTheDocument();
      expect(screen.getByTestId('years-indicator')).toHaveTextContent('5 years');
    });

    it('does not display years when undefined', () => {
      const skill = createMockSkill({ yearsOfExperience: undefined });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.queryByTestId('skill-detail-years')).not.toBeInTheDocument();
    });

    it('does not display years when 0', () => {
      const skill = createMockSkill({ yearsOfExperience: 0 });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.queryByTestId('skill-detail-years')).not.toBeInTheDocument();
    });
  });

  describe('Close Button Dismissal (Requirement 3.4)', () => {
    it('renders close button', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-close-button')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<SkillDetailPanel {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('skill-detail-close-button'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('close button has aria-label', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-close-button')).toHaveAttribute(
        'aria-label',
        'Close'
      );
    });

    it('close button has minimum touch target size', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      const closeButton = screen.getByTestId('skill-detail-close-button');
      expect(closeButton.className).toContain('min-w-[44px]');
      expect(closeButton.className).toContain('min-h-[44px]');
    });
  });

  describe('Escape Key Dismissal (Requirement 3.4)', () => {
    it('calls onClose when Escape key is pressed', () => {
      const onClose = jest.fn();
      render(<SkillDetailPanel {...defaultProps} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other keys', () => {
      const onClose = jest.fn();
      render(<SkillDetailPanel {...defaultProps} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Click Outside Dismissal (Requirement 3.4)', () => {
    it('calls onClose when clicking the backdrop', () => {
      const onClose = jest.fn();
      render(<SkillDetailPanel {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('skill-detail-panel-backdrop'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the panel', () => {
      const onClose = jest.fn();
      render(<SkillDetailPanel {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByTestId('skill-detail-panel'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Background Scroll Prevention (Requirement 3.5)', () => {
    it('sets body overflow to hidden when open', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow when closed', () => {
      const { rerender } = render(<SkillDetailPanel {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<SkillDetailPanel {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body overflow on unmount', () => {
      const { unmount } = render(<SkillDetailPanel {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-panel-backdrop')).toHaveAttribute(
        'role',
        'dialog'
      );
    });

    it('has aria-modal="true"', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-panel-backdrop')).toHaveAttribute(
        'aria-modal',
        'true'
      );
    });

    it('has aria-labelledby pointing to title', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-panel-backdrop')).toHaveAttribute(
        'aria-labelledby',
        'skill-detail-title'
      );
      expect(screen.getByTestId('skill-detail-name')).toHaveAttribute(
        'id',
        'skill-detail-title'
      );
    });

    it('evidence list has role="list"', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-evidence-list')).toHaveAttribute(
        'role',
        'list'
      );
    });

    it('evidence list has aria-label', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-evidence-list')).toHaveAttribute(
        'aria-label',
        'Evidence links'
      );
    });
  });

  describe('Focus Management (Requirement 3.6)', () => {
    it('focuses close button when panel opens', async () => {
      render(<SkillDetailPanel {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId('skill-detail-close-button')).toHaveFocus();
      });
    });

    it('returns focus to trigger element when panel closes', async () => {
      // Create a trigger button element
      const triggerButton = document.createElement('button');
      triggerButton.setAttribute('data-testid', 'trigger-button');
      document.body.appendChild(triggerButton);
      
      // Create a ref pointing to the trigger
      const triggerRef = { current: triggerButton };
      
      const { rerender } = render(
        <SkillDetailPanel {...defaultProps} triggerRef={triggerRef} />
      );
      
      // Verify panel is open and close button has focus
      await waitFor(() => {
        expect(screen.getByTestId('skill-detail-close-button')).toHaveFocus();
      });
      
      // Close the panel
      rerender(
        <SkillDetailPanel {...defaultProps} isOpen={false} triggerRef={triggerRef} />
      );
      
      // Wait for focus to return to trigger
      await waitFor(() => {
        expect(triggerButton).toHaveFocus();
      });
      
      // Cleanup
      document.body.removeChild(triggerButton);
    });

    it('does not throw when triggerRef is null', async () => {
      const { rerender } = render(
        <SkillDetailPanel {...defaultProps} triggerRef={null} />
      );
      
      // Close the panel - should not throw
      expect(() => {
        rerender(<SkillDetailPanel {...defaultProps} isOpen={false} triggerRef={null} />);
      }).not.toThrow();
    });

    it('does not throw when triggerRef.current is null', async () => {
      const triggerRef = { current: null };
      
      const { rerender } = render(
        <SkillDetailPanel {...defaultProps} triggerRef={triggerRef} />
      );
      
      // Close the panel - should not throw
      expect(() => {
        rerender(<SkillDetailPanel {...defaultProps} isOpen={false} triggerRef={triggerRef} />);
      }).not.toThrow();
    });
  });

  describe('ARIA Live Region Announcements (Requirement 6.3)', () => {
    it('renders live region when panel is open', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('live-region')).toBeInTheDocument();
    });

    it('announces skill name when panel opens', async () => {
      render(<SkillDetailPanel {...defaultProps} />);
      
      await waitFor(() => {
        const liveRegion = screen.getByTestId('live-region');
        expect(liveRegion).toHaveTextContent('Skill details for Test Skill opened');
      });
    });

    it('live region has correct ARIA attributes', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      const liveRegion = screen.getByTestId('live-region');
      
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('live region is visually hidden but accessible', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      const liveRegion = screen.getByTestId('live-region');
      
      // sr-only class makes it visually hidden but accessible to screen readers
      expect(liveRegion).toHaveClass('sr-only');
    });
  });

  describe('Tier Display', () => {
    it('displays tier description', () => {
      render(<SkillDetailPanel {...defaultProps} />);
      expect(screen.getByTestId('skill-detail-tier-description')).toHaveTextContent(
        'Deep expertise with proven track record'
      );
    });

    it('displays correct tier description for working_knowledge', () => {
      const skill = createMockSkill({ tier: 'working_knowledge' });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('skill-detail-tier-description')).toHaveTextContent(
        'Competent but not expert'
      );
    });

    it('displays correct tier description for explicit_gap', () => {
      const skill = createMockSkill({ tier: 'explicit_gap' });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('skill-detail-tier-description')).toHaveTextContent(
        'Areas intentionally not pursued'
      );
    });
  });

  describe('Evidence Types', () => {
    it('displays project evidence with correct icon and label', () => {
      const skill = createMockSkill({
        evidence: [createMockEvidence({ id: 'proj', type: 'project', title: 'Project' })],
      });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('evidence-type-proj')).toHaveTextContent('Project');
      expect(screen.getByTestId('evidence-type-icon-proj')).toBeInTheDocument();
    });

    it('displays experience evidence with correct icon and label', () => {
      const skill = createMockSkill({
        evidence: [createMockEvidence({ id: 'exp', type: 'experience', title: 'Experience' })],
      });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('evidence-type-exp')).toHaveTextContent('Experience');
      expect(screen.getByTestId('evidence-type-icon-exp')).toBeInTheDocument();
    });

    it('displays certification evidence with correct icon and label', () => {
      const skill = createMockSkill({
        evidence: [createMockEvidence({ id: 'cert', type: 'certification', title: 'Cert' })],
      });
      render(<SkillDetailPanel {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('evidence-type-cert')).toHaveTextContent('Certification');
      expect(screen.getByTestId('evidence-type-icon-cert')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// LiveRegion Component Tests
// =============================================================================

describe('LiveRegion', () => {
  it('renders with message', () => {
    render(<LiveRegion message="Test announcement" />);
    expect(screen.getByTestId('live-region')).toHaveTextContent('Test announcement');
  });

  it('has role="status"', () => {
    render(<LiveRegion message="Test" />);
    expect(screen.getByTestId('live-region')).toHaveAttribute('role', 'status');
  });

  it('defaults to polite politeness', () => {
    render(<LiveRegion message="Test" />);
    expect(screen.getByTestId('live-region')).toHaveAttribute('aria-live', 'polite');
  });

  it('supports assertive politeness', () => {
    render(<LiveRegion message="Test" politeness="assertive" />);
    expect(screen.getByTestId('live-region')).toHaveAttribute('aria-live', 'assertive');
  });

  it('has aria-atomic="true"', () => {
    render(<LiveRegion message="Test" />);
    expect(screen.getByTestId('live-region')).toHaveAttribute('aria-atomic', 'true');
  });

  it('is visually hidden with sr-only class', () => {
    render(<LiveRegion message="Test" />);
    expect(screen.getByTestId('live-region')).toHaveClass('sr-only');
  });
});
