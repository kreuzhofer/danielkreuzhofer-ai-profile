import React from 'react';
import { render, screen } from '@testing-library/react';
import { FloatingContactButton } from './FloatingContactButton';

describe('FloatingContactButton', () => {
  /**
   * Validates: Requirement 8.3
   * WHILE viewing any Content_Section, THE Content_Architecture SHALL provide a subtle, persistent contact option
   */
  it('renders a persistent contact button', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toBeInTheDocument();
  });

  it('links to the contact section by default', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveAttribute('href', '#contact');
  });

  it('accepts custom href', () => {
    render(<FloatingContactButton href="#custom-contact" />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveAttribute('href', '#custom-contact');
  });

  /**
   * Validates: Requirement 8.4
   * THE Contact engagement paths SHALL use inviting language
   */
  it('has inviting aria-label by default', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveAttribute('aria-label', "Let's connect - scroll to contact section");
  });

  it('accepts custom aria-label', () => {
    render(<FloatingContactButton ariaLabel="Get in touch" />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveAttribute('aria-label', 'Get in touch');
  });

  /**
   * Validates: Requirement 5.2
   * WHEN viewed on Mobile_Viewport, THE Expansion_Controls SHALL have touch targets of at least 44x44 pixels
   */
  it('has minimum touch target size classes', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    // Check for minimum size classes
    expect(button).toHaveClass('min-w-[44px]');
    expect(button).toHaveClass('min-h-[44px]');
  });

  it('has fixed positioning for persistence', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveClass('fixed');
  });

  it('is positioned in bottom-right corner', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveClass('bottom-6');
    expect(button).toHaveClass('right-6');
  });

  it('has proper z-index for visibility', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveClass('z-40');
  });

  it('applies custom className', () => {
    render(<FloatingContactButton className="custom-class" />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveClass('custom-class');
  });

  it('contains an icon', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('has screen reader text', () => {
    render(<FloatingContactButton />);
    
    expect(screen.getByText('Contact me')).toBeInTheDocument();
    expect(screen.getByText('Contact me')).toHaveClass('sr-only');
  });

  it('is keyboard accessible as a link', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByRole('link');
    expect(button).toBeInTheDocument();
  });

  it('has focus styles for accessibility', () => {
    render(<FloatingContactButton />);
    
    const button = screen.getByTestId('floating-contact-button');
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
  });
});
