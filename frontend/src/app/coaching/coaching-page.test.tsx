import { render, screen } from '@testing-library/react';
import CoachingPage from './page';

describe('CoachingPage (offer sales-landing at /coaching)', () => {
  it('renders the coaching hero, the method, the price and the final CTA', () => {
    render(<CoachingPage />);
    expect(screen.getByRole('heading', { level: 1, name: /90 Tagen/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /90-Tage-Pilot-System/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /5\.900 € netto/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Dein nächster Schritt/ })).toBeInTheDocument();
  });
});
