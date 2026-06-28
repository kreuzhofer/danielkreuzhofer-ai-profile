import { render, screen } from '@testing-library/react';
import { LandingSection } from './LandingSection';

const props = {
  eyebrow: 'Für wen',
  heading: 'Bereichsleiter mit KI-Mandat',
  intro: 'Kurzer Einleitungssatz.',
  bullets: ['Punkt eins', 'Punkt zwei'],
  accent: 'secondary' as const,
};

describe('LandingSection', () => {
  it('renders eyebrow, heading, intro and all bullets', () => {
    render(<LandingSection id="for-whom" {...props} />);
    expect(screen.getByText('Für wen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bereichsleiter mit KI-Mandat' })).toBeInTheDocument();
    expect(screen.getByText('Kurzer Einleitungssatz.')).toBeInTheDocument();
    expect(screen.getByText('Punkt eins')).toBeInTheDocument();
    expect(screen.getByText('Punkt zwei')).toBeInTheDocument();
  });

  it('exposes the section id for the page anchor map', () => {
    const { container } = render(<LandingSection id="problem" {...props} />);
    expect(container.querySelector('section#problem')).not.toBeNull();
  });
});
