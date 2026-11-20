import { render, screen } from '@testing-library/react';
import LegalLayout from './layout';

describe('LegalLayout', () => {
  it('shows the current slogan in the header, not the old coaching claim', () => {
    render(<LegalLayout><p>Inhalt</p></LegalLayout>);
    expect(screen.getByText('Cloud. AI. Clarity.')).toBeInTheDocument();
    expect(screen.queryByText(/KI-Coaching mit Kante/)).not.toBeInTheDocument();
  });

  it('marks the (German) legal content as lang="de" on an English site', () => {
    const { container } = render(<LegalLayout><p>Inhalt</p></LegalLayout>);
    expect(container.querySelector('.legal-page')).toHaveAttribute('lang', 'de');
  });
});
