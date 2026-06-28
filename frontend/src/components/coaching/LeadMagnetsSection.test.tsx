import { render, screen } from '@testing-library/react';
import { LeadMagnetsSection } from './LeadMagnetsSection';

describe('LeadMagnetsSection', () => {
  it('renders all three lead-magnet cards with internal links', () => {
    render(<LeadMagnetsSection />);
    expect(screen.getByRole('link', { name: /KI-Engpass-Check/ })).toHaveAttribute('href', '/engpass-check');
    expect(screen.getByRole('link', { name: /KI-Führungs-Check/ })).toHaveAttribute('href', '/ki-fuehrungs-check');
    expect(screen.getByRole('link', { name: /DSGVO-Check/ })).toHaveAttribute('href', '/dsgvo-check');
  });

  it('does not render a YouTube link when no channel URL is configured', () => {
    render(<LeadMagnetsSection />);
    expect(screen.queryByRole('link', { name: /YouTube/ })).not.toBeInTheDocument();
  });
});
