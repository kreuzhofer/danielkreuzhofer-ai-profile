/**
 * Accessibility Tests: Transparency Dashboard
 *
 * Tests WCAG 2.1 AA compliance using jest-axe.
 *
 * **Validates: Requirements 6.1, 6.5**
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransparencyDashboardProvider } from '@/context/TransparencyDashboardContext';
import { TransparencyDashboard } from '@/app/transparency/TransparencyDashboard';
import { SkillCard } from '@/components/transparency-dashboard/SkillCard';
import { GapCard } from '@/components/transparency-dashboard/GapCard';
import { TierSection } from '@/components/transparency-dashboard/TierSection';
import { EvidenceList } from '@/components/transparency-dashboard/EvidenceList';
import type { Skill, ExplicitGap, Evidence } from '@/types/transparency-dashboard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// =============================================================================
// Test Data
// =============================================================================

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'AWS Solutions Architecture',
  tier: 'core_strength',
  context: 'Deep expertise in designing and implementing cloud solutions on AWS',
  yearsOfExperience: 8,
  category: 'cloud',
  evidence: [
    {
      id: 'ev-1',
      type: 'project',
      title: 'Enterprise Migration',
      reference: '/projects/enterprise-migration',
    },
    {
      id: 'ev-2',
      type: 'experience',
      title: 'AWS Team Lead',
      reference: '/experience/aws-team-lead',
    },
  ],
};

const mockWorkingKnowledgeSkill: Skill = {
  id: 'skill-2',
  name: 'Kubernetes',
  tier: 'working_knowledge',
  context: 'Working knowledge of container orchestration',
  yearsOfExperience: 3,
  category: 'devops',
  evidence: [],
};

const mockGap: ExplicitGap = {
  id: 'gap-1',
  name: 'Native Mobile Development',
  explanation: 'Chose to focus on web and cloud architecture',
  alternativeFocus: 'Progressive Web Apps',
};

const mockEvidence: Evidence[] = [
  {
    id: 'ev-1',
    type: 'project',
    title: 'Portfolio Site',
    reference: '/projects/portfolio-site',
    excerpt: 'Built with Next.js and TypeScript',
  },
  {
    id: 'ev-2',
    type: 'experience',
    title: 'AWS Solutions Architect',
    reference: '/experience/aws-sa',
  },
];

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('Transparency Dashboard Accessibility', () => {
  describe('SkillCard Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <SkillCard skill={mockSkill} onClick={() => {}} isSelected={false} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when selected', async () => {
      const { container } = render(
        <SkillCard skill={mockSkill} onClick={() => {}} isSelected={true} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for working knowledge tier', async () => {
      const { container } = render(
        <SkillCard skill={mockWorkingKnowledgeSkill} onClick={() => {}} isSelected={false} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('GapCard Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<GapCard gap={mockGap} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('TierSection Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TierSection
          title="Core Strengths"
          description="Deep expertise with proven track record"
          skills={[mockSkill]}
          tier="core_strength"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when empty', async () => {
      const { container } = render(
        <TierSection
          title="Core Strengths"
          description="Deep expertise with proven track record"
          skills={[]}
          tier="core_strength"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('EvidenceList Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<EvidenceList evidence={mockEvidence} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Full Dashboard', () => {
    it('should have no accessibility violations with data', async () => {
      const { container } = render(
        <TransparencyDashboardProvider
          initialSkills={[mockSkill, mockWorkingKnowledgeSkill]}
          initialGaps={[mockGap]}
        >
          <TransparencyDashboard />
        </TransparencyDashboardProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when empty', async () => {
      const { container } = render(
        <TransparencyDashboardProvider initialSkills={[]} initialGaps={[]}>
          <TransparencyDashboard />
        </TransparencyDashboardProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
