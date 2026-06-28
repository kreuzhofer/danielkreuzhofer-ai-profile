import { render, screen } from '@testing-library/react';
import { FinalCtaSection } from './FinalCtaSection';

describe('FinalCtaSection', () => {
  it('renders the closing heading and booking CTA', () => {
    render(<FinalCtaSection />);
    expect(screen.getByRole('heading', { name: 'Ihr nächster Schritt' })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
  });
});
