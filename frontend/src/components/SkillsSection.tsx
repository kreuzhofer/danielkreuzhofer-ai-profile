'use client';

import type { SkillCategory, Skill } from '@/types/content';
import { useScrollAnimation } from '@/hooks';

/**
 * Props for the ProficiencyIndicator component
 */
interface ProficiencyIndicatorProps {
  /** The proficiency level to display */
  level: Skill['level'];
  /** Display style for the indicator */
  variant?: 'bars' | 'dots' | 'label';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the number of filled indicators based on proficiency level.
 * 
 * @param level - The proficiency level
 * @returns Number of filled indicators (1-3)
 */
function getLevelValue(level: Skill['level']): number {
  switch (level) {
    case 'expert':
      return 3;
    case 'proficient':
      return 2;
    case 'familiar':
      return 1;
    default:
      return 1;
  }
}

/**
 * Get the display label for a proficiency level.
 * 
 * @param level - The proficiency level
 * @returns Human-readable label
 */
function getLevelLabel(level: Skill['level']): string {
  switch (level) {
    case 'expert':
      return 'Expert';
    case 'proficient':
      return 'Proficient';
    case 'familiar':
      return 'Familiar';
    default:
      return level;
  }
}

/**
 * Get the color classes for a proficiency level.
 * 
 * @param level - The proficiency level
 * @returns Tailwind color classes
 */
function getLevelColor(level: Skill['level']): { filled: string; empty: string; text: string } {
  switch (level) {
    case 'expert':
      return {
        filled: 'bg-green-500',
        empty: 'bg-gray-200',
        text: 'text-green-700 bg-green-100',
      };
    case 'proficient':
      return {
        filled: 'bg-blue-500',
        empty: 'bg-gray-200',
        text: 'text-blue-700 bg-blue-100',
      };
    case 'familiar':
      return {
        filled: 'bg-yellow-500',
        empty: 'bg-gray-200',
        text: 'text-yellow-700 bg-yellow-100',
      };
    default:
      return {
        filled: 'bg-gray-500',
        empty: 'bg-gray-200',
        text: 'text-gray-700 bg-gray-100',
      };
  }
}

/**
 * ProficiencyIndicator component - displays a visual representation of skill proficiency.
 * 
 * Features:
 * - Three display variants: bars, dots, or label
 * - Color-coded by proficiency level (expert=green, proficient=blue, familiar=yellow)
 * - Accessible with aria-label describing the level
 * 
 * **Validates: Requirement 2.4**
 * - 2.4: THE Summary_Layer for Skills SHALL display categorized skill areas with visual indicators of proficiency level
 * 
 * @example
 * ```tsx
 * <ProficiencyIndicator level="expert" variant="bars" />
 * <ProficiencyIndicator level="proficient" variant="dots" />
 * <ProficiencyIndicator level="familiar" variant="label" />
 * ```
 */
export function ProficiencyIndicator({ level, variant = 'bars', className = '' }: ProficiencyIndicatorProps) {
  const levelValue = getLevelValue(level);
  const levelLabel = getLevelLabel(level);
  const colors = getLevelColor(level);
  const maxLevel = 3;

  if (variant === 'label') {
    return (
      <span
        className={`
          inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
          ${colors.text}
          ${className}
        `}
        aria-label={`Proficiency: ${levelLabel}`}
      >
        {levelLabel}
      </span>
    );
  }

  if (variant === 'dots') {
    return (
      <div
        className={`flex items-center gap-1 ${className}`}
        role="img"
        aria-label={`Proficiency: ${levelLabel} (${levelValue} of ${maxLevel})`}
      >
        {Array.from({ length: maxLevel }).map((_, index) => (
          <span
            key={index}
            className={`
              w-2 h-2 rounded-full
              ${index < levelValue ? colors.filled : colors.empty}
            `}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // Default: bars variant
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`Proficiency: ${levelLabel} (${levelValue} of ${maxLevel})`}
    >
      {Array.from({ length: maxLevel }).map((_, index) => (
        <span
          key={index}
          className={`
            w-4 h-1.5 rounded-sm
            ${index < levelValue ? colors.filled : colors.empty}
          `}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * Props for the SkillItem component
 */
export interface SkillItemProps {
  /** The skill data to display */
  skill: Skill;
  /** Display variant for the proficiency indicator */
  indicatorVariant?: 'bars' | 'dots' | 'label';
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkillItem component - displays a single skill with proficiency level indicator.
 * 
 * Features:
 * - Skill name prominently displayed
 * - Visual proficiency indicator (bars, dots, or label)
 * - Optional years of experience
 * - Optional context/description
 * - Accessible with proper ARIA attributes
 * 
 * **Validates: Requirement 2.4**
 * - 2.4: THE Summary_Layer for Skills SHALL display categorized skill areas with visual indicators of proficiency level
 * 
 * @example
 * ```tsx
 * <SkillItem
 *   skill={{ name: 'TypeScript', level: 'expert', yearsOfExperience: 5 }}
 *   indicatorVariant="bars"
 * />
 * ```
 */
export function SkillItem({ skill, indicatorVariant = 'bars', className = '' }: SkillItemProps) {
  const { name, level, yearsOfExperience, context } = skill;
  const levelLabel = getLevelLabel(level);

  return (
    <div
      className={`
        py-3 px-4
        bg-white rounded-lg border border-gray-100
        hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5
        transition-all duration-200
        ${className}
      `}
    >
      {/* Skill name as headline */}
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {name}
      </h4>
      
      {/* Metadata line: proficiency indicator + level label + years */}
      <div className="flex items-center gap-2 mb-1.5">
        <ProficiencyIndicator level={level} variant={indicatorVariant} />
        <span className="text-xs font-medium text-gray-600">
          {levelLabel}
        </span>
        {yearsOfExperience !== undefined && yearsOfExperience > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">
              {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}
            </span>
          </>
        )}
      </div>
      
      {/* Context as description */}
      {context && (
        <p className="text-xs text-gray-500 leading-relaxed">
          {context}
        </p>
      )}
    </div>
  );
}

/**
 * Props for the SkillCategoryCard component
 */
export interface SkillCategoryCardProps {
  /** The skill category data to display */
  category: SkillCategory;
  /** Display variant for proficiency indicators */
  indicatorVariant?: 'bars' | 'dots' | 'label';
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkillCategoryCard component - displays a skill category with its skills.
 * 
 * Features:
 * - Category name as heading
 * - Optional category description
 * - List of skills with proficiency indicators
 * - Responsive grid layout for skills
 * - Proper heading hierarchy (h3 for category name)
 * 
 * **Validates: Requirement 2.4**
 * - 2.4: THE Summary_Layer for Skills SHALL display categorized skill areas with visual indicators of proficiency level
 * 
 * @example
 * ```tsx
 * <SkillCategoryCard
 *   category={{
 *     id: 'frontend',
 *     name: 'Frontend Development',
 *     description: 'Building user interfaces',
 *     skills: [{ name: 'React', level: 'expert' }],
 *     order: 1,
 *     createdAt: '2024-01-01',
 *     updatedAt: '2024-01-01',
 *   }}
 * />
 * ```
 */
export function SkillCategoryCard({ category, indicatorVariant = 'bars', className = '' }: SkillCategoryCardProps) {
  const { name, description, skills } = category;

  return (
    <div
      className={`
        bg-gray-50 rounded-xl p-5
        ${className}
      `}
    >
      {/* Category header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Skills list */}
      {skills && skills.length > 0 ? (
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <SkillItem
              key={`${skill.name}-${index}`}
              skill={skill}
              indicatorVariant={indicatorVariant}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          No skills listed in this category.
        </p>
      )}
    </div>
  );
}

/**
 * Props for the SkillsSection component
 */
export interface SkillsSectionProps {
  /** Array of skill categories to display */
  skillCategories: SkillCategory[];
  /** Display variant for proficiency indicators */
  indicatorVariant?: 'bars' | 'dots' | 'label';
  /** Additional CSS classes for the section */
  className?: string;
}

/**
 * SkillsSection component - displays the Skills section with categorized skills.
 * 
 * Features:
 * - Displays all skill categories ordered by the order field
 * - Each category shows its skills with visual proficiency indicators
 * - Responsive grid layout (single column on mobile, multi-column on desktop)
 * - Proper heading hierarchy (h2 for section title, h3 for categories)
 * - Accessible with proper ARIA attributes
 * 
 * **Validates: Requirement 2.4**
 * - 2.4: THE Summary_Layer for Skills SHALL display categorized skill areas with visual indicators of proficiency level
 * 
 * @example
 * ```tsx
 * const skillCategories = await getSkillCategories();
 * <SkillsSection skillCategories={skillCategories} />
 * ```
 */
export function SkillsSection({ skillCategories, indicatorVariant = 'bars', className = '' }: SkillsSectionProps) {
  // Sort categories by order field (lower order = first)
  const sortedCategories = [...skillCategories].sort((a, b) => a.order - b.order);
  const { ref, animationStyle } = useScrollAnimation({ triggerOnce: true });

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className={`py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div ref={ref} style={animationStyle} className="max-w-4xl mx-auto">
        {/* Section heading - h2 for proper hierarchy under page h1 */}
        <h2
          id="skills-heading"
          className="text-3xl md:text-4xl font-bold text-foreground mb-8"
        >
          Skills
        </h2>

        {/* Proficiency legend */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600">
          <span className="font-medium">Proficiency:</span>
          <div className="flex items-center gap-2">
            <ProficiencyIndicator level="expert" variant={indicatorVariant} />
            <span>Expert</span>
          </div>
          <div className="flex items-center gap-2">
            <ProficiencyIndicator level="proficient" variant={indicatorVariant} />
            <span>Proficient</span>
          </div>
          <div className="flex items-center gap-2">
            <ProficiencyIndicator level="familiar" variant={indicatorVariant} />
            <span>Familiar</span>
          </div>
        </div>

        {/* Skill categories grid */}
        {sortedCategories.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedCategories.map((category) => (
              <SkillCategoryCard
                key={category.id}
                category={category}
                indicatorVariant={indicatorVariant}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No skills available.
          </p>
        )}
      </div>
    </section>
  );
}

export default SkillsSection;
