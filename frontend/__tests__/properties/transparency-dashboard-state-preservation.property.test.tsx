/**
 * Property Test: State Preservation on Resize
 *
 * Feature: transparency-dashboard
 * Property 18: State Preservation on Resize
 *
 * For any viewport resize event, the Transparency_Dashboard SHALL preserve
 * its current state (selectedSkill, isDetailPanelOpen).
 *
 * **Validates: Requirements 7.6**
 */

import React from 'react';
import fc from 'fast-check';
import { render, fireEvent, act } from '@testing-library/react';
import { TransparencyDashboardProvider, useTransparencyDashboard } from '@/context/TransparencyDashboardContext';
import type { Skill, SkillTier } from '@/types/transparency-dashboard';

// =============================================================================
// Arbitraries
// =============================================================================

/**
 * Arbitrary for generating valid evidence items
 */
const evidenceArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('project', 'experience', 'certification') as fc.Arbitrary<'project' | 'experience' | 'certification'>,
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  reference: fc.string({ minLength: 1, maxLength: 100 }).map(s => `/${s.replace(/^\/+/, '')}`),
});

/**
 * Arbitrary for generating valid skills
 */
const skillArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  tier: fc.constantFrom('core_strength', 'working_knowledge') as fc.Arbitrary<SkillTier>,
  context: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  yearsOfExperience: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  category: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  evidence: fc.array(evidenceArbitrary, { minLength: 1, maxLength: 3 }),
});

// =============================================================================
// Test Component
// =============================================================================

/**
 * Test component that exposes context state for verification
 */
function StateVerifier({ 
  onStateChange 
}: { 
  onStateChange: (state: { selectedSkill: Skill | null; isDetailPanelOpen: boolean }) => void 
}) {
  const { selectedSkill, isDetailPanelOpen, selectSkill, skills } = useTransparencyDashboard();

  React.useEffect(() => {
    onStateChange({ selectedSkill, isDetailPanelOpen });
  }, [selectedSkill, isDetailPanelOpen, onStateChange]);

  return (
    <div>
      <button
        data-testid="select-skill-btn"
        onClick={() => {
          if (skills.length > 0) {
            selectSkill(skills[0]);
          }
        }}
      >
        Select Skill
      </button>
      <div data-testid="selected-skill-id">{selectedSkill?.id || 'none'}</div>
      <div data-testid="panel-open">{isDetailPanelOpen ? 'true' : 'false'}</div>
    </div>
  );
}

// =============================================================================
// Property Tests
// =============================================================================

describe('Property 18: State Preservation on Resize', () => {
  /**
   * Property: selectedSkill SHALL be preserved after viewport resize
   */
  it('preserves selectedSkill after viewport resize', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        let currentState: { selectedSkill: Skill | null; isDetailPanelOpen: boolean } = {
          selectedSkill: null,
          isDetailPanelOpen: false,
        };

        const handleStateChange = (state: typeof currentState) => {
          currentState = state;
        };

        const { container, unmount } = render(
          <TransparencyDashboardProvider initialSkills={[skill]} initialGaps={[]}>
            <StateVerifier onStateChange={handleStateChange} />
          </TransparencyDashboardProvider>
        );

        // Select a skill
        const selectBtn = container.querySelector('[data-testid="select-skill-btn"]');
        if (selectBtn) {
          fireEvent.click(selectBtn);
        }

        // Verify skill is selected
        expect(currentState.selectedSkill?.id).toBe(skill.id);
        expect(currentState.isDetailPanelOpen).toBe(true);

        // Simulate viewport resize
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        // State should be preserved after resize
        expect(currentState.selectedSkill?.id).toBe(skill.id);
        expect(currentState.isDetailPanelOpen).toBe(true);

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: isDetailPanelOpen SHALL be preserved after viewport resize
   */
  it('preserves isDetailPanelOpen after viewport resize', () => {
    fc.assert(
      fc.property(skillArbitrary, (skill: Skill) => {
        let currentState: { selectedSkill: Skill | null; isDetailPanelOpen: boolean } = {
          selectedSkill: null,
          isDetailPanelOpen: false,
        };

        const handleStateChange = (state: typeof currentState) => {
          currentState = state;
        };

        const { container, unmount } = render(
          <TransparencyDashboardProvider initialSkills={[skill]} initialGaps={[]}>
            <StateVerifier onStateChange={handleStateChange} />
          </TransparencyDashboardProvider>
        );

        // Initially panel should be closed
        expect(currentState.isDetailPanelOpen).toBe(false);

        // Select a skill to open panel
        const selectBtn = container.querySelector('[data-testid="select-skill-btn"]');
        if (selectBtn) {
          fireEvent.click(selectBtn);
        }

        // Panel should be open
        expect(currentState.isDetailPanelOpen).toBe(true);

        // Simulate multiple viewport resizes
        act(() => {
          window.dispatchEvent(new Event('resize'));
          window.dispatchEvent(new Event('resize'));
          window.dispatchEvent(new Event('resize'));
        });

        // Panel should still be open
        expect(currentState.isDetailPanelOpen).toBe(true);

        unmount();
        return true;
      }),
      { numRuns: 3 }
    );
  });

  /**
   * Property: State SHALL be preserved across different viewport sizes
   */
  it('preserves state across different viewport sizes', () => {
    fc.assert(
      fc.property(
        skillArbitrary,
        fc.integer({ min: 320, max: 1920 }),
        (skill: Skill, viewportWidth: number) => {
          let currentState: { selectedSkill: Skill | null; isDetailPanelOpen: boolean } = {
            selectedSkill: null,
            isDetailPanelOpen: false,
          };

          const handleStateChange = (state: typeof currentState) => {
            currentState = state;
          };

          const { container, unmount } = render(
            <TransparencyDashboardProvider initialSkills={[skill]} initialGaps={[]}>
              <StateVerifier onStateChange={handleStateChange} />
            </TransparencyDashboardProvider>
          );

          // Select a skill
          const selectBtn = container.querySelector('[data-testid="select-skill-btn"]');
          if (selectBtn) {
            fireEvent.click(selectBtn);
          }

          const initialSelectedId = currentState.selectedSkill?.id;
          const initialPanelOpen = currentState.isDetailPanelOpen;

          // Simulate viewport resize to different width
          act(() => {
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });
            window.dispatchEvent(new Event('resize'));
          });

          // State should be preserved
          expect(currentState.selectedSkill?.id).toBe(initialSelectedId);
          expect(currentState.isDetailPanelOpen).toBe(initialPanelOpen);

          unmount();
          return true;
        }
      ),
      { numRuns: 3 }
    );
  });
});
