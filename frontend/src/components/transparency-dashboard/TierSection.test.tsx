/**
 * TierSection Component Tests
 *
 * Tests for the TierSection component which displays skills organized by tier
 * with semantic heading structure and visual hierarchy.
 *
 * @see Requirements 1.1, 1.5, 6.4, 8.1, 8.2, 8.3, 8.4
 */

import { render, screen } from '@testing-library/react';
import { TierSection, TierSectionProps } from './TierSection';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';
import { TIER_CONFIGS } from '@/types/transparency-dashboard';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a mock skill for testing
 */
function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: `skill-${Math.random().toString(36).slice(2, 11)}`,
    name: 'Test Skill',
    tier: 'core_strength',
    context: 'Test context description',
    yearsOfExperience: 5,
    category: 'test-category',
    evidence: [],
    ...overrides,
  };
}

/**
 * Creates multiple mock skills for testing
 */
function createMockSkills(count: number, tier: SkillTier): Skill[] {
  return Array.from({ length: count }, (_, index) =>
    createMockSkill({
      id: `skill-${tier}-${index}`,
      name: `${tier} Skill ${index + 1}`,
      tier,
      context: `Context for ${tier} skill ${index + 1}`,
    })
  );
}

/**
 * Default props for TierSection
 */
const defaultProps: TierSectionProps = {
  title: 'Core Strengths',
  description: 'Deep expertise with proven track record',
  skills: createMockSkills(3, 'core_strength'),
  tier: 'core_strength',
};

// =============================================================================
// Tests
// =============================================================================

describe('TierSection', () => {
  describe('Rendering', () => {
    it('renders the section with title and description', () => {
      render(<TierSection {...defaultProps} />);

      expect(screen.getByText('Core Strengths')).toBeInTheDocument();
      expect(screen.getByText('Deep expertise with proven track record')).toBeInTheDocument();
    });

    it('renders all skills in the grid', () => {
      const skills = createMockSkills(3, 'core_strength');
      render(<TierSection {...defaultProps} skills={skills} />);

      skills.forEach((skill) => {
        expect(screen.getByText(skill.name)).toBeInTheDocument();
      });
    });

    it('renders empty state when no skills provided', () => {
      render(<TierSection {...defaultProps} skills={[]} />);

      expect(screen.getByTestId('tier-empty-core_strength')).toBeInTheDocument();
      expect(screen.getByText('No skills in this tier yet.')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<TierSection {...defaultProps} className="custom-class" />);

      const section = screen.getByTestId('tier-section-core_strength');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Semantic Structure (Requirement 6.4)', () => {
    it('uses semantic h2 heading for section title', () => {
      render(<TierSection {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Core Strengths');
    });

    it('has proper aria-labelledby linking heading to section', () => {
      render(<TierSection {...defaultProps} />);

      const section = screen.getByTestId('tier-section-core_strength');
      const heading = screen.getByRole('heading', { level: 2 });

      expect(section).toHaveAttribute('aria-labelledby', heading.id);
    });

    it('renders skills grid with list role for accessibility', () => {
      render(<TierSection {...defaultProps} />);

      const grid = screen.getByRole('list', { name: /Core Strengths skills/i });
      expect(grid).toBeInTheDocument();
    });

    it('renders each skill item with listitem role', () => {
      const skills = createMockSkills(3, 'core_strength');
      render(<TierSection {...defaultProps} skills={skills} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('Visual Hierarchy (Requirements 8.1-8.4)', () => {
    describe('Core Strengths (high emphasis)', () => {
      it('applies high emphasis styling for core_strength tier', () => {
        render(
          <TierSection
            title="Core Strengths"
            description="Deep expertise"
            skills={createMockSkills(2, 'core_strength')}
            tier="core_strength"
          />
        );

        const section = screen.getByTestId('tier-section-core_strength');
        expect(section).toHaveClass('bg-emerald-50/50');
        expect(section).toHaveClass('border-emerald-200');
      });

      it('uses larger heading for core_strength tier', () => {
        render(
          <TierSection
            title="Core Strengths"
            description="Deep expertise"
            skills={createMockSkills(2, 'core_strength')}
            tier="core_strength"
          />
        );

        const heading = screen.getByTestId('tier-heading-core_strength');
        expect(heading).toHaveClass('text-2xl');
        expect(heading).toHaveClass('font-bold');
      });
    });

    describe('Working Knowledge (medium emphasis)', () => {
      it('applies medium emphasis styling for working_knowledge tier', () => {
        render(
          <TierSection
            title="Working Knowledge"
            description="Competent but not expert"
            skills={createMockSkills(2, 'working_knowledge')}
            tier="working_knowledge"
          />
        );

        const section = screen.getByTestId('tier-section-working_knowledge');
        expect(section).toHaveClass('bg-blue-50/30');
        expect(section).toHaveClass('border-blue-200');
      });

      it('uses medium heading for working_knowledge tier', () => {
        render(
          <TierSection
            title="Working Knowledge"
            description="Competent but not expert"
            skills={createMockSkills(2, 'working_knowledge')}
            tier="working_knowledge"
          />
        );

        const heading = screen.getByTestId('tier-heading-working_knowledge');
        expect(heading).toHaveClass('text-xl');
        expect(heading).toHaveClass('font-semibold');
      });
    });

    describe('Explicit Gaps (low emphasis)', () => {
      it('applies low emphasis styling for explicit_gap tier', () => {
        render(
          <TierSection
            title="Explicit Gaps"
            description="Areas intentionally not pursued"
            skills={createMockSkills(2, 'explicit_gap')}
            tier="explicit_gap"
          />
        );

        const section = screen.getByTestId('tier-section-explicit_gap');
        expect(section).toHaveClass('bg-slate-50/50');
        expect(section).toHaveClass('border-slate-200');
      });

      it('uses smaller heading for explicit_gap tier', () => {
        render(
          <TierSection
            title="Explicit Gaps"
            description="Areas intentionally not pursued"
            skills={createMockSkills(2, 'explicit_gap')}
            tier="explicit_gap"
          />
        );

        const heading = screen.getByTestId('tier-heading-explicit_gap');
        expect(heading).toHaveClass('text-lg');
        expect(heading).toHaveClass('font-medium');
      });
    });
  });

  describe('Custom Skill Card Rendering', () => {
    it('uses renderSkillCard function when provided', () => {
      const skills = createMockSkills(2, 'core_strength');
      const renderSkillCard = jest.fn((skill: Skill) => (
        <div data-testid={`custom-card-${skill.id}`}>Custom: {skill.name}</div>
      ));

      render(
        <TierSection
          {...defaultProps}
          skills={skills}
          renderSkillCard={renderSkillCard}
        />
      );

      expect(renderSkillCard).toHaveBeenCalledTimes(2);
      skills.forEach((skill) => {
        expect(screen.getByTestId(`custom-card-${skill.id}`)).toBeInTheDocument();
        expect(screen.getByText(`Custom: ${skill.name}`)).toBeInTheDocument();
      });
    });

    it('renders placeholder cards when renderSkillCard is not provided', () => {
      const skills = createMockSkills(2, 'core_strength');
      render(<TierSection {...defaultProps} skills={skills} />);

      skills.forEach((skill) => {
        expect(screen.getByTestId(`skill-placeholder-${skill.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Data Attributes', () => {
    it('includes data-tier attribute on section', () => {
      render(<TierSection {...defaultProps} />);

      const section = screen.getByTestId('tier-section-core_strength');
      expect(section).toHaveAttribute('data-tier', 'core_strength');
    });

    it('includes data-testid attributes for all key elements', () => {
      render(<TierSection {...defaultProps} />);

      expect(screen.getByTestId('tier-section-core_strength')).toBeInTheDocument();
      expect(screen.getByTestId('tier-heading-core_strength')).toBeInTheDocument();
      expect(screen.getByTestId('tier-description-core_strength')).toBeInTheDocument();
      expect(screen.getByTestId('tier-skills-grid-core_strength')).toBeInTheDocument();
    });
  });

  describe('All Tier Types', () => {
    const tierTypes: SkillTier[] = ['core_strength', 'working_knowledge', 'explicit_gap'];

    tierTypes.forEach((tier) => {
      it(`renders correctly for ${tier} tier`, () => {
        const config = TIER_CONFIGS[tier];
        const skills = createMockSkills(2, tier);

        render(
          <TierSection
            title={config.title}
            description={config.description}
            skills={skills}
            tier={tier}
          />
        );

        expect(screen.getByText(config.title)).toBeInTheDocument();
        expect(screen.getByText(config.description)).toBeInTheDocument();
        expect(screen.getByTestId(`tier-section-${tier}`)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('applies responsive grid classes for core_strength (large cards)', () => {
      render(
        <TierSection
          {...defaultProps}
          tier="core_strength"
        />
      );

      const grid = screen.getByTestId('tier-skills-grid-core_strength');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('applies responsive grid classes for working_knowledge (medium cards)', () => {
      render(
        <TierSection
          title="Working Knowledge"
          description="Competent but not expert"
          skills={createMockSkills(3, 'working_knowledge')}
          tier="working_knowledge"
        />
      );

      const grid = screen.getByTestId('tier-skills-grid-working_knowledge');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('applies responsive grid classes for explicit_gap (small cards)', () => {
      render(
        <TierSection
          title="Explicit Gaps"
          description="Areas intentionally not pursued"
          skills={createMockSkills(4, 'explicit_gap')}
          tier="explicit_gap"
        />
      );

      const grid = screen.getByTestId('tier-skills-grid-explicit_gap');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });
});
