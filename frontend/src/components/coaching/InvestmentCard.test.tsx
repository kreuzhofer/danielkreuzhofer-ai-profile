import { render, screen } from '@testing-library/react';
import { InvestmentCard } from './InvestmentCard';

describe('InvestmentCard', () => {
  it('renders the price and every included item', () => {
    render(<InvestmentCard />);
    expect(screen.getByRole('heading', { name: /5\.900 € netto/ })).toBeInTheDocument();
    expect(screen.getByText(/Zugang zum 90-Tage-Pilot-System/)).toBeInTheDocument();
  });

  it('renders the booking CTA to Calendly in a new tab', () => {
    render(<InvestmentCard />);
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
  });
});
