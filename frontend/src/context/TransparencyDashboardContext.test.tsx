/**
 * TransparencyDashboardContext Unit Tests
 *
 * Tests for the TransparencyDashboardContext including:
 * - Initial state values
 * - State transitions and action handlers
 * - Skill selection and detail panel management
 * - getSkillsByTier filtering
 *
 * **Validates: Requirements 3.1, 3.4**
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import {
  TransparencyDashboardProvider,
  useTransparencyDashboard,
  dashboardReducer,
  initialDashboardState,
} from './TransparencyDashboardContext';
import type { DashboardState, DashboardAction } from './TransparencyDashboardContext';
import type { Skill, ExplicitGap } from '@/types/transparency-dashboard';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock Skill for testing
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

/**
 * Create a mock ExplicitGap for testing
 */
function createMockGap(overrides?: Partial<ExplicitGap>): ExplicitGap {
  return {
    id: 'test-gap-id',
    name: 'Test Gap',
    explanation: 'Chose to focus on other areas',
    alternativeFocus: 'Alternative focus area',
    ...overrides,
  };
}

/**
 * Test component that exposes context values for testing
 */
function TestConsumer({
  onContextReady,
}: {
  onContextReady: (ctx: ReturnType<typeof useTransparencyDashboard>) => void;
}) {
  const context = useTransparencyDashboard();
  React.useEffect(() => {
    onContextReady(context);
  }, [context, onContextReady]);
  return null;
}

/**
 * Render helper that provides access to context
 */
function renderWithProvider(
  ui?: React.ReactNode,
  providerProps?: {
    initialSkills?: Skill[];
    initialGaps?: ExplicitGap[];
    initialLoading?: boolean;
  }
) {
  let contextValue: ReturnType<typeof useTransparencyDashboard> | null = null;
  const onContextReady = (ctx: ReturnType<typeof useTransparencyDashboard>) => {
    contextValue = ctx;
  };

  const result = render(
    <TransparencyDashboardProvider {...providerProps}>
      <TestConsumer onContextReady={onContextReady} />
      {ui}
    </TransparencyDashboardProvider>
  );

  return { ...result, getContext: () => contextValue! };
}

// =============================================================================
// Reducer Tests
// =============================================================================

describe('dashboardReducer', () => {
  describe('Initial State', () => {
    it('has correct initial values', () => {
      expect(initialDashboardState.skills).toEqual([]);
      expect(initialDashboardState.gaps).toEqual([]);
      expect(initialDashboardState.isLoading).toBe(false);
      expect(initialDashboardState.error).toBeNull();
      expect(initialDashboardState.selectedSkill).toBeNull();
      expect(initialDashboardState.isDetailPanelOpen).toBe(false);
      expect(initialDashboardState.activeFilter).toBe('all');
    });
  });

  describe('SET_SKILLS action', () => {
    it('updates skills array', () => {
      const skills = [createMockSkill({ id: 'skill-1' }), createMockSkill({ id: 'skill-2' })];
      const action: DashboardAction = { type: 'SET_SKILLS', payload: skills };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.skills).toHaveLength(2);
      expect(newState.skills[0].id).toBe('skill-1');
      expect(newState.skills[1].id).toBe('skill-2');
    });

    it('replaces existing skills', () => {
      const initialState: DashboardState = {
        ...initialDashboardState,
        skills: [createMockSkill({ id: 'old-skill' })],
      };
      const newSkills = [createMockSkill({ id: 'new-skill' })];
      const action: DashboardAction = { type: 'SET_SKILLS', payload: newSkills };

      const newState = dashboardReducer(initialState, action);

      expect(newState.skills).toHaveLength(1);
      expect(newState.skills[0].id).toBe('new-skill');
    });
  });

  describe('SET_GAPS action', () => {
    it('updates gaps array', () => {
      const gaps = [createMockGap({ id: 'gap-1' }), createMockGap({ id: 'gap-2' })];
      const action: DashboardAction = { type: 'SET_GAPS', payload: gaps };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.gaps).toHaveLength(2);
      expect(newState.gaps[0].id).toBe('gap-1');
      expect(newState.gaps[1].id).toBe('gap-2');
    });
  });

  describe('SET_LOADING action', () => {
    it('sets isLoading to true', () => {
      const action: DashboardAction = { type: 'SET_LOADING', payload: true };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      const initialState: DashboardState = {
        ...initialDashboardState,
        isLoading: true,
      };
      const action: DashboardAction = { type: 'SET_LOADING', payload: false };

      const newState = dashboardReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
    });
  });

  describe('SET_ERROR action', () => {
    it('sets error', () => {
      const error = { type: 'load_error' as const, message: 'Failed to load skills' };
      const action: DashboardAction = { type: 'SET_ERROR', payload: error };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.error).toEqual(error);
    });

    it('clears error when set to null', () => {
      const initialState: DashboardState = {
        ...initialDashboardState,
        error: { type: 'load_error', message: 'Error' },
      };
      const action: DashboardAction = { type: 'SET_ERROR', payload: null };

      const newState = dashboardReducer(initialState, action);

      expect(newState.error).toBeNull();
    });
  });

  describe('SELECT_SKILL action', () => {
    it('sets selectedSkill and opens detail panel', () => {
      const skill = createMockSkill();
      const action: DashboardAction = { 
        type: 'SELECT_SKILL', 
        payload: { skill, triggerElement: null } 
      };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.selectedSkill).toEqual(skill);
      expect(newState.isDetailPanelOpen).toBe(true);
    });

    it('replaces previously selected skill', () => {
      const initialState: DashboardState = {
        ...initialDashboardState,
        selectedSkill: createMockSkill({ id: 'old-skill' }),
        isDetailPanelOpen: true,
      };
      const newSkill = createMockSkill({ id: 'new-skill' });
      const action: DashboardAction = { 
        type: 'SELECT_SKILL', 
        payload: { skill: newSkill, triggerElement: null } 
      };

      const newState = dashboardReducer(initialState, action);

      expect(newState.selectedSkill?.id).toBe('new-skill');
      expect(newState.isDetailPanelOpen).toBe(true);
    });

    it('stores trigger element for focus return', () => {
      const skill = createMockSkill();
      const mockTriggerElement = document.createElement('button');
      const action: DashboardAction = { 
        type: 'SELECT_SKILL', 
        payload: { skill, triggerElement: mockTriggerElement } 
      };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.triggerElement).toBe(mockTriggerElement);
    });
  });

  describe('CLOSE_DETAIL_PANEL action', () => {
    it('clears selectedSkill and closes detail panel', () => {
      const initialState: DashboardState = {
        ...initialDashboardState,
        selectedSkill: createMockSkill(),
        isDetailPanelOpen: true,
      };
      const action: DashboardAction = { type: 'CLOSE_DETAIL_PANEL' };

      const newState = dashboardReducer(initialState, action);

      expect(newState.selectedSkill).toBeNull();
      expect(newState.isDetailPanelOpen).toBe(false);
    });

    it('is idempotent when panel is already closed', () => {
      const action: DashboardAction = { type: 'CLOSE_DETAIL_PANEL' };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.selectedSkill).toBeNull();
      expect(newState.isDetailPanelOpen).toBe(false);
    });
  });

  describe('SET_ACTIVE_FILTER action', () => {
    it('sets active filter to a specific tier', () => {
      const action: DashboardAction = { type: 'SET_ACTIVE_FILTER', payload: 'core_strength' };

      const newState = dashboardReducer(initialDashboardState, action);

      expect(newState.activeFilter).toBe('core_strength');
    });

    it('sets active filter to all', () => {
      const initialState: DashboardState = {
        ...initialDashboardState,
        activeFilter: 'working_knowledge',
      };
      const action: DashboardAction = { type: 'SET_ACTIVE_FILTER', payload: 'all' };

      const newState = dashboardReducer(initialState, action);

      expect(newState.activeFilter).toBe('all');
    });
  });

  describe('Unknown action', () => {
    it('returns current state for unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' } as unknown as DashboardAction;

      const newState = dashboardReducer(initialDashboardState, unknownAction);

      expect(newState).toEqual(initialDashboardState);
    });
  });
});

// =============================================================================
// Context Provider Tests
// =============================================================================

describe('TransparencyDashboardProvider', () => {
  describe('useTransparencyDashboard hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useTransparencyDashboard();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useTransparencyDashboard must be used within a TransparencyDashboardProvider'
      );

      consoleSpy.mockRestore();
    });

    it('provides context value when used within provider', () => {
      const { getContext } = renderWithProvider();

      expect(getContext()).toBeDefined();
      expect(getContext().skills).toEqual([]);
      expect(getContext().gaps).toEqual([]);
      expect(getContext().selectedSkill).toBeNull();
      expect(getContext().isDetailPanelOpen).toBe(false);
      expect(getContext().isLoading).toBe(false);
      expect(getContext().error).toBeNull();
    });
  });

  describe('Initial props', () => {
    it('accepts initial skills', () => {
      const initialSkills = [
        createMockSkill({ id: 'skill-1', name: 'Skill 1' }),
        createMockSkill({ id: 'skill-2', name: 'Skill 2' }),
      ];

      const { getContext } = renderWithProvider(undefined, { initialSkills });

      expect(getContext().skills).toHaveLength(2);
      expect(getContext().skills[0].name).toBe('Skill 1');
      expect(getContext().skills[1].name).toBe('Skill 2');
    });

    it('accepts initial gaps', () => {
      const initialGaps = [
        createMockGap({ id: 'gap-1', name: 'Gap 1' }),
        createMockGap({ id: 'gap-2', name: 'Gap 2' }),
      ];

      const { getContext } = renderWithProvider(undefined, { initialGaps });

      expect(getContext().gaps).toHaveLength(2);
      expect(getContext().gaps[0].name).toBe('Gap 1');
      expect(getContext().gaps[1].name).toBe('Gap 2');
    });

    it('accepts initial loading state', () => {
      const { getContext } = renderWithProvider(undefined, { initialLoading: true });

      expect(getContext().isLoading).toBe(true);
    });
  });

  describe('selectSkill action', () => {
    it('sets selectedSkill and opens detail panel', async () => {
      const skill = createMockSkill({ id: 'selected-skill', name: 'Selected Skill' });
      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [skill],
      });

      await act(async () => {
        getContext().selectSkill(skill);
      });

      expect(getContext().selectedSkill).toEqual(skill);
      expect(getContext().isDetailPanelOpen).toBe(true);
    });

    it('replaces previously selected skill', async () => {
      const skill1 = createMockSkill({ id: 'skill-1', name: 'Skill 1' });
      const skill2 = createMockSkill({ id: 'skill-2', name: 'Skill 2' });
      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [skill1, skill2],
      });

      await act(async () => {
        getContext().selectSkill(skill1);
      });

      expect(getContext().selectedSkill?.id).toBe('skill-1');

      await act(async () => {
        getContext().selectSkill(skill2);
      });

      expect(getContext().selectedSkill?.id).toBe('skill-2');
    });
  });

  describe('closeDetailPanel action', () => {
    it('clears selectedSkill and closes detail panel', async () => {
      const skill = createMockSkill();
      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [skill],
      });

      // First select a skill
      await act(async () => {
        getContext().selectSkill(skill);
      });

      expect(getContext().isDetailPanelOpen).toBe(true);

      // Then close the panel
      await act(async () => {
        getContext().closeDetailPanel();
      });

      expect(getContext().selectedSkill).toBeNull();
      expect(getContext().isDetailPanelOpen).toBe(false);
    });
  });

  describe('getSkillsByTier action', () => {
    it('returns skills filtered by core_strength tier', () => {
      const coreSkill1 = createMockSkill({ id: 'core-1', tier: 'core_strength' });
      const coreSkill2 = createMockSkill({ id: 'core-2', tier: 'core_strength' });
      const workingSkill = createMockSkill({ id: 'working-1', tier: 'working_knowledge' });

      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [coreSkill1, coreSkill2, workingSkill],
      });

      const coreStrengths = getContext().getSkillsByTier('core_strength');

      expect(coreStrengths).toHaveLength(2);
      expect(coreStrengths.every((s) => s.tier === 'core_strength')).toBe(true);
    });

    it('returns skills filtered by working_knowledge tier', () => {
      const coreSkill = createMockSkill({ id: 'core-1', tier: 'core_strength' });
      const workingSkill1 = createMockSkill({ id: 'working-1', tier: 'working_knowledge' });
      const workingSkill2 = createMockSkill({ id: 'working-2', tier: 'working_knowledge' });

      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [coreSkill, workingSkill1, workingSkill2],
      });

      const workingKnowledge = getContext().getSkillsByTier('working_knowledge');

      expect(workingKnowledge).toHaveLength(2);
      expect(workingKnowledge.every((s) => s.tier === 'working_knowledge')).toBe(true);
    });

    it('returns skills filtered by explicit_gap tier', () => {
      const coreSkill = createMockSkill({ id: 'core-1', tier: 'core_strength' });
      const gapSkill = createMockSkill({ id: 'gap-1', tier: 'explicit_gap' });

      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [coreSkill, gapSkill],
      });

      const explicitGaps = getContext().getSkillsByTier('explicit_gap');

      expect(explicitGaps).toHaveLength(1);
      expect(explicitGaps[0].tier).toBe('explicit_gap');
    });

    it('returns empty array when no skills match tier', () => {
      const coreSkill = createMockSkill({ id: 'core-1', tier: 'core_strength' });

      const { getContext } = renderWithProvider(undefined, {
        initialSkills: [coreSkill],
      });

      const workingKnowledge = getContext().getSkillsByTier('working_knowledge');

      expect(workingKnowledge).toHaveLength(0);
    });

    it('returns empty array when skills array is empty', () => {
      const { getContext } = renderWithProvider();

      const coreStrengths = getContext().getSkillsByTier('core_strength');

      expect(coreStrengths).toHaveLength(0);
    });
  });

  describe('Context memoization', () => {
    it('provides stable function references', async () => {
      const { getContext } = renderWithProvider();

      const selectSkill1 = getContext().selectSkill;
      const closeDetailPanel1 = getContext().closeDetailPanel;
      const getSkillsByTier1 = getContext().getSkillsByTier;

      // Trigger a re-render by selecting a skill
      const skill = createMockSkill();
      await act(async () => {
        getContext().selectSkill(skill);
      });

      // Functions should be stable (same reference)
      expect(getContext().selectSkill).toBe(selectSkill1);
      expect(getContext().closeDetailPanel).toBe(closeDetailPanel1);
      // Note: getSkillsByTier depends on skills, so it may change if skills change
      // But since we didn't change skills, it should be stable
      expect(getContext().getSkillsByTier).toBe(getSkillsByTier1);
    });
  });
});
