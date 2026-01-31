/**
 * SkillCard Component Tests
 *
 * Tests for the SkillCard component which displays a single skill
 * with tier indicator, context, years of experience, and evidence indicator.
 *
 * @see Requirements 2.1, 2.2, 2.3, 2.6, 6.6
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SkillCard, TierBadge, YearsIndicator } from './SkillCard';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

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
    context: 'Test context description for the skill',
    yearsOfExperience: 5,
    category: 'test-category',
    evidence: [
      {
        id: 'evidence-1',
        type: 'project',
        title: 'Test Project',
        reference: '/projects/test-project',
      },
    ],
    ...overrides,
  };
}

// =============================================================================
// SkillCard Tests
// =============================================================================

describe('SkillCard', () => {
  const defaultProps = {
    skill: createMockSkill(),
    onClick: jest.fn(),
    isSelected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders skill name', () => {
      render(<SkillCard {...defaultProps} />);
      expect(screen.getByTestId('skill-name')).toHaveTextContent('Test Skill');
    });

    it('renders skill context', () => {
      render(<SkillCard {...defaultProps} />);
      expect(screen.getByTestId('skill-context')).toHaveTextContent(
        'Test context description for the skill'
      );
    });

    it('renders tier indicator with text label (not color-only)', () => {
      render(<SkillCard {...defaultProps} />);
      const tierIndicator = screen.getByTestId('tier-indicator');
      expect(tierIndicator).toBeInTheDocument();
      // Verify it has text content (not just color)
      expect(tierIndicator).toHaveTextContent('Core');
    });

    it('renders with correct data-testid', () => {
      render(<SkillCard {...defaultProps} />);
      expect(screen.getByTestId('skill-card-test-skill-id')).toBeInTheDocument();
    });
  });

  describe('Years of Experience (Requirement 2.2)', () => {
    it('displays years of experience when available', () => {
      const skill = createMockSkill({ yearsOfExperience: 5 });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('years-indicator')).toHaveTextContent('5 years');
    });

    it('displays singular "year" for 1 year of experience', () => {
      const skill = createMockSkill({ yearsOfExperience: 1 });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('years-indicator')).toHaveTextContent('1 year');
    });

    it('does not display years indicator when yearsOfExperience is undefined', () => {
      const skill = createMockSkill({ yearsOfExperience: undefined });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.queryByTestId('years-indicator')).not.toBeInTheDocument();
    });

    it('does not display years indicator when yearsOfExperience is 0', () => {
      const skill = createMockSkill({ yearsOfExperience: 0 });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.queryByTestId('years-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Evidence Indicator (Requirement 2.3)', () => {
    it('displays evidence indicator when evidence array is non-empty', () => {
      const skill = createMockSkill({
        evidence: [
          { id: 'e1', type: 'project', title: 'Project 1', reference: '/p1' },
        ],
      });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('evidence-indicator')).toBeInTheDocument();
    });

    it('shows correct evidence count', () => {
      const skill = createMockSkill({
        evidence: [
          { id: 'e1', type: 'project', title: 'Project 1', reference: '/p1' },
          { id: 'e2', type: 'experience', title: 'Experience 1', reference: '/e1' },
          { id: 'e3', type: 'certification', title: 'Cert 1', reference: '/c1' },
        ],
      });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('evidence-indicator')).toHaveTextContent('3 evidence items');
    });

    it('shows singular "evidence" for 1 item', () => {
      const skill = createMockSkill({
        evidence: [
          { id: 'e1', type: 'project', title: 'Project 1', reference: '/p1' },
        ],
      });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.getByTestId('evidence-indicator')).toHaveTextContent('1 evidence');
    });

    it('does not display evidence indicator when evidence array is empty', () => {
      const skill = createMockSkill({ evidence: [] });
      render(<SkillCard {...defaultProps} skill={skill} />);
      expect(screen.queryByTestId('evidence-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Tier Indicator (Requirement 6.6)', () => {
    it.each<[SkillTier, string]>([
      ['core_strength', 'Core'],
      ['working_knowledge', 'Working'],
      ['explicit_gap', 'Gap'],
    ])('displays correct label for %s tier', (tier, expectedLabel) => {
      const skill = createMockSkill({ tier });
      render(<SkillCard {...defaultProps} skill={skill} />);
      const tierIndicator = screen.getByTestId('tier-indicator');
      expect(tierIndicator).toHaveTextContent(expectedLabel);
    });

    it('includes icon in tier indicator', () => {
      render(<SkillCard {...defaultProps} />);
      const tierIndicator = screen.getByTestId('tier-indicator');
      const svg = tierIndicator.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick with button element when clicked', () => {
      const onClick = jest.fn();
      render(<SkillCard {...defaultProps} onClick={onClick} />);
      fireEvent.click(screen.getByTestId('skill-card-test-skill-id'));
      expect(onClick).toHaveBeenCalledTimes(1);
      // Verify onClick was called with the button element
      expect(onClick).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it('calls onClick with button element when Enter key is pressed', () => {
      const onClick = jest.fn();
      render(<SkillCard {...defaultProps} onClick={onClick} />);
      fireEvent.keyDown(screen.getByTestId('skill-card-test-skill-id'), {
        key: 'Enter',
      });
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it('calls onClick with button element when Space key is pressed', () => {
      const onClick = jest.fn();
      render(<SkillCard {...defaultProps} onClick={onClick} />);
      fireEvent.keyDown(screen.getByTestId('skill-card-test-skill-id'), {
        key: ' ',
      });
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it('does not call onClick for other keys', () => {
      const onClick = jest.fn();
      render(<SkillCard {...defaultProps} onClick={onClick} />);
      fireEvent.keyDown(screen.getByTestId('skill-card-test-skill-id'), {
        key: 'Tab',
      });
      expect(onClick).not.toHaveBeenCalled();
    });

    it('passes the same button element that was clicked', () => {
      const onClick = jest.fn();
      render(<SkillCard {...defaultProps} onClick={onClick} />);
      const button = screen.getByTestId('skill-card-test-skill-id');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledWith(button);
    });
  });

  describe('Selection State', () => {
    it('has aria-pressed="false" when not selected', () => {
      render(<SkillCard {...defaultProps} isSelected={false} />);
      expect(screen.getByTestId('skill-card-test-skill-id')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('has aria-pressed="true" when selected', () => {
      render(<SkillCard {...defaultProps} isSelected={true} />);
      expect(screen.getByTestId('skill-card-test-skill-id')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  describe('Accessibility', () => {
    it('is a button element for proper semantics', () => {
      render(<SkillCard {...defaultProps} />);
      expect(screen.getByTestId('skill-card-test-skill-id').tagName).toBe('BUTTON');
    });

    it('has aria-label with skill name and tier', () => {
      render(<SkillCard {...defaultProps} />);
      const card = screen.getByTestId('skill-card-test-skill-id');
      expect(card).toHaveAttribute('aria-label');
      expect(card.getAttribute('aria-label')).toContain('Test Skill');
      expect(card.getAttribute('aria-label')).toContain('Core Strengths');
    });

    it('has type="button" to prevent form submission', () => {
      render(<SkillCard {...defaultProps} />);
      expect(screen.getByTestId('skill-card-test-skill-id')).toHaveAttribute(
        'type',
        'button'
      );
    });
  });

  describe('Touch Target (Requirement 2.6)', () => {
    it('has min-h-[44px] class for minimum touch target', () => {
      render(<SkillCard {...defaultProps} />);
      const card = screen.getByTestId('skill-card-test-skill-id');
      expect(card.className).toContain('min-h-[44px]');
    });
  });
});

// =============================================================================
// TierBadge Tests
// =============================================================================

describe('TierBadge', () => {
  it.each<[SkillTier, string]>([
    ['core_strength', 'Core'],
    ['working_knowledge', 'Working'],
    ['explicit_gap', 'Gap'],
  ])('renders correct label for %s tier', (tier, expectedLabel) => {
    render(<TierBadge tier={tier} />);
    expect(screen.getByTestId('tier-indicator')).toHaveTextContent(expectedLabel);
  });

  it('hides label when showLabel is false', () => {
    render(<TierBadge tier="core_strength" showLabel={false} />);
    const badge = screen.getByTestId('tier-indicator');
    // Should still have the icon but not the text
    expect(badge.querySelector('svg')).toBeInTheDocument();
    expect(badge).not.toHaveTextContent('Core');
  });

  it('includes data-tier attribute', () => {
    render(<TierBadge tier="working_knowledge" />);
    expect(screen.getByTestId('tier-indicator')).toHaveAttribute(
      'data-tier',
      'working_knowledge'
    );
  });
});

// =============================================================================
// YearsIndicator Tests
// =============================================================================

describe('YearsIndicator', () => {
  it('displays years with plural label', () => {
    render(<YearsIndicator years={5} />);
    expect(screen.getByTestId('years-indicator')).toHaveTextContent('5 years');
  });

  it('displays year with singular label for 1 year', () => {
    render(<YearsIndicator years={1} />);
    expect(screen.getByTestId('years-indicator')).toHaveTextContent('1 year');
  });

  it('includes clock icon', () => {
    render(<YearsIndicator years={3} />);
    const indicator = screen.getByTestId('years-indicator');
    expect(indicator.querySelector('svg')).toBeInTheDocument();
  });
});
