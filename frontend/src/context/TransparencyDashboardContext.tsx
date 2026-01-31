'use client';

/**
 * Transparency Dashboard Context Provider
 *
 * Provides state management for the Transparency Dashboard including:
 * - Skills organized by tier (core_strength, working_knowledge, explicit_gap)
 * - Explicit gaps with explanations
 * - Selected skill and detail panel state
 * - Actions for skill selection and panel management
 *
 * @see Requirements 3.1, 3.4
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import type {
  Skill,
  ExplicitGap,
  SkillTier,
  DashboardError,
} from '@/types/transparency-dashboard';

// =============================================================================
// Context Value Interface
// =============================================================================

/**
 * Context value interface for the Transparency Dashboard
 */
export interface TransparencyDashboardContextValue {
  // State
  skills: Skill[];
  gaps: ExplicitGap[];
  selectedSkill: Skill | null;
  isDetailPanelOpen: boolean;
  isLoading: boolean;
  error: DashboardError | null;
  /** Reference to the element that triggered the detail panel (for focus return) */
  triggerRef: React.RefObject<HTMLElement> | null;

  // Actions
  selectSkill: (skill: Skill, triggerElement?: HTMLElement | null) => void;
  closeDetailPanel: () => void;
  getSkillsByTier: (tier: SkillTier) => Skill[];
}

// =============================================================================
// State Types
// =============================================================================

export interface DashboardState {
  skills: Skill[];
  gaps: ExplicitGap[];
  isLoading: boolean;
  error: DashboardError | null;
  selectedSkill: Skill | null;
  isDetailPanelOpen: boolean;
  activeFilter: SkillTier | 'all';
  /** Reference to the element that triggered the detail panel (for focus return) */
  triggerElement: HTMLElement | null;
}

// =============================================================================
// Initial State
// =============================================================================

export const initialDashboardState: DashboardState = {
  skills: [],
  gaps: [],
  isLoading: false,
  error: null,
  selectedSkill: null,
  isDetailPanelOpen: false,
  activeFilter: 'all',
  triggerElement: null,
};

// =============================================================================
// Action Types
// =============================================================================

export type DashboardAction =
  | { type: 'SET_SKILLS'; payload: Skill[] }
  | { type: 'SET_GAPS'; payload: ExplicitGap[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: DashboardError | null }
  | { type: 'SELECT_SKILL'; payload: { skill: Skill; triggerElement: HTMLElement | null } }
  | { type: 'CLOSE_DETAIL_PANEL' }
  | { type: 'SET_ACTIVE_FILTER'; payload: SkillTier | 'all' };

// =============================================================================
// Reducer
// =============================================================================

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'SET_SKILLS':
      return {
        ...state,
        skills: action.payload,
      };

    case 'SET_GAPS':
      return {
        ...state,
        gaps: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SELECT_SKILL':
      return {
        ...state,
        selectedSkill: action.payload.skill,
        isDetailPanelOpen: true,
        triggerElement: action.payload.triggerElement,
      };

    case 'CLOSE_DETAIL_PANEL':
      return {
        ...state,
        selectedSkill: null,
        isDetailPanelOpen: false,
        // Note: triggerElement is preserved until panel closes for focus return
      };

    case 'SET_ACTIVE_FILTER':
      return {
        ...state,
        activeFilter: action.payload,
      };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

const TransparencyDashboardContext = createContext<TransparencyDashboardContextValue | null>(null);

// =============================================================================
// Provider Props
// =============================================================================

export interface TransparencyDashboardProviderProps {
  children: React.ReactNode;
  /** Initial skills data (for server-side rendering) */
  initialSkills?: Skill[];
  /** Initial gaps data (for server-side rendering) */
  initialGaps?: ExplicitGap[];
  /** Initial loading state */
  initialLoading?: boolean;
}

// =============================================================================
// Provider Component
// =============================================================================

export function TransparencyDashboardProvider({
  children,
  initialSkills = [],
  initialGaps = [],
  initialLoading = false,
}: TransparencyDashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, {
    ...initialDashboardState,
    skills: initialSkills,
    gaps: initialGaps,
    isLoading: initialLoading,
  });

  // Create a ref that always points to the current trigger element
  const triggerRef = useRef<HTMLElement | null>(null);

  // Keep triggerRef in sync with state
  useEffect(() => {
    triggerRef.current = state.triggerElement;
  }, [state.triggerElement]);

  // Action: Select a skill and open detail panel
  const selectSkill = useCallback((skill: Skill, triggerElement?: HTMLElement | null) => {
    dispatch({ 
      type: 'SELECT_SKILL', 
      payload: { skill, triggerElement: triggerElement ?? null } 
    });
  }, []);

  // Action: Close the detail panel
  const closeDetailPanel = useCallback(() => {
    dispatch({ type: 'CLOSE_DETAIL_PANEL' });
  }, []);

  // Action: Get skills filtered by tier
  const getSkillsByTier = useCallback(
    (tier: SkillTier): Skill[] => {
      return state.skills.filter((skill) => skill.tier === tier);
    },
    [state.skills]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<TransparencyDashboardContextValue>(
    () => ({
      // State
      skills: state.skills,
      gaps: state.gaps,
      selectedSkill: state.selectedSkill,
      isDetailPanelOpen: state.isDetailPanelOpen,
      isLoading: state.isLoading,
      error: state.error,
      triggerRef: triggerRef as React.RefObject<HTMLElement>,
      // Actions
      selectSkill,
      closeDetailPanel,
      getSkillsByTier,
    }),
    [
      state.skills,
      state.gaps,
      state.selectedSkill,
      state.isDetailPanelOpen,
      state.isLoading,
      state.error,
      selectSkill,
      closeDetailPanel,
      getSkillsByTier,
    ]
  );

  return (
    <TransparencyDashboardContext.Provider value={contextValue}>
      {children}
    </TransparencyDashboardContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access the transparency dashboard context
 * @throws Error if used outside of TransparencyDashboardProvider
 */
export function useTransparencyDashboard(): TransparencyDashboardContextValue {
  const context = useContext(TransparencyDashboardContext);
  if (!context) {
    throw new Error(
      'useTransparencyDashboard must be used within a TransparencyDashboardProvider'
    );
  }
  return context;
}

// =============================================================================
// Exports for Testing
// =============================================================================

export { TransparencyDashboardContext };
