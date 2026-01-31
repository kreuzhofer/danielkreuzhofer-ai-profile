'use client';

/**
 * TransparencyDashboard Component
 *
 * Main dashboard component that renders the three-tier expertise visualization.
 *
 * Features:
 * - Dashboard intro with title, description, and tier legend (Requirement 10.1, 10.2)
 * - Core Strengths section first (Requirement 1.2)
 * - Working Knowledge section second
 * - Explicit Gaps section third (always visible, Requirement 4.4)
 * - Skill detail panel for expanded information (Requirement 3.1)
 * - Empty gaps state message (Requirement 4.5)
 * - Core strength evidence filtering (Requirement 5.1, 5.4)
 *
 * @see Requirements 1.1, 1.2, 3.1, 4.4, 4.5, 5.1, 5.4, 10.1, 10.2
 */

import React from 'react';
import { useTransparencyDashboard } from '@/context/TransparencyDashboardContext';
import { TierSection, SkillCard, GapCard, SkillDetailPanel } from '@/components/transparency-dashboard';
import { TIER_CONFIGS } from '@/types/transparency-dashboard';
import type { Skill } from '@/types/transparency-dashboard';

// =============================================================================
// Dashboard Intro Component
// =============================================================================

/**
 * DashboardIntro displays the dashboard title, description, and tier legend.
 *
 * @see Requirements 10.1, 10.2
 */
function DashboardIntro() {
  return (
    <div className="mb-12" data-testid="dashboard-intro">
      <h1
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        data-testid="dashboard-title"
      >
        Transparency Dashboard
      </h1>
      <p
        className="text-lg text-gray-600 mb-8 max-w-3xl"
        data-testid="dashboard-description"
      >
        An honest view of my expertise. Core Strengths are backed by evidence from real projects
        and experience. Working Knowledge areas show competence without claiming mastery.
        Explicit Gaps demonstrate self-awareness about what I&apos;ve chosen not to pursue.
      </p>

      {/* Tier Legend */}
      <div
        className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg"
        data-testid="tier-legend"
        role="list"
        aria-label="Expertise tier legend"
      >
        <div className="flex items-center gap-2" role="listitem">
          <span className="w-3 h-3 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-sm text-gray-700">
            <strong>Core Strengths</strong> — Deep expertise with evidence
          </span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <span className="w-3 h-3 rounded-full bg-blue-500" aria-hidden="true" />
          <span className="text-sm text-gray-700">
            <strong>Working Knowledge</strong> — Competent, not expert
          </span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <span className="w-3 h-3 rounded-full bg-slate-400" aria-hidden="true" />
          <span className="text-sm text-gray-700">
            <strong>Explicit Gaps</strong> — Intentionally not pursued
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Loading State Component
// =============================================================================

function LoadingState() {
  return (
    <div
      className="flex items-center justify-center py-12"
      data-testid="dashboard-loading"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      <span className="ml-3 text-gray-600">Loading expertise data...</span>
    </div>
  );
}

// =============================================================================
// Error State Component
// =============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="p-6 bg-red-50 border border-red-200 rounded-lg"
      data-testid="dashboard-error"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-red-800 mb-2">Unable to load dashboard</h2>
      <p className="text-red-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// =============================================================================
// Empty Gaps Message Component
// =============================================================================

/**
 * EmptyGapsMessage displays when no gaps are configured.
 *
 * @see Requirements 4.4, 4.5
 */
function EmptyGapsMessage() {
  return (
    <div
      className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center"
      data-testid="empty-gaps-message"
    >
      <p className="text-slate-600">
        Gaps are being documented. Check back soon for a transparent view of areas
        I&apos;ve intentionally chosen not to pursue.
      </p>
    </div>
  );
}

// =============================================================================
// Core Strengths Section Component
// =============================================================================

/**
 * CoreStrengthsSection renders skills with core_strength tier.
 * Filters out skills without evidence (Requirement 5.1, 5.4).
 */
function CoreStrengthsSection() {
  const { getSkillsByTier, selectSkill, selectedSkill } = useTransparencyDashboard();
  const coreStrengths = getSkillsByTier('core_strength');
  
  // Filter out core strengths without evidence (Requirement 5.1, 5.4)
  const skillsWithEvidence = coreStrengths.filter(
    skill => skill.evidence && skill.evidence.length > 0
  );

  const tierConfig = TIER_CONFIGS.core_strength;

  return (
    <TierSection
      title={tierConfig.title}
      description={tierConfig.description}
      skills={skillsWithEvidence}
      tier="core_strength"
      data-testid="core-strengths-section"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillsWithEvidence.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onClick={(triggerElement) => selectSkill(skill, triggerElement)}
            isSelected={selectedSkill?.id === skill.id}
          />
        ))}
      </div>
    </TierSection>
  );
}

// =============================================================================
// Working Knowledge Section Component
// =============================================================================

/**
 * WorkingKnowledgeSection renders skills with working_knowledge tier.
 * Skills without evidence display with "Learning in progress" note (Requirement 5.5).
 */
function WorkingKnowledgeSection() {
  const { getSkillsByTier, selectSkill, selectedSkill } = useTransparencyDashboard();
  const workingKnowledge = getSkillsByTier('working_knowledge');

  const tierConfig = TIER_CONFIGS.working_knowledge;

  return (
    <TierSection
      title={tierConfig.title}
      description={tierConfig.description}
      skills={workingKnowledge}
      tier="working_knowledge"
      data-testid="working-knowledge-section"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workingKnowledge.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onClick={(triggerElement) => selectSkill(skill, triggerElement)}
            isSelected={selectedSkill?.id === skill.id}
          />
        ))}
      </div>
    </TierSection>
  );
}

// =============================================================================
// Explicit Gaps Section Component
// =============================================================================

/**
 * ExplicitGapsSection renders explicit gaps.
 * Always visible, even when empty (Requirement 4.4).
 */
function ExplicitGapsSection() {
  const { gaps } = useTransparencyDashboard();

  const tierConfig = TIER_CONFIGS.explicit_gap;

  return (
    <section
      className="mb-12"
      data-testid="explicit-gaps-section"
      aria-labelledby="explicit-gaps-heading"
    >
      <h2
        id="explicit-gaps-heading"
        className="text-2xl font-bold text-gray-900 mb-2"
        data-testid="explicit-gaps-heading"
      >
        {tierConfig.title}
      </h2>
      <p className="text-gray-600 mb-6" data-testid="explicit-gaps-description">
        {tierConfig.description}
      </p>

      {gaps.length === 0 ? (
        <EmptyGapsMessage />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gaps.map((gap) => (
            <GapCard key={gap.id} gap={gap} />
          ))}
        </div>
      )}
    </section>
  );
}

// =============================================================================
// Main TransparencyDashboard Component
// =============================================================================

/**
 * TransparencyDashboard is the main dashboard component.
 *
 * Renders:
 * 1. Dashboard intro with title, description, and tier legend
 * 2. Core Strengths section (first, Requirement 1.2)
 * 3. Working Knowledge section
 * 4. Explicit Gaps section (always visible, Requirement 4.4)
 * 5. Skill detail panel (modal)
 */
export function TransparencyDashboard() {
  const {
    isLoading,
    error,
    selectedSkill,
    isDetailPanelOpen,
    closeDetailPanel,
    triggerRef,
  } = useTransparencyDashboard();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DashboardIntro />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DashboardIntro />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="transparency-dashboard">
      <DashboardIntro />

      {/* Core Strengths Section - First (Requirement 1.2) */}
      <CoreStrengthsSection />

      {/* Working Knowledge Section */}
      <WorkingKnowledgeSection />

      {/* Explicit Gaps Section - Always visible (Requirement 4.4) */}
      <ExplicitGapsSection />

      {/* Skill Detail Panel */}
      {selectedSkill && (
        <SkillDetailPanel
          skill={selectedSkill}
          isOpen={isDetailPanelOpen}
          onClose={closeDetailPanel}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
}

export default TransparencyDashboard;
