/**
 * Unit tests for Fit Analysis Prompt Builder
 *
 * Tests the buildAnalysisPrompt function to ensure it correctly
 * loads portfolio context and builds the analysis prompt.
 *
 * @see Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import {
  buildAnalysisPrompt,
  getAnalysisPromptTemplate,
} from "./fit-analysis-prompt";

// Mock the knowledge loader
jest.mock("./knowledge-loader", () => ({
  loadAllContent: jest.fn().mockResolvedValue({
    experiences: [
      {
        id: "exp-1",
        role: "Senior Software Engineer",
        company: "Tech Corp",
        period: "2020 - Present",
        summary: "Led development of cloud-native applications",
        depth: "Built microservices architecture using TypeScript and Node.js",
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "Portfolio Website",
        description: "Personal portfolio built with Next.js",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        details: "Implemented AI chatbot and fit analysis features",
      },
    ],
    skills: [
      {
        category: "Frontend",
        skills: [
          { name: "React", level: "Expert", context: "5+ years experience" },
          {
            name: "TypeScript",
            level: "Expert",
            context: "Primary language for 3+ years",
          },
        ],
      },
    ],
    about: {
      headline: "Full-Stack Developer",
      bio: "Passionate about building great software",
      valueProposition: "I bring technical excellence and clear communication",
    },
    rawKnowledge: ["Additional context about my work philosophy"],
  }),
  compileKnowledgeContext: jest.fn().mockReturnValue({
    systemPrompt: "System prompt content",
    contextSections: [
      {
        type: "about",
        title: "About",
        content:
          "## About Daniel Kreuzhofer\nHeadline: Full-Stack Developer\nBio: Passionate about building great software",
        priority: 10,
      },
      {
        type: "experience",
        title: "Experience: Senior Software Engineer at Tech Corp",
        content:
          "## Senior Software Engineer at Tech Corp\nPeriod: 2020 - Present\nSummary: Led development of cloud-native applications",
        priority: 9,
      },
      {
        type: "project",
        title: "Project: Portfolio Website",
        content:
          "## Portfolio Website\nDescription: Personal portfolio built with Next.js\nTechnologies: Next.js, TypeScript, Tailwind CSS",
        priority: 7,
      },
      {
        type: "skill",
        title: "Skills & Expertise",
        content:
          "## Frontend\n- React (Expert): 5+ years experience\n- TypeScript (Expert): Primary language for 3+ years",
        priority: 6,
      },
    ],
    totalTokenEstimate: 500,
  }),
}));

describe("fit-analysis-prompt", () => {
  describe("getAnalysisPromptTemplate", () => {
    it("returns the prompt template with placeholders", () => {
      const template = getAnalysisPromptTemplate();

      expect(template).toContain("{context}");
      expect(template).toContain("{jobDescription}");
      expect(template).toContain("PERSONALITY:");
      expect(template).toContain("ANALYSIS RULES:");
      expect(template).toContain("radically transparent");
    });

    it("includes JSON format instructions", () => {
      const template = getAnalysisPromptTemplate();

      expect(template).toContain('"confidence"');
      expect(template).toContain('"alignments"');
      expect(template).toContain('"gaps"');
      expect(template).toContain('"recommendation"');
    });
  });

  describe("buildAnalysisPrompt", () => {
    const sampleJobDescription = `
      We are looking for a Senior Software Engineer with:
      - 5+ years of experience with React and TypeScript
      - Experience building cloud-native applications
      - Strong communication skills
    `;

    it("builds a prompt with the job description", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      expect(prompt).toContain(sampleJobDescription);
    });

    it("includes portfolio context from knowledge loader", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      // Should include about section
      expect(prompt).toContain("Full-Stack Developer");

      // Should include experience
      expect(prompt).toContain("Senior Software Engineer at Tech Corp");

      // Should include project
      expect(prompt).toContain("Portfolio Website");

      // Should include skills
      expect(prompt).toContain("React (Expert)");
      expect(prompt).toContain("TypeScript (Expert)");
    });

    it("replaces the {context} placeholder", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      expect(prompt).not.toContain("{context}");
    });

    it("replaces the {jobDescription} placeholder", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      expect(prompt).not.toContain("{jobDescription}");
    });

    it("includes analysis personality instructions", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      expect(prompt).toContain("radically transparent");
      expect(prompt).toContain("Acknowledge gaps clearly");
      expect(prompt).toContain("peer tone");
    });

    it("includes analysis rules", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      expect(prompt).toContain(
        "Only claim alignment for skills/experience explicitly documented"
      );
      expect(prompt).toContain("Cite specific projects, roles, or decisions");
      expect(prompt).toContain("Identify gaps honestly");
      expect(prompt).toContain("Weight recent experience more heavily");
    });

    it("includes JSON format specification", async () => {
      const prompt = await buildAnalysisPrompt(sampleJobDescription);

      expect(prompt).toContain('"confidence": "strong" | "partial" | "limited"');
      expect(prompt).toContain('"alignments"');
      expect(prompt).toContain('"gaps"');
      expect(prompt).toContain('"recommendation"');
      expect(prompt).toContain('"verdict": "proceed" | "consider" | "reconsider"');
    });

    it("handles empty job description", async () => {
      const prompt = await buildAnalysisPrompt("");

      // Should still build a valid prompt structure
      expect(prompt).toContain("JOB DESCRIPTION TO ANALYZE:");
      expect(prompt).toContain("CONTEXT (Portfolio Owner's Background):");
    });

    it("handles job description with special characters", async () => {
      const specialJobDescription =
        "Looking for engineer with C++ & C# skills. Salary: $150k-$200k.";
      const prompt = await buildAnalysisPrompt(specialJobDescription);

      expect(prompt).toContain(specialJobDescription);
    });
  });
});
