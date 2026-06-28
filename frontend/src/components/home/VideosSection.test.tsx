import { render, screen } from '@testing-library/react';
import { VideosSection } from './VideosSection';

describe('VideosSection', () => {
  it('embeds the privacy-friendly latest-videos playlist', () => {
    const { container } = render(<VideosSection />);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toContain('youtube-nocookie.com');
    expect(iframe?.getAttribute('src')).toContain('UUAtR5ksFgUGuehXA4BMJwCw');
  });

  it('links to the YouTube channel', () => {
    render(<VideosSection />);
    expect(screen.getByRole('link', { name: /YouTube-Kanal/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@DanielKreuzhofer',
    );
  });
});
