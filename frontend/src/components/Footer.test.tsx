import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('shows the current slogan, not the old coaching claim', () => {
    render(<Footer />);
    expect(screen.getByText(/© Daniel Kreuzhofer · Cloud\. AI\. Clarity\./)).toBeInTheDocument();
    expect(screen.queryByText(/KI-Coaching mit Kante/)).not.toBeInTheDocument();
  });

  it('links the legal pages with English labels', () => {
    render(<Footer />);
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Legal Notice' })).toHaveAttribute('href', '/impressum');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/datenschutz');
  });
});
