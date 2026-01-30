/**
 * Unit Tests for Knowledge Loader
 *
 * These tests validate that the knowledge loader correctly loads and compiles
 * content from the portfolio's MDX files and knowledge base.
 *
 * **Validates: Requirements 10.1, 10.2, 10.3**
 */

import { loadAllContent, compileKnowledgeContext } from './knowledge-loader';
import type { KnowledgeContent, CompiledKnowledge } from '@/types/knowledge';

// =============================================================================
// Test Suite: loadAllContent()
// =============================================================================

describe('loadAllContent', () => {
  let knowledgeContent: KnowledgeContent;

  beforeAll(async () => {
    // Load content once for all tests in this suite
    knowledgeContent = await loadAllContent();
  });

  // ---------------------------------------------------------------------------
  // Requirement 10.1: Experience Loading
  // ---------------------------------------------------------------------------

  describe('Experience Loading (Requirement 10.1)', () => {
    it('should load experience entries from content/experience/', () => {
      expect(knowledgeContent.experiences).toBeDefined();
      expect(Array.isArray(knowledgeContent.experiences)).toBe(true);
      expect(knowledgeContent.experiences.length).toBeGreaterThan(0);
    });

    it('should populate experience entries with required fields', () => {
      knowledgeContent.experiences.forEach((experience) => {
        expect(experience.id).toBeDefined();
        expect(typeof experience.id).toBe('string');
        expect(experience.role).toBeDefined();
        expect(typeof experience.role).toBe('string');
        expect(experience.company).toBeDefined();
        expect(typeof experience.company).toBe('string');
        expect(experience.period).toBeDefined();
        expect(typeof experience.period).toBe('string');
        expect(experience.summary).toBeDefined();
        expect(typeof experience.summary).toBe('string');
      });
    });

    it('should include depth information for experiences with depth data', () => {
      // At least some experiences should have depth content
      const experiencesWithDepth = knowledgeContent.experiences.filter(
        (exp) => exp.depth && exp.depth.length > 0
      );
      expect(experiencesWithDepth.length).toBeGreaterThan(0);
    });

    it('should load the AWS current experience entry', () => {
      const awsCurrent = knowledgeContent.experiences.find(
        (exp) => exp.id === 'aws-current'
      );
      expect(awsCurrent).toBeDefined();
      expect(awsCurrent?.role).toBe('Senior Solutions Architect');
      expect(awsCurrent?.company).toBe('Amazon Web Services (AWS)');
    });
  });

  // ---------------------------------------------------------------------------
  // Requirement 10.2: Project Loading
  // ---------------------------------------------------------------------------

  describe('Project Loading (Requirement 10.2)', () => {
    it('should load project entries from content/projects/', () => {
      expect(knowledgeContent.projects).toBeDefined();
      expect(Array.isArray(knowledgeContent.projects)).toBe(true);
      expect(knowledgeContent.projects.length).toBeGreaterThan(0);
    });

    it('should populate project entries with required fields', () => {
      knowledgeContent.projects.forEach((project) => {
        expect(project.id).toBeDefined();
        expect(typeof project.id).toBe('string');
        expect(project.title).toBeDefined();
        expect(typeof project.title).toBe('string');
        expect(project.description).toBeDefined();
        expect(typeof project.description).toBe('string');
        expect(project.technologies).toBeDefined();
        expect(Array.isArray(project.technologies)).toBe(true);
      });
    });

    it('should include details information for projects with depth data', () => {
      // At least some projects should have details content
      const projectsWithDetails = knowledgeContent.projects.filter(
        (proj) => proj.details && proj.details.length > 0
      );
      expect(projectsWithDetails.length).toBeGreaterThan(0);
    });

    it('should load the portfolio site project entry', () => {
      const portfolioSite = knowledgeContent.projects.find(
        (proj) => proj.id === 'portfolio-site'
      );
      expect(portfolioSite).toBeDefined();
      expect(portfolioSite?.title).toBe('AI-Powered Portfolio Website');
      expect(portfolioSite?.technologies).toContain('Next.js');
      expect(portfolioSite?.technologies).toContain('TypeScript');
    });
  });

  // ---------------------------------------------------------------------------
  // Requirement 10.3: Skills and Certifications Loading
  // ---------------------------------------------------------------------------

  describe('Skills Loading (Requirement 10.3)', () => {
    it('should load skill categories from content/skills.mdx', () => {
      expect(knowledgeContent.skills).toBeDefined();
      expect(Array.isArray(knowledgeContent.skills)).toBe(true);
      expect(knowledgeContent.skills.length).toBeGreaterThan(0);
    });

    it('should populate skill categories with required fields', () => {
      knowledgeContent.skills.forEach((skillCategory) => {
        expect(skillCategory.category).toBeDefined();
        expect(typeof skillCategory.category).toBe('string');
        expect(skillCategory.skills).toBeDefined();
        expect(Array.isArray(skillCategory.skills)).toBe(true);
        expect(skillCategory.skills.length).toBeGreaterThan(0);
      });
    });

    it('should populate individual skills with name and level', () => {
      knowledgeContent.skills.forEach((skillCategory) => {
        skillCategory.skills.forEach((skill) => {
          expect(skill.name).toBeDefined();
          expect(typeof skill.name).toBe('string');
          expect(skill.level).toBeDefined();
          expect(typeof skill.level).toBe('string');
        });
      });
    });

    it('should include context for skills that have it', () => {
      // At least some skills should have context
      const skillsWithContext = knowledgeContent.skills.flatMap((category) =>
        category.skills.filter((skill) => skill.context && skill.context.length > 0)
      );
      expect(skillsWithContext.length).toBeGreaterThan(0);
    });

    it('should load Cloud Architecture skill category', () => {
      const cloudCategory = knowledgeContent.skills.find(
        (cat) => cat.category === 'Cloud Architecture'
      );
      expect(cloudCategory).toBeDefined();
      expect(cloudCategory?.skills.length).toBeGreaterThan(0);
    });

    it('should load AI & GenAI skill category', () => {
      const aiCategory = knowledgeContent.skills.find(
        (cat) => cat.category === 'AI & GenAI'
      );
      expect(aiCategory).toBeDefined();
      expect(aiCategory?.skills.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // About Content Loading
  // ---------------------------------------------------------------------------

  describe('About Content Loading', () => {
    it('should load about content from content/about.mdx', () => {
      expect(knowledgeContent.about).toBeDefined();
    });

    it('should populate about content with required fields', () => {
      expect(knowledgeContent.about.headline).toBeDefined();
      expect(typeof knowledgeContent.about.headline).toBe('string');
      expect(knowledgeContent.about.bio).toBeDefined();
      expect(typeof knowledgeContent.about.bio).toBe('string');
      expect(knowledgeContent.about.valueProposition).toBeDefined();
      expect(typeof knowledgeContent.about.valueProposition).toBe('string');
    });

    it('should load the correct headline', () => {
      expect(knowledgeContent.about.headline).toBe('Cloud Architect & AI Solutions Expert');
    });
  });

  // ---------------------------------------------------------------------------
  // Raw Knowledge Loading
  // ---------------------------------------------------------------------------

  describe('Raw Knowledge Loading', () => {
    it('should load raw knowledge files from knowledge/ directory', () => {
      expect(knowledgeContent.rawKnowledge).toBeDefined();
      expect(Array.isArray(knowledgeContent.rawKnowledge)).toBe(true);
      expect(knowledgeContent.rawKnowledge.length).toBeGreaterThan(0);
    });

    it('should load raw knowledge as non-empty strings', () => {
      knowledgeContent.rawKnowledge.forEach((content) => {
        expect(typeof content).toBe('string');
        expect(content.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

// =============================================================================
// Test Suite: compileKnowledgeContext()
// =============================================================================

describe('compileKnowledgeContext', () => {
  let knowledgeContent: KnowledgeContent;
  let compiledKnowledge: CompiledKnowledge;

  beforeAll(async () => {
    knowledgeContent = await loadAllContent();
    compiledKnowledge = compileKnowledgeContext(knowledgeContent);
  });

  describe('System Prompt Generation', () => {
    it('should produce a valid system prompt', () => {
      expect(compiledKnowledge.systemPrompt).toBeDefined();
      expect(typeof compiledKnowledge.systemPrompt).toBe('string');
      expect(compiledKnowledge.systemPrompt.length).toBeGreaterThan(0);
    });

    it('should include personality instructions in system prompt', () => {
      expect(compiledKnowledge.systemPrompt).toContain('PERSONALITY');
      expect(compiledKnowledge.systemPrompt).toContain('peer');
    });

    it('should include knowledge boundary instructions in system prompt', () => {
      expect(compiledKnowledge.systemPrompt).toContain('KNOWLEDGE BOUNDARIES');
      expect(compiledKnowledge.systemPrompt).toContain('Never fabricate');
    });

    it('should include context content in system prompt', () => {
      expect(compiledKnowledge.systemPrompt).toContain('CONTEXT');
      // Should contain some actual content from the knowledge base
      expect(compiledKnowledge.systemPrompt).toContain('Daniel Kreuzhofer');
    });
  });

  describe('Context Sections', () => {
    it('should produce context sections array', () => {
      expect(compiledKnowledge.contextSections).toBeDefined();
      expect(Array.isArray(compiledKnowledge.contextSections)).toBe(true);
      expect(compiledKnowledge.contextSections.length).toBeGreaterThan(0);
    });

    it('should include about section with highest priority', () => {
      const aboutSection = compiledKnowledge.contextSections.find(
        (section) => section.type === 'about'
      );
      expect(aboutSection).toBeDefined();
      expect(aboutSection?.priority).toBe(10);
    });

    it('should include experience sections', () => {
      const experienceSections = compiledKnowledge.contextSections.filter(
        (section) => section.type === 'experience'
      );
      expect(experienceSections.length).toBeGreaterThan(0);
    });

    it('should include project sections', () => {
      const projectSections = compiledKnowledge.contextSections.filter(
        (section) => section.type === 'project'
      );
      expect(projectSections.length).toBeGreaterThan(0);
    });

    it('should include skill section', () => {
      const skillSection = compiledKnowledge.contextSections.find(
        (section) => section.type === 'skill'
      );
      expect(skillSection).toBeDefined();
    });

    it('should include raw knowledge sections', () => {
      const rawSections = compiledKnowledge.contextSections.filter(
        (section) => section.type === 'raw'
      );
      expect(rawSections.length).toBeGreaterThan(0);
    });

    it('should sort context sections by priority (highest first)', () => {
      for (let i = 1; i < compiledKnowledge.contextSections.length; i++) {
        expect(compiledKnowledge.contextSections[i - 1].priority).toBeGreaterThanOrEqual(
          compiledKnowledge.contextSections[i].priority
        );
      }
    });

    it('should populate section titles', () => {
      compiledKnowledge.contextSections.forEach((section) => {
        expect(section.title).toBeDefined();
        expect(typeof section.title).toBe('string');
        expect(section.title.length).toBeGreaterThan(0);
      });
    });

    it('should populate section content', () => {
      compiledKnowledge.contextSections.forEach((section) => {
        expect(section.content).toBeDefined();
        expect(typeof section.content).toBe('string');
        expect(section.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Token Estimation', () => {
    it('should produce a positive token estimate', () => {
      expect(compiledKnowledge.totalTokenEstimate).toBeDefined();
      expect(typeof compiledKnowledge.totalTokenEstimate).toBe('number');
      expect(compiledKnowledge.totalTokenEstimate).toBeGreaterThan(0);
    });

    it('should estimate tokens based on system prompt length', () => {
      // Token estimate should be roughly systemPrompt.length / 4
      const expectedEstimate = Math.ceil(compiledKnowledge.systemPrompt.length / 4);
      expect(compiledKnowledge.totalTokenEstimate).toBe(expectedEstimate);
    });
  });
});

// =============================================================================
// Test Suite: Edge Cases
// =============================================================================

describe('Knowledge Loader Edge Cases', () => {
  it('should handle compiling empty knowledge content', () => {
    const emptyContent: KnowledgeContent = {
      experiences: [],
      projects: [],
      skills: [],
      about: {
        headline: '',
        bio: '',
        valueProposition: '',
      },
      rawKnowledge: [],
    };

    const compiled = compileKnowledgeContext(emptyContent);

    expect(compiled.systemPrompt).toBeDefined();
    expect(compiled.contextSections).toEqual([]);
    expect(compiled.totalTokenEstimate).toBeGreaterThan(0); // Still has template text
  });

  it('should handle compiling partial knowledge content', () => {
    const partialContent: KnowledgeContent = {
      experiences: [
        {
          id: 'test-exp',
          role: 'Test Role',
          company: 'Test Company',
          period: '2020 - Present',
          summary: 'Test summary',
          depth: '',
        },
      ],
      projects: [],
      skills: [],
      about: {
        headline: 'Test Headline',
        bio: '',
        valueProposition: '',
      },
      rawKnowledge: [],
    };

    const compiled = compileKnowledgeContext(partialContent);

    expect(compiled.systemPrompt).toContain('Test Role');
    expect(compiled.systemPrompt).toContain('Test Company');
    expect(compiled.contextSections.length).toBe(2); // about + 1 experience
  });
});
