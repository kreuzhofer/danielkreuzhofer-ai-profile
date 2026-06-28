import { render, screen } from '@testing-library/react';
import { FaqSection } from './FaqSection';

describe('FaqSection', () => {
  it('renders every question as a summary', () => {
    render(<FaqSection />);
    expect(screen.getByText('Ist das Coaching oder Umsetzung?')).toBeInTheDocument();
    expect(screen.getByText('Mit welchen Tools arbeiten wir?')).toBeInTheDocument();
    expect(screen.getByText(/Wie viel Zeit/)).toBeInTheDocument();
    expect(screen.getByText(/nicht technisch/)).toBeInTheDocument();
  });

  it('renders each answer text', () => {
    render(<FaqSection />);
    expect(screen.getByText(/Done-With-You, nicht Done-For-You/)).toBeInTheDocument();
  });
});
