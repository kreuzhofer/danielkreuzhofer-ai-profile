import { render, screen } from '@testing-library/react';
import { Card } from './Card';

// Mock hooks
jest.mock('@/hooks', () => ({
  useReducedMotion: jest.fn(() => false),
  useScrollAnimation: jest.fn(() => ({
    ref: jest.fn(),
    isInView: true,
    animationStyle: { opacity: 1, transform: 'translateY(0)' },
  })),
}));

import { useReducedMotion, useScrollAnimation } from '@/hooks';

const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;
const mockUseScrollAnimation = useScrollAnimation as jest.MockedFunction<typeof useScrollAnimation>;

describe('Card', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    mockUseScrollAnimation.mockReturnValue({
      ref: jest.fn(),
      isInView: true,
      animationStyle: { opacity: 1, transform: 'translateY(0)' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
    });
  });

  describe('variants', () => {
    it('applies default variant classes by default', () => {
      render(<Card data-testid="card">Default</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-white');
    });

    it('applies outlined variant classes', () => {
      render(<Card data-testid="card" variant="outlined">Outlined</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-transparent');
      expect(card).toHaveClass('border');
    });

    it('applies elevated variant classes', () => {
      render(<Card data-testid="card" variant="elevated">Elevated</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-lg');
    });
  });

  describe('hoverable', () => {
    it('applies hover classes by default', () => {
      render(<Card data-testid="card">Hoverable</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:-translate-y-1');
    });

    it('does not apply hover classes when hoverable is false', () => {
      render(<Card data-testid="card" hoverable={false}>Not Hoverable</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('hover:-translate-y-1');
    });

    it('does not apply hover classes when reduced motion is preferred', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<Card data-testid="card">Reduced Motion</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('hover:-translate-y-1');
    });
  });

  describe('animateOnScroll', () => {
    it('uses scroll animation by default', () => {
      render(<Card>Animated</Card>);
      expect(mockUseScrollAnimation).toHaveBeenCalledWith({
        threshold: 0.1,
        triggerOnce: true,
        respectReducedMotion: true,
      });
    });

    it('applies animation style when animateOnScroll is true', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: jest.fn(),
        isInView: true,
        animationStyle: { opacity: 1, transform: 'translateY(0)' },
      });
      render(<Card data-testid="card">Animated</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveStyle({ opacity: 1 });
    });

    it('does not apply animation style when animateOnScroll is false', () => {
      render(<Card data-testid="card" animateOnScroll={false}>Not Animated</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveStyle({ opacity: 0 });
    });
  });

  describe('CSS containment', () => {
    it('applies CSS containment classes for performance', () => {
      render(<Card data-testid="card">Contained</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('contain-layout');
      expect(card).toHaveClass('contain-paint');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Card data-testid="card" className="custom-class">Custom</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('base styling', () => {
    it('has rounded corners', () => {
      render(<Card data-testid="card">Rounded</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg');
    });

    it('has padding', () => {
      render(<Card data-testid="card">Padded</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-6');
    });
  });
});
