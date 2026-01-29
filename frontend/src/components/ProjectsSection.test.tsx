import { render, screen, fireEvent } from '@testing-library/react';
import {
  ProjectsSection,
  ProjectCard,
  ProjectSummary,
  ProjectDepth,
  TechnologyFilter,
} from './ProjectsSection';
import type { Project, ProjectDepth as ProjectDepthType } from '@/types/content';

// Sample project depth data for testing
const sampleProjectDepth: ProjectDepthType = {
  problem: 'Users were struggling to find relevant content in a large document repository with over 100,000 documents.',
  approach: 'Implemented a semantic search system using vector embeddings and a custom ranking algorithm that considers document freshness and user preferences.',
  tradeoffs: [
    {
      decision: 'Vector Database Selection',
      alternatives: ['Pinecone', 'Weaviate', 'Milvus', 'PostgreSQL with pgvector'],
      reasoning: 'Chose PostgreSQL with pgvector for cost efficiency and simpler operations, accepting slightly lower query performance.',
    },
    {
      decision: 'Embedding Model',
      alternatives: ['OpenAI Ada', 'Sentence Transformers', 'Custom fine-tuned model'],
      reasoning: 'Used Sentence Transformers for on-premise deployment and data privacy requirements.',
    },
  ],
  outcomes: [
    {
      metric: 'Search Relevance',
      value: '+65%',
      context: 'Measured by user click-through rate on first result',
    },
    {
      metric: 'Query Latency',
      value: '<100ms',
      context: 'P95 latency for semantic search queries',
    },
    {
      metric: 'User Satisfaction',
      value: '4.5/5',
      context: 'Based on post-search feedback surveys',
    },
  ],
  reflections: 'Would have invested more time in building a comprehensive evaluation dataset earlier in the project. This would have allowed for faster iteration on the ranking algorithm.',
};

const sampleProject: Project = {
  id: 'proj-1',
  order: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
  title: 'Semantic Search Engine',
  description: 'A modern search system using vector embeddings to deliver highly relevant results from large document repositories.',
  technologies: ['Python', 'PostgreSQL', 'FastAPI', 'React', 'Docker'],
  thumbnail: '/images/search-engine.png',
  links: [
    { type: 'live', url: 'https://search.example.com', label: 'Live Demo' },
    { type: 'github', url: 'https://github.com/example/search', label: 'Source Code' },
    { type: 'case-study', url: '/case-studies/search', label: 'Case Study' },
  ],
  depth: sampleProjectDepth,
};

const secondProject: Project = {
  id: 'proj-2',
  order: 2,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
  title: 'Real-time Analytics Dashboard',
  description: 'Interactive dashboard for monitoring business metrics with real-time updates and customizable visualizations.',
  technologies: ['TypeScript', 'Next.js', 'D3.js', 'WebSocket'],
  links: [
    { type: 'github', url: 'https://github.com/example/dashboard', label: 'GitHub' },
  ],
  depth: {
    problem: 'Business stakeholders needed real-time visibility into key metrics.',
    approach: 'Built a WebSocket-based streaming architecture with D3.js visualizations.',
    tradeoffs: [],
    outcomes: [
      {
        metric: 'Data Freshness',
        value: '<1s',
        context: 'Time from event to dashboard update',
      },
    ],
    reflections: 'Would explore server-sent events as a simpler alternative to WebSockets for one-way data flow.',
  },
};

describe('ProjectSummary', () => {
  it('renders project title', () => {
    render(<ProjectSummary project={sampleProject} isExpanded={false} />);
    expect(screen.getByText('Semantic Search Engine')).toBeInTheDocument();
  });

  it('renders project description', () => {
    render(<ProjectSummary project={sampleProject} isExpanded={false} />);
    expect(screen.getByText(/A modern search system using vector embeddings/)).toBeInTheDocument();
  });

  it('renders all technologies as tags', () => {
    render(<ProjectSummary project={sampleProject} isExpanded={false} />);
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('renders project links', () => {
    render(<ProjectSummary project={sampleProject} isExpanded={false} />);
    expect(screen.getByText('Live Demo')).toBeInTheDocument();
    expect(screen.getByText('Source Code')).toBeInTheDocument();
    expect(screen.getByText('Case Study')).toBeInTheDocument();
  });

  it('renders links with correct href attributes', () => {
    render(<ProjectSummary project={sampleProject} isExpanded={false} />);
    const liveLink = screen.getByText('Live Demo').closest('a');
    expect(liveLink).toHaveAttribute('href', 'https://search.example.com');
    
    const githubLink = screen.getByText('Source Code').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/example/search');
  });

  it('renders links with target="_blank" and rel="noopener noreferrer"', () => {
    render(<ProjectSummary project={sampleProject} isExpanded={false} />);
    const liveLink = screen.getByText('Live Demo').closest('a');
    expect(liveLink).toHaveAttribute('target', '_blank');
    expect(liveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows expand indicator rotated when expanded', () => {
    const { container } = render(
      <ProjectSummary project={sampleProject} isExpanded={true} />
    );
    const indicator = container.querySelector('[aria-hidden="true"]');
    expect(indicator).toHaveClass('rotate-180');
  });

  it('shows expand indicator not rotated when collapsed', () => {
    const { container } = render(
      <ProjectSummary project={sampleProject} isExpanded={false} />
    );
    const indicator = container.querySelector('[aria-hidden="true"]');
    expect(indicator).not.toHaveClass('rotate-180');
  });

  it('handles project with no links gracefully', () => {
    const projectNoLinks: Project = {
      ...sampleProject,
      links: [],
    };
    render(<ProjectSummary project={projectNoLinks} isExpanded={false} />);
    expect(screen.getByText('Semantic Search Engine')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('handles project with no technologies gracefully', () => {
    const projectNoTech: Project = {
      ...sampleProject,
      technologies: [],
    };
    render(<ProjectSummary project={projectNoTech} isExpanded={false} />);
    expect(screen.getByText('Semantic Search Engine')).toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });
});

describe('ProjectDepth', () => {
  it('renders problem statement', () => {
    render(<ProjectDepth depth={sampleProjectDepth} />);
    expect(screen.getByText('The Problem')).toBeInTheDocument();
    expect(screen.getByText(/Users were struggling to find relevant content/)).toBeInTheDocument();
  });

  it('renders approach', () => {
    render(<ProjectDepth depth={sampleProjectDepth} />);
    expect(screen.getByText('Approach')).toBeInTheDocument();
    expect(screen.getByText(/Implemented a semantic search system/)).toBeInTheDocument();
  });

  it('renders trade-offs with alternatives and reasoning', () => {
    render(<ProjectDepth depth={sampleProjectDepth} />);
    expect(screen.getByText('Trade-offs Considered')).toBeInTheDocument();
    expect(screen.getByText('Vector Database Selection')).toBeInTheDocument();
    expect(screen.getByText('Pinecone')).toBeInTheDocument();
    expect(screen.getByText(/Chose PostgreSQL with pgvector/)).toBeInTheDocument();
  });

  it('renders outcomes with metrics and values', () => {
    render(<ProjectDepth depth={sampleProjectDepth} />);
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('+65%')).toBeInTheDocument();
    expect(screen.getByText('Search Relevance')).toBeInTheDocument();
    expect(screen.getByText('<100ms')).toBeInTheDocument();
    expect(screen.getByText('4.5/5')).toBeInTheDocument();
  });

  it('renders reflections', () => {
    render(<ProjectDepth depth={sampleProjectDepth} />);
    expect(screen.getByText('Reflections')).toBeInTheDocument();
    expect(screen.getByText(/Would have invested more time/)).toBeInTheDocument();
  });

  it('handles empty tradeoffs array gracefully', () => {
    const depthNoTradeoffs: ProjectDepthType = {
      ...sampleProjectDepth,
      tradeoffs: [],
    };
    render(<ProjectDepth depth={depthNoTradeoffs} />);
    expect(screen.getByText('The Problem')).toBeInTheDocument();
    expect(screen.queryByText('Trade-offs Considered')).not.toBeInTheDocument();
  });

  it('handles empty outcomes array gracefully', () => {
    const depthNoOutcomes: ProjectDepthType = {
      ...sampleProjectDepth,
      outcomes: [],
    };
    render(<ProjectDepth depth={depthNoOutcomes} />);
    expect(screen.getByText('The Problem')).toBeInTheDocument();
    expect(screen.queryByText('Results')).not.toBeInTheDocument();
  });

  it('handles missing reflections gracefully', () => {
    const depthNoReflections: ProjectDepthType = {
      ...sampleProjectDepth,
      reflections: '',
    };
    render(<ProjectDepth depth={depthNoReflections} />);
    expect(screen.getByText('The Problem')).toBeInTheDocument();
    expect(screen.queryByText('Reflections')).not.toBeInTheDocument();
  });

  it('handles minimal depth data', () => {
    const minimalDepth: ProjectDepthType = {
      problem: 'A simple problem',
      approach: '',
      tradeoffs: [],
      outcomes: [],
      reflections: '',
    };
    render(<ProjectDepth depth={minimalDepth} />);
    expect(screen.getByText('The Problem')).toBeInTheDocument();
    expect(screen.getByText('A simple problem')).toBeInTheDocument();
    expect(screen.queryByText('Approach')).not.toBeInTheDocument();
    expect(screen.queryByText('Trade-offs Considered')).not.toBeInTheDocument();
    expect(screen.queryByText('Results')).not.toBeInTheDocument();
    expect(screen.queryByText('Reflections')).not.toBeInTheDocument();
  });
});

describe('ProjectCard', () => {
  it('renders summary content', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    expect(screen.getByText('Semantic Search Engine')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Project: Semantic Search Engine');
  });

  it('has aria-expanded false when collapsed', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-expanded true when expanded', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={true}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows depth content when expanded', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={true}
        onToggle={onToggle}
      />
    );
    
    // Depth content should be visible
    expect(screen.getByText('The Problem')).toBeInTheDocument();
    expect(screen.getByText('Approach')).toBeInTheDocument();
  });

  it('supports keyboard navigation with Enter key', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation with Space key', () => {
    const onToggle = jest.fn();
    render(
      <ProjectCard
        project={sampleProject}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('ProjectsSection', () => {
  const projects = [sampleProject, secondProject];

  it('renders section with correct heading', () => {
    render(<ProjectsSection projects={projects} />);
    expect(screen.getByRole('heading', { name: 'Projects', level: 2 })).toBeInTheDocument();
  });

  it('renders section with correct id for anchor navigation', () => {
    render(<ProjectsSection projects={projects} />);
    const section = screen.getByRole('region', { name: 'Projects' });
    expect(section).toHaveAttribute('id', 'projects');
  });

  it('renders all project items', () => {
    render(<ProjectsSection projects={projects} />);
    expect(screen.getByText('Semantic Search Engine')).toBeInTheDocument();
    expect(screen.getByText('Real-time Analytics Dashboard')).toBeInTheDocument();
  });

  it('sorts projects by order field', () => {
    const unorderedProjects = [
      { ...secondProject, order: 2 },
      { ...sampleProject, order: 1 },
    ];
    render(<ProjectsSection projects={unorderedProjects} />);
    
    const buttons = screen.getAllByRole('button');
    // First button should be for the project with order: 1
    expect(buttons[0]).toHaveAttribute('aria-label', 'Project: Semantic Search Engine');
  });

  it('shows empty state when no projects', () => {
    render(<ProjectsSection projects={[]} />);
    expect(screen.getByText('No projects available.')).toBeInTheDocument();
  });

  it('allows expanding and collapsing items', () => {
    render(<ProjectsSection projects={projects} />);
    
    // Initially collapsed - depth content should not be visible
    expect(screen.queryByText('The Problem')).not.toBeInTheDocument();
    
    // Click to expand first item
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    
    // Now depth content should be visible
    expect(screen.getByText('The Problem')).toBeInTheDocument();
  });

  it('supports multiple items expanded simultaneously', () => {
    render(<ProjectsSection projects={projects} />);
    
    const buttons = screen.getAllByRole('button');
    
    // Expand first item
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/Users were struggling to find relevant content/)).toBeInTheDocument();
    
    // Expand second item
    fireEvent.click(buttons[1]);
    expect(screen.getByText(/Business stakeholders needed real-time visibility/)).toBeInTheDocument();
    
    // Both should still be visible
    expect(screen.getByText(/Users were struggling to find relevant content/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProjectsSection projects={projects} className="custom-class" />
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('has proper aria-labelledby for accessibility', () => {
    render(<ProjectsSection projects={projects} />);
    const section = screen.getByRole('region', { name: 'Projects' });
    expect(section).toHaveAttribute('aria-labelledby', 'projects-heading');
  });
});

describe('TechnologyFilter', () => {
  const technologies = ['React', 'TypeScript', 'Python', 'Docker'];
  const onFilterChange = jest.fn();

  beforeEach(() => {
    onFilterChange.mockClear();
  });

  it('renders filter label and dropdown', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology=""
        onFilterChange={onFilterChange}
      />
    );
    expect(screen.getByText('Filter by technology:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all technology options plus "All Technologies"', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology=""
        onFilterChange={onFilterChange}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveDisplayValue('All Technologies');
    
    // Check all options are present
    expect(screen.getByRole('option', { name: 'All Technologies' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Python' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Docker' })).toBeInTheDocument();
  });

  it('calls onFilterChange when selection changes', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology=""
        onFilterChange={onFilterChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'React' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('React');
  });

  it('shows clear button when filter is selected', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology="React"
        onFilterChange={onFilterChange}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Clear filter' })).toBeInTheDocument();
  });

  it('does not show clear button when no filter is selected', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology=""
        onFilterChange={onFilterChange}
      />
    );
    
    expect(screen.queryByRole('button', { name: 'Clear filter' })).not.toBeInTheDocument();
  });

  it('calls onFilterChange with empty string when clear button is clicked', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology="React"
        onFilterChange={onFilterChange}
      />
    );
    
    const clearButton = screen.getByRole('button', { name: 'Clear filter' });
    fireEvent.click(clearButton);
    
    expect(onFilterChange).toHaveBeenCalledWith('');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TechnologyFilter
        technologies={technologies}
        selectedTechnology=""
        onFilterChange={onFilterChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Filter projects by technology');
    expect(select).toHaveAttribute('id', 'technology-filter');
    
    const label = screen.getByText('Filter by technology:');
    expect(label).toHaveAttribute('for', 'technology-filter');
  });
});

describe('ProjectsSection filtering', () => {
  // Create 6 projects to trigger filter display (threshold is 5)
  const createProject = (id: string, order: number, title: string, technologies: string[]): Project => ({
    id,
    order,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    title,
    description: `Description for ${title}`,
    technologies,
    links: [],
    depth: {
      problem: 'Problem',
      approach: 'Approach',
      tradeoffs: [],
      outcomes: [],
      reflections: '',
    },
  });

  const manyProjects = [
    createProject('proj-1', 1, 'Project A', ['React', 'TypeScript']),
    createProject('proj-2', 2, 'Project B', ['Python', 'Docker']),
    createProject('proj-3', 3, 'Project C', ['React', 'Node.js']),
    createProject('proj-4', 4, 'Project D', ['TypeScript', 'Docker']),
    createProject('proj-5', 5, 'Project E', ['React', 'Python']),
    createProject('proj-6', 6, 'Project F', ['Node.js', 'Docker']),
  ];

  const fewProjects = manyProjects.slice(0, 3);

  it('shows filter when more than 5 projects', () => {
    render(<ProjectsSection projects={manyProjects} />);
    expect(screen.getByText('Filter by technology:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not show filter when 5 or fewer projects', () => {
    render(<ProjectsSection projects={fewProjects} />);
    expect(screen.queryByText('Filter by technology:')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('filters projects by technology when filter is selected', () => {
    render(<ProjectsSection projects={manyProjects} />);
    
    // Initially all 6 projects should be visible
    expect(screen.getAllByRole('button')).toHaveLength(6);
    
    // Select React filter
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'React' } });
    
    // Now only 3 projects with React should be visible (plus 1 clear filter button = 4)
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project C')).toBeInTheDocument();
    expect(screen.getByText('Project E')).toBeInTheDocument();
  });

  it('shows all projects when filter is cleared', () => {
    render(<ProjectsSection projects={manyProjects} />);
    
    // Select a filter
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'React' } });
    expect(screen.getAllByRole('button')).toHaveLength(4); // 3 items + clear button
    
    // Clear the filter
    const clearButton = screen.getByRole('button', { name: 'Clear filter' });
    fireEvent.click(clearButton);
    
    // All projects should be visible again (no clear button when no filter)
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('extracts unique technologies from all projects for filter options', () => {
    render(<ProjectsSection projects={manyProjects} />);
    
    // Should have unique technologies: Docker, Node.js, Python, React, TypeScript (sorted)
    expect(screen.getByRole('option', { name: 'All Technologies' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Docker' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Node.js' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Python' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument();
  });

  it('filters correctly when project has multiple matching technologies', () => {
    render(<ProjectsSection projects={manyProjects} />);
    
    // Select Docker filter
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Docker' } });
    
    // Projects B, D, and F have Docker (plus 1 clear filter button = 4)
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('Project B')).toBeInTheDocument();
    expect(screen.getByText('Project D')).toBeInTheDocument();
    expect(screen.getByText('Project F')).toBeInTheDocument();
  });
});
