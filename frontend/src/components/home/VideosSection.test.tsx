import { render, screen } from '@testing-library/react';
import { VideosSection } from './VideosSection';

describe('VideosSection', () => {
  it('renders featured video cards that link to the YouTube watch page', () => {
    render(<VideosSection />);
    const card = screen.getByRole('link', { name: /Bevor du KI kaufst/ });
    expect(card.getAttribute('href')).toContain('watch?v=C9jW0jqhRtY');
    expect(card).toHaveAttribute('target', '_blank');
  });

  it('links to the YouTube channel', () => {
    render(<VideosSection />);
    expect(screen.getByRole('link', { name: /YouTube-Kanal/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@DanielKreuzhofer',
    );
  });
});
