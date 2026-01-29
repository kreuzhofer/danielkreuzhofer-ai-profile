import React from 'react';
import { render, screen, within } from '@testing-library/react';
import {
  SkillsSection,
  SkillCategoryCard,
  SkillItem,
  ProficiencyIndicator,
} from './SkillsSection';
import type { SkillCategory, Skill } from '@/types/content';

/**
 * Unit tests for SkillsSection component
 * 
 * **Validates: Requirement 2.4**
 * - 2.4: THE Summary_Layer for Skills SHALL display categorized skill areas with visual indicators of proficiency level
 */

// Sample skill data for testing
const sampleSkill: Skill = {
  name: 'TypeScript',
  level: 'expert',
  yearsOfExperience: 5,
  context: 'Primary language for frontend development',
};

const sampleSkillCategory: SkillCategory = {
  id: 'frontend',
  name: 'Frontend Development',
  description: 'Building modern user interfaces',
  skills: [
    { name: 'React', level: 'expert', yearsOfExperience: 6 },
    { name: 'TypeScript', level: 'expert', yearsOfExperience: 5 },
    { name: 'Vue.js', level: 'proficient', yearsOfExperience: 2 },
    { name: 'Svelte', level: 'familiar' },
  ],
  order: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const sampleSkillCategories: SkillCategory[] = [
  sampleSkillCategory,
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Server-side technologies',
    skills: [
      { name: 'Node.js', level: 'expert', yearsOfExperience: 5 },
      { name: 'Python', level: 'proficient', yearsOfExperience: 3 },
    ],
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Infrastructure and deployment',
    skills: [
      { name: 'Docker', level: 'proficient' },
      { name: 'Kubernetes', level: 'familiar' },
    ],
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('ProficiencyIndicator', () => {
  describe('bars variant', () => {
    it('renders 3 filled bars for expert level', () => {
      render(<ProficiencyIndicator level="expert" variant="bars" />);
      
      const indicator = screen.getByRole('img', { name: /proficiency: expert/i });
      expect(indicator).toBeInTheDocument();
      
      // Check that all 3 bars are filled (have green color)
      const bars = indicator.querySelectorAll('span');
      expect(bars).toHaveLength(3);
      bars.forEach((bar) => {
        expect(bar).toHaveClass('bg-green-500');
      });
    });

    it('renders 2 filled bars for proficient level', () => {
      render(<ProficiencyIndicator level="proficient" variant="bars" />);
      
      const indicator = screen.getByRole('img', { name: /proficiency: proficient/i });
      const bars = indicator.querySelectorAll('span');
      expect(bars).toHaveLength(3);
      
      // First 2 should be filled (blue), last should be empty
      expect(bars[0]).toHaveClass('bg-blue-500');
      expect(bars[1]).toHaveClass('bg-blue-500');
      expect(bars[2]).toHaveClass('bg-gray-200');
    });

    it('renders 1 filled bar for familiar level', () => {
      render(<ProficiencyIndicator level="familiar" variant="bars" />);
      
      const indicator = screen.getByRole('img', { name: /proficiency: familiar/i });
      const bars = indicator.querySelectorAll('span');
      expect(bars).toHaveLength(3);
      
      // First should be filled (yellow), rest should be empty
      expect(bars[0]).toHaveClass('bg-yellow-500');
      expect(bars[1]).toHaveClass('bg-gray-200');
      expect(bars[2]).toHaveClass('bg-gray-200');
    });
  });

  describe('dots variant', () => {
    it('renders 3 filled dots for expert level', () => {
      render(<ProficiencyIndicator level="expert" variant="dots" />);
      
      const indicator = screen.getByRole('img', { name: /proficiency: expert/i });
      const dots = indicator.querySelectorAll('span');
      expect(dots).toHaveLength(3);
      
      dots.forEach((dot) => {
        expect(dot).toHaveClass('bg-green-500');
        expect(dot).toHaveClass('rounded-full');
      });
    });

    it('renders 2 filled dots for proficient level', () => {
      render(<ProficiencyIndicator level="proficient" variant="dots" />);
      
      const indicator = screen.getByRole('img', { name: /proficiency: proficient/i });
      const dots = indicator.querySelectorAll('span');
      
      expect(dots[0]).toHaveClass('bg-blue-500');
      expect(dots[1]).toHaveClass('bg-blue-500');
      expect(dots[2]).toHaveClass('bg-gray-200');
    });

    it('renders 1 filled dot for familiar level', () => {
      render(<ProficiencyIndicator level="familiar" variant="dots" />);
      
      const indicator = screen.getByRole('img', { name: /proficiency: familiar/i });
      const dots = indicator.querySelectorAll('span');
      
      expect(dots[0]).toHaveClass('bg-yellow-500');
      expect(dots[1]).toHaveClass('bg-gray-200');
      expect(dots[2]).toHaveClass('bg-gray-200');
    });
  });

  describe('label variant', () => {
    it('renders "Expert" label for expert level', () => {
      render(<ProficiencyIndicator level="expert" variant="label" />);
      
      expect(screen.getByText('Expert')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toHaveClass('text-green-700');
    });

    it('renders "Proficient" label for proficient level', () => {
      render(<ProficiencyIndicator level="proficient" variant="label" />);
      
      expect(screen.getByText('Proficient')).toBeInTheDocument();
      expect(screen.getByText('Proficient')).toHaveClass('text-blue-700');
    });

    it('renders "Familiar" label for familiar level', () => {
      render(<ProficiencyIndicator level="familiar" variant="label" />);
      
      expect(screen.getByText('Familiar')).toBeInTheDocument();
      expect(screen.getByText('Familiar')).toHaveClass('text-yellow-700');
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label for bars variant', () => {
      render(<ProficiencyIndicator level="expert" variant="bars" />);
      
      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute('aria-label', 'Proficiency: Expert (3 of 3)');
    });

    it('has proper aria-label for dots variant', () => {
      render(<ProficiencyIndicator level="proficient" variant="dots" />);
      
      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute('aria-label', 'Proficiency: Proficient (2 of 3)');
    });

    it('has proper aria-label for label variant', () => {
      render(<ProficiencyIndicator level="familiar" variant="label" />);
      
      const label = screen.getByText('Familiar');
      expect(label).toHaveAttribute('aria-label', 'Proficiency: Familiar');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ProficiencyIndicator level="expert" variant="bars" className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('SkillItem', () => {
  it('renders skill name', () => {
    render(<SkillItem skill={sampleSkill} />);
    
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders proficiency indicator', () => {
    render(<SkillItem skill={sampleSkill} />);
    
    expect(screen.getByRole('img', { name: /proficiency: expert/i })).toBeInTheDocument();
  });

  it('renders years of experience when provided', () => {
    render(<SkillItem skill={sampleSkill} />);
    
    expect(screen.getByText('5y')).toBeInTheDocument();
  });

  it('does not render years when not provided', () => {
    const skillWithoutYears: Skill = {
      name: 'JavaScript',
      level: 'proficient',
    };
    
    render(<SkillItem skill={skillWithoutYears} />);
    
    expect(screen.queryByText(/y$/)).not.toBeInTheDocument();
  });

  it('does not render years when zero', () => {
    const skillWithZeroYears: Skill = {
      name: 'JavaScript',
      level: 'proficient',
      yearsOfExperience: 0,
    };
    
    render(<SkillItem skill={skillWithZeroYears} />);
    
    expect(screen.queryByText('0y')).not.toBeInTheDocument();
  });

  it('renders context when provided', () => {
    render(<SkillItem skill={sampleSkill} />);
    
    expect(screen.getByText('Primary language for frontend development')).toBeInTheDocument();
  });

  it('does not render context when not provided', () => {
    const skillWithoutContext: Skill = {
      name: 'JavaScript',
      level: 'proficient',
    };
    
    render(<SkillItem skill={skillWithoutContext} />);
    
    // Should only have the skill name, no additional text
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('uses specified indicator variant', () => {
    render(<SkillItem skill={sampleSkill} indicatorVariant="label" />);
    
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkillItem skill={sampleSkill} className="custom-skill" />);
    
    expect(container.firstChild).toHaveClass('custom-skill');
  });
});

describe('SkillCategoryCard', () => {
  it('renders category name as heading', () => {
    render(<SkillCategoryCard category={sampleSkillCategory} />);
    
    const heading = screen.getByRole('heading', { name: 'Frontend Development', level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('renders category description', () => {
    render(<SkillCategoryCard category={sampleSkillCategory} />);
    
    expect(screen.getByText('Building modern user interfaces')).toBeInTheDocument();
  });

  it('renders all skills in the category', () => {
    render(<SkillCategoryCard category={sampleSkillCategory} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
    expect(screen.getByText('Svelte')).toBeInTheDocument();
  });

  it('renders proficiency indicators for each skill', () => {
    render(<SkillCategoryCard category={sampleSkillCategory} />);
    
    // Should have 4 proficiency indicators (one per skill)
    const indicators = screen.getAllByRole('img', { name: /proficiency/i });
    expect(indicators).toHaveLength(4);
  });

  it('handles empty skills array', () => {
    const emptyCategory: SkillCategory = {
      ...sampleSkillCategory,
      skills: [],
    };
    
    render(<SkillCategoryCard category={emptyCategory} />);
    
    expect(screen.getByText('No skills listed in this category.')).toBeInTheDocument();
  });

  it('handles missing description', () => {
    const categoryWithoutDescription: SkillCategory = {
      ...sampleSkillCategory,
      description: '',
    };
    
    render(<SkillCategoryCard category={categoryWithoutDescription} />);
    
    // Should still render the category name
    expect(screen.getByRole('heading', { name: 'Frontend Development' })).toBeInTheDocument();
  });

  it('uses specified indicator variant for all skills', () => {
    render(<SkillCategoryCard category={sampleSkillCategory} indicatorVariant="label" />);
    
    // Should have label-style indicators
    expect(screen.getAllByText('Expert')).toHaveLength(2); // React and TypeScript
    expect(screen.getByText('Proficient')).toBeInTheDocument(); // Vue.js
    expect(screen.getByText('Familiar')).toBeInTheDocument(); // Svelte
  });

  it('applies custom className', () => {
    const { container } = render(
      <SkillCategoryCard category={sampleSkillCategory} className="custom-category" />
    );
    
    expect(container.firstChild).toHaveClass('custom-category');
  });
});

describe('SkillsSection', () => {
  describe('rendering', () => {
    it('renders the section with correct id for anchor navigation', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      const section = document.getElementById('skills');
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe('SECTION');
    });

    it('renders the section heading with proper accessibility', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      const heading = screen.getByRole('heading', { name: /skills/i, level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'skills-heading');
    });

    it('renders all skill categories', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      expect(screen.getByRole('heading', { name: 'Frontend Development', level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Backend Development', level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'DevOps', level: 3 })).toBeInTheDocument();
    });

    it('renders proficiency legend', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      expect(screen.getByText('Proficiency:')).toBeInTheDocument();
      // Legend shows Expert, Proficient, Familiar labels
      const legendItems = screen.getAllByText(/^(Expert|Proficient|Familiar)$/);
      // 3 in legend + skills that have these levels
      expect(legendItems.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ordering', () => {
    it('sorts categories by order field', () => {
      const unorderedCategories: SkillCategory[] = [
        { ...sampleSkillCategories[2], order: 3 }, // DevOps
        { ...sampleSkillCategories[0], order: 1 }, // Frontend
        { ...sampleSkillCategories[1], order: 2 }, // Backend
      ];
      
      render(<SkillsSection skillCategories={unorderedCategories} />);
      
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings[0]).toHaveTextContent('Frontend Development');
      expect(headings[1]).toHaveTextContent('Backend Development');
      expect(headings[2]).toHaveTextContent('DevOps');
    });
  });

  describe('empty state', () => {
    it('renders empty message when no categories', () => {
      render(<SkillsSection skillCategories={[]} />);
      
      expect(screen.getByText('No skills available.')).toBeInTheDocument();
    });
  });

  describe('indicator variants', () => {
    it('uses bars variant by default', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      // Bars variant uses role="img" with aria-label containing "of 3"
      const indicators = screen.getAllByRole('img', { name: /of 3/i });
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('uses specified indicator variant', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} indicatorVariant="label" />);
      
      // Label variant shows text labels
      const expertLabels = screen.getAllByText('Expert');
      expect(expertLabels.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('has proper aria-labelledby on section', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      const section = document.getElementById('skills');
      expect(section).toHaveAttribute('aria-labelledby', 'skills-heading');
    });

    it('maintains proper heading hierarchy', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} />);
      
      // Section has h2
      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Skills');
      
      // Categories have h3
      const categoryHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(categoryHeadings.length).toBe(3);
    });
  });

  describe('custom className', () => {
    it('applies custom className to section', () => {
      render(<SkillsSection skillCategories={sampleSkillCategories} className="custom-section" />);
      
      const section = document.getElementById('skills');
      expect(section).toHaveClass('custom-section');
    });
  });
});
