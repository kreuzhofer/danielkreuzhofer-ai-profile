import { render, screen } from '@testing-library/react';
import { ContentHero } from './ContentHero';

describe('ContentHero', () => {
  it('renders the POV headline with a micro-magnet primary CTA and a videos CTA', () => {
    render(<ContentHero />);
    expect(screen.getByRole('heading', { level: 1, name: /Klartext zu KI/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Engpass-Check/ })).toHaveAttribute('href', '/engpass-check');
    expect(screen.getByRole('link', { name: /Videos ansehen/ })).toHaveAttribute('href', '#videos');
  });
});
