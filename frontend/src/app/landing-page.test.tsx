import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home (coaching landing)', () => {
  it('renders the coaching hero headline, the method, the price and the final CTA', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1, name: /90 Tagen/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Smart AI Wins System/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /5\.900 € netto/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Startklar?' })).toBeInTheDocument();
  });

  it('renders the three landing list-sections (Für wen, Problem, Ergebnis)', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Bereichsleiter im Mittelstand/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /wo anfangen/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /echter Win/ })).toBeInTheDocument();
  });
});
