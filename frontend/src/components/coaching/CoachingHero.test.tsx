import { render, screen } from '@testing-library/react';
import { CoachingHero } from './CoachingHero';

describe('CoachingHero', () => {
  it('renders the headline and the brand eyebrow', () => {
    render(<CoachingHero />);
    expect(screen.getByRole('heading', { level: 1, name: /90 Tagen/ })).toBeInTheDocument();
    expect(screen.getByText('KI-Coaching mit Kante')).toBeInTheDocument();
  });

  it('links the primary CTA to the external Calendly booking URL in a new tab', () => {
    render(<CoachingHero />);
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('links the secondary CTA to the Engpass-Check', () => {
    render(<CoachingHero />);
    expect(screen.getByRole('link', { name: /Engpass-Check/ })).toHaveAttribute('href', '/engpass-check');
  });
});
