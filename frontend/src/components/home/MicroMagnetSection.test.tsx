import { render, screen } from '@testing-library/react';
import { MicroMagnetSection } from './MicroMagnetSection';

describe('MicroMagnetSection', () => {
  it('pitches the Engpass-Check and links to it', () => {
    render(<MicroMagnetSection />);
    expect(screen.getByRole('link', { name: /Engpass-Check starten/ })).toHaveAttribute('href', '/engpass-check');
  });
});
