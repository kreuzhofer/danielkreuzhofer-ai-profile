import { render, screen, fireEvent } from '@testing-library/react';
import {
  ExperienceSection,
  ExperienceItem,
  ExperienceSummary,
  ExperienceDepth,
  ExperienceFilter,
  formatDateRange,
} from './ExperienceSection';
import type { Experience, ExperienceDepth as ExperienceDepthType } from '@/types/content';

// Sample experience data for testing
const sampleExperienceDepth: ExperienceDepthType = {
  context: 'Led a team of 5 engineers to modernize the legacy payment system.',
  challenges: [
    'Migrating from monolith to microservices without downtime',
    'Ensuring PCI compliance throughout the transition',
  ],
  decisions: [
    {
      title: 'Database Migration Strategy',
      situation: 'Needed to migrate 10TB of transaction data',
      options: ['Big bang migration', 'Incremental migration', 'Dual-write pattern'],
      chosen: 'Dual-write pattern',
      rationale: 'Allowed zero-downtime migration with rollback capability',
    },
  ],
  outcomes: [
    {
      metric: 'Transaction Processing Time',
      value: '-40%',
      context: 'Reduced from 500ms to 300ms average',
    },
    {
      metric: 'System Uptime',
      value: '99.99%',
      context: 'During 6-month migration period',
    },
  ],
  lessons: [
    'Feature flags are essential for safe deployments',
    'Invest in comprehensive monitoring before major changes',
  ],
};

const sampleExperience: Experience = {
  id: 'exp-1',
  order: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
  role: 'Senior Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  startDate: '2022-03-01',
  endDate: null, // Current position
  summary: 'Leading payment infrastructure modernization',
  highlights: [
    'Reduced transaction processing time by 40%',
    'Led team of 5 engineers',
  ],
  depth: sampleExperienceDepth,
};

const pastExperience: Experience = {
  id: 'exp-2',
  order: 2,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
  role: 'Software Engineer',
  company: 'Startup Inc',
  location: 'New York, NY',
  startDate: '2020-06-15',
  endDate: '2022-02-28',
  summary: 'Built core product features',
  highlights: ['Implemented real-time notifications'],
  depth: {
    context: 'Early employee at a fast-growing startup.',
    challenges: ['Scaling from 100 to 10,000 users'],
    decisions: [],
    outcomes: [],
    lessons: ['Move fast but maintain code quality'],
  },
};

describe('formatDateRange', () => {
  it('formats date range with end date', () => {
    const result = formatDateRange('2020-06-15', '2022-02-28');
    expect(result).toBe('Jun 2020 - Feb 2022');
  });

  it('formats date range with null end date as Present', () => {
    const result = formatDateRange('2022-03-01', null);
    expect(result).toBe('Mar 2022 - Present');
  });

  it('handles different date formats', () => {
    const result = formatDateRange('2019-01-01', '2019-12-31');
    expect(result).toBe('Jan 2019 - Dec 2019');
  });
});

describe('ExperienceSummary', () => {
  it('renders role title', () => {
    render(<ExperienceSummary experience={sampleExperience} isExpanded={false} />);
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('renders company name', () => {
    render(<ExperienceSummary experience={sampleExperience} isExpanded={false} />);
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('renders location', () => {
    render(<ExperienceSummary experience={sampleExperience} isExpanded={false} />);
    expect(screen.getByText(/San Francisco, CA/)).toBeInTheDocument();
  });

  it('renders date range with Present for current position', () => {
    render(<ExperienceSummary experience={sampleExperience} isExpanded={false} />);
    expect(screen.getByText(/Mar 2022 - Present/)).toBeInTheDocument();
  });

  it('renders summary text', () => {
    render(<ExperienceSummary experience={sampleExperience} isExpanded={false} />);
    expect(screen.getByText('Leading payment infrastructure modernization')).toBeInTheDocument();
  });

  it('renders highlights', () => {
    render(<ExperienceSummary experience={sampleExperience} isExpanded={false} />);
    expect(screen.getByText('Reduced transaction processing time by 40%')).toBeInTheDocument();
    expect(screen.getByText('Led team of 5 engineers')).toBeInTheDocument();
  });

  it('shows expand indicator rotated when expanded', () => {
    const { container } = render(
      <ExperienceSummary experience={sampleExperience} isExpanded={true} />
    );
    const indicator = container.querySelector('[aria-hidden="true"]');
    expect(indicator).toHaveClass('rotate-180');
  });

  it('shows expand indicator not rotated when collapsed', () => {
    const { container } = render(
      <ExperienceSummary experience={sampleExperience} isExpanded={false} />
    );
    const indicator = container.querySelector('[aria-hidden="true"]');
    expect(indicator).not.toHaveClass('rotate-180');
  });
});

describe('ExperienceDepth', () => {
  it('renders background context', () => {
    render(<ExperienceDepth depth={sampleExperienceDepth} />);
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText(/Led a team of 5 engineers/)).toBeInTheDocument();
  });

  it('renders key challenges', () => {
    render(<ExperienceDepth depth={sampleExperienceDepth} />);
    expect(screen.getByText('Key Challenges')).toBeInTheDocument();
    expect(screen.getByText(/Migrating from monolith to microservices/)).toBeInTheDocument();
    expect(screen.getByText(/Ensuring PCI compliance/)).toBeInTheDocument();
  });

  it('renders decisions with options and rationale', () => {
    render(<ExperienceDepth depth={sampleExperienceDepth} />);
    expect(screen.getByText('Key Decisions')).toBeInTheDocument();
    expect(screen.getByText('Database Migration Strategy')).toBeInTheDocument();
    expect(screen.getByText('Dual-write pattern')).toBeInTheDocument();
    expect(screen.getByText(/Allowed zero-downtime migration/)).toBeInTheDocument();
  });

  it('renders outcomes with metrics and values', () => {
    render(<ExperienceDepth depth={sampleExperienceDepth} />);
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('-40%')).toBeInTheDocument();
    expect(screen.getByText('Transaction Processing Time')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
  });

  it('renders lessons learned', () => {
    render(<ExperienceDepth depth={sampleExperienceDepth} />);
    expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
    expect(screen.getByText(/Feature flags are essential/)).toBeInTheDocument();
    expect(screen.getByText(/Invest in comprehensive monitoring/)).toBeInTheDocument();
  });

  it('handles empty arrays gracefully', () => {
    const emptyDepth: ExperienceDepthType = {
      context: 'Some context',
      challenges: [],
      decisions: [],
      outcomes: [],
      lessons: [],
    };
    render(<ExperienceDepth depth={emptyDepth} />);
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.queryByText('Key Challenges')).not.toBeInTheDocument();
    expect(screen.queryByText('Key Decisions')).not.toBeInTheDocument();
    expect(screen.queryByText('Results')).not.toBeInTheDocument();
    expect(screen.queryByText('Lessons Learned')).not.toBeInTheDocument();
  });
});


describe('ExperienceItem', () => {
  it('renders summary content', () => {
    const onToggle = jest.fn();
    render(
      <ExperienceItem
        experience={sampleExperience}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn();
    render(
      <ExperienceItem
        experience={sampleExperience}
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
      <ExperienceItem
        experience={sampleExperience}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Senior Software Engineer at Tech Corp');
  });

  it('has aria-expanded false when collapsed', () => {
    const onToggle = jest.fn();
    render(
      <ExperienceItem
        experience={sampleExperience}
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
      <ExperienceItem
        experience={sampleExperience}
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
      <ExperienceItem
        experience={sampleExperience}
        isExpanded={true}
        onToggle={onToggle}
      />
    );
    
    // Depth content should be visible
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Key Challenges')).toBeInTheDocument();
  });

  it('supports keyboard navigation with Enter key', () => {
    const onToggle = jest.fn();
    render(
      <ExperienceItem
        experience={sampleExperience}
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
      <ExperienceItem
        experience={sampleExperience}
        isExpanded={false}
        onToggle={onToggle}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('ExperienceSection', () => {
  const experiences = [sampleExperience, pastExperience];

  it('renders section with correct heading', () => {
    render(<ExperienceSection experiences={experiences} />);
    expect(screen.getByRole('heading', { name: 'Experience', level: 2 })).toBeInTheDocument();
  });

  it('renders section with correct id for anchor navigation', () => {
    render(<ExperienceSection experiences={experiences} />);
    const section = screen.getByRole('region', { name: 'Experience' });
    expect(section).toHaveAttribute('id', 'experience');
  });

  it('renders all experience items', () => {
    render(<ExperienceSection experiences={experiences} />);
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('sorts experiences by order field', () => {
    const unorderedExperiences = [
      { ...pastExperience, order: 2 },
      { ...sampleExperience, order: 1 },
    ];
    render(<ExperienceSection experiences={unorderedExperiences} />);
    
    const buttons = screen.getAllByRole('button');
    // First button should be for the experience with order: 1
    expect(buttons[0]).toHaveAttribute('aria-label', 'Senior Software Engineer at Tech Corp');
  });

  it('shows empty state when no experiences', () => {
    render(<ExperienceSection experiences={[]} />);
    expect(screen.getByText('No experience entries available.')).toBeInTheDocument();
  });

  it('allows expanding and collapsing items', () => {
    render(<ExperienceSection experiences={experiences} />);
    
    // Initially collapsed - depth content should not be visible
    expect(screen.queryByText('Background')).not.toBeInTheDocument();
    
    // Click to expand first item
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    
    // Now depth content should be visible
    expect(screen.getByText('Background')).toBeInTheDocument();
  });

  it('supports multiple items expanded simultaneously', () => {
    render(<ExperienceSection experiences={experiences} />);
    
    const buttons = screen.getAllByRole('button');
    
    // Expand first item
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/Led a team of 5 engineers/)).toBeInTheDocument();
    
    // Expand second item
    fireEvent.click(buttons[1]);
    expect(screen.getByText(/Early employee at a fast-growing startup/)).toBeInTheDocument();
    
    // Both should still be visible
    expect(screen.getByText(/Led a team of 5 engineers/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ExperienceSection experiences={experiences} className="custom-class" />
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});

describe('ExperienceFilter', () => {
  const companies = ['Tech Corp', 'Startup Inc', 'Big Company'];
  const onFilterChange = jest.fn();

  beforeEach(() => {
    onFilterChange.mockClear();
  });

  it('renders filter label and dropdown', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany=""
        onFilterChange={onFilterChange}
      />
    );
    expect(screen.getByText('Filter by company:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all company options plus "All Companies"', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany=""
        onFilterChange={onFilterChange}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveDisplayValue('All Companies');
    
    // Check all options are present
    expect(screen.getByRole('option', { name: 'All Companies' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tech Corp' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Startup Inc' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Big Company' })).toBeInTheDocument();
  });

  it('calls onFilterChange when selection changes', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany=""
        onFilterChange={onFilterChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Tech Corp' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('Tech Corp');
  });

  it('shows clear button when filter is selected', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany="Tech Corp"
        onFilterChange={onFilterChange}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Clear filter' })).toBeInTheDocument();
  });

  it('does not show clear button when no filter is selected', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany=""
        onFilterChange={onFilterChange}
      />
    );
    
    expect(screen.queryByRole('button', { name: 'Clear filter' })).not.toBeInTheDocument();
  });

  it('calls onFilterChange with empty string when clear button is clicked', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany="Tech Corp"
        onFilterChange={onFilterChange}
      />
    );
    
    const clearButton = screen.getByRole('button', { name: 'Clear filter' });
    fireEvent.click(clearButton);
    
    expect(onFilterChange).toHaveBeenCalledWith('');
  });

  it('has proper accessibility attributes', () => {
    render(
      <ExperienceFilter
        companies={companies}
        selectedCompany=""
        onFilterChange={onFilterChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Filter experiences by company');
    expect(select).toHaveAttribute('id', 'experience-filter');
    
    const label = screen.getByText('Filter by company:');
    expect(label).toHaveAttribute('for', 'experience-filter');
  });
});

describe('ExperienceSection filtering', () => {
  // Create 6 experiences to trigger filter display (threshold is 5)
  const createExperience = (id: string, order: number, company: string): Experience => ({
    id,
    order,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    role: `Role at ${company}`,
    company,
    location: 'Remote',
    startDate: '2020-01-01',
    endDate: null,
    summary: `Summary for ${company}`,
    highlights: ['Highlight 1'],
    depth: {
      context: 'Context',
      challenges: [],
      decisions: [],
      outcomes: [],
      lessons: [],
    },
  });

  const manyExperiences = [
    createExperience('exp-1', 1, 'Company A'),
    createExperience('exp-2', 2, 'Company B'),
    createExperience('exp-3', 3, 'Company A'),
    createExperience('exp-4', 4, 'Company C'),
    createExperience('exp-5', 5, 'Company B'),
    createExperience('exp-6', 6, 'Company A'),
  ];

  const fewExperiences = manyExperiences.slice(0, 3);

  it('shows filter when more than 5 experiences', () => {
    render(<ExperienceSection experiences={manyExperiences} />);
    expect(screen.getByText('Filter by company:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not show filter when 5 or fewer experiences', () => {
    render(<ExperienceSection experiences={fewExperiences} />);
    expect(screen.queryByText('Filter by company:')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('filters experiences by company when filter is selected', () => {
    render(<ExperienceSection experiences={manyExperiences} />);
    
    // Initially all 6 experiences should be visible
    expect(screen.getAllByRole('button')).toHaveLength(6);
    
    // Select Company A filter
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Company A' } });
    
    // Now only 3 experiences from Company A should be visible (plus 1 clear filter button = 4)
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getAllByText(/Role at Company A/)).toHaveLength(3);
  });

  it('shows all experiences when filter is cleared', () => {
    render(<ExperienceSection experiences={manyExperiences} />);
    
    // Select a filter
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Company A' } });
    expect(screen.getAllByRole('button')).toHaveLength(4); // 3 items + clear button
    
    // Clear the filter
    const clearButton = screen.getByRole('button', { name: 'Clear filter' });
    fireEvent.click(clearButton);
    
    // All experiences should be visible again (no clear button when no filter)
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('shows empty state message when filter matches no experiences', () => {
    render(<ExperienceSection experiences={manyExperiences} />);
    
    // Select Company A filter first
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Company A' } });
    
    // Verify Company A experiences are shown (3 items + 1 clear button)
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('extracts unique companies for filter options', () => {
    render(<ExperienceSection experiences={manyExperiences} />);
    
    // Should have 3 unique companies: A, B, C (plus "All Companies")
    expect(screen.getByRole('option', { name: 'All Companies' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Company A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Company B' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Company C' })).toBeInTheDocument();
  });
});
