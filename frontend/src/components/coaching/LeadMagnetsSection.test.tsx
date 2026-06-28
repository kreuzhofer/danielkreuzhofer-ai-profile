import { render, screen } from '@testing-library/react';
import { LeadMagnetsSection } from './LeadMagnetsSection';

describe('LeadMagnetsSection', () => {
  it('renders all three lead-magnet cards with internal links', () => {
    render(<LeadMagnetsSection />);
    expect(screen.getByRole('link', { name: /KI-Engpass-Check/ })).toHaveAttribute('href', '/engpass-check');
    expect(screen.getByRole('link', { name: /KI-Führungs-Check/ })).toHaveAttribute('href', '/ki-fuehrungs-check');
    expect(screen.getByRole('link', { name: /DSGVO-Check/ })).toHaveAttribute('href', '/dsgvo-check');
  });

  it('renders the YouTube channel link as an external link', () => {
    render(<LeadMagnetsSection />);
    const yt = screen.getByRole('link', { name: /YouTube/ });
    expect(yt).toHaveAttribute('href', 'https://www.youtube.com/@DanielKreuzhofer');
    expect(yt).toHaveAttribute('target', '_blank');
    expect(yt).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
