import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';
import { ChatProvider } from '@/context/ChatContext';

// Mock useReducedMotion hook
jest.mock('@/hooks', () => ({
  useReducedMotion: jest.fn(() => false),
}));

import { useReducedMotion } from '@/hooks';

const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

// Helper to render with ChatProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ChatProvider>{ui}</ChatProvider>);
};

describe('HeroSection', () => {
  const defaultProps = {
    headline: 'Building Solutions That Matter',
    tagline: 'Senior Solutions Architect with 15+ years of experience',
  };

  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('content rendering', () => {
    it('renders headline correctly', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(defaultProps.headline);
    });

    it('renders tagline correctly', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      expect(screen.getByText(defaultProps.tagline)).toBeInTheDocument();
    });

    it('renders CTA button with default text', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Explore My Work' })).toBeInTheDocument();
    });

    it('renders CTA button with custom text', () => {
      renderWithProvider(<HeroSection {...defaultProps} ctaText="Learn More" />);
      expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('CTA button has correct default href', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Explore My Work' })).toHaveAttribute('href', '#about');
    });

    it('CTA button has custom href when provided', () => {
      renderWithProvider(<HeroSection {...defaultProps} ctaHref="#contact" />);
      expect(screen.getByRole('link', { name: 'Explore My Work' })).toHaveAttribute('href', '#contact');
    });

    it('renders Ask AI button', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      expect(screen.getByRole('button', { name: /ask ai about me/i })).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies gradient background class', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      const section = screen.getByRole('region', { name: 'Hero section' });
      expect(section).toHaveClass('bg-[var(--gradient-hero)]');
    });

    it('applies custom className when provided', () => {
      renderWithProvider(<HeroSection {...defaultProps} className="custom-class" />);
      const section = screen.getByRole('region', { name: 'Hero section' });
      expect(section).toHaveClass('custom-class');
    });

    it('has min-height accounting for navigation', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      const section = screen.getByRole('region', { name: 'Hero section' });
      expect(section).toHaveClass('min-h-[calc(100vh-4rem)]');
    });
  });

  describe('animations', () => {
    it('applies animation classes when reduced motion is not preferred', () => {
      mockUseReducedMotion.mockReturnValue(false);
      renderWithProvider(<HeroSection {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('animate-fade-in-up');
    });

    it('does not apply animation classes when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);
      renderWithProvider(<HeroSection {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).not.toHaveClass('animate-fade-in-up');
      expect(heading).toHaveClass('opacity-100');
    });

    it('shows scroll indicator when reduced motion is not preferred', () => {
      mockUseReducedMotion.mockReturnValue(false);
      renderWithProvider(<HeroSection {...defaultProps} />);
      // The scroll indicator SVG should be present (there are multiple SVGs now including chat icon)
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('shows scroll indicator without animation when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);
      renderWithProvider(<HeroSection {...defaultProps} />);
      // The scroll indicator should be present but without bounce animation
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
      const scrollIndicator = document.querySelector('.animate-bounce');
      expect(scrollIndicator).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper section landmark with aria-label', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      expect(screen.getByRole('region', { name: 'Hero section' })).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('decorative elements are hidden from screen readers', () => {
      mockUseReducedMotion.mockReturnValue(false);
      renderWithProvider(<HeroSection {...defaultProps} />);
      // The gradient overlay and scroll indicator should have aria-hidden
      const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });
  });

  describe('responsive layout', () => {
    it('has responsive text sizes for headline', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl');
      expect(heading).toHaveClass('md:text-5xl');
      expect(heading).toHaveClass('lg:text-6xl');
    });

    it('has responsive text sizes for tagline', () => {
      renderWithProvider(<HeroSection {...defaultProps} />);
      const tagline = screen.getByText(defaultProps.tagline);
      expect(tagline).toHaveClass('text-lg');
      expect(tagline).toHaveClass('md:text-xl');
      expect(tagline).toHaveClass('lg:text-2xl');
    });
  });
});
