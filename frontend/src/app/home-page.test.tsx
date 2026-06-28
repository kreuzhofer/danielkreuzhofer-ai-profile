import { render, screen } from '@testing-library/react';

// Avoid a live RSS fetch in tests — the home page loads videos via getLatestVideos.
jest.mock('@/lib/youtube', () => ({
  getLatestVideos: jest.fn(async () => require('@/components/home/content').FEATURED_VIDEOS),
}));

import Home from './page';

describe('Home (top-of-funnel content entry)', () => {
  it('leads with the content POV and the micro-magnet as primary CTA — no sales call', async () => {
    render(await Home());
    expect(screen.getByRole('heading', { level: 1, name: /Klartext zu KI/ })).toBeInTheDocument();
    const engpass = screen.getAllByRole('link', { name: /Engpass-Check/ });
    expect(engpass.length).toBeGreaterThan(0);
    expect(engpass.every((l) => l.getAttribute('href') === '/engpass-check')).toBe(true);
    // top-of-funnel page must NOT push the BOFU sales call
    expect(screen.queryByText(/Erstgespräch/)).not.toBeInTheDocument();
  });

  it('promotes content (videos) and softly points warm leads to /coaching', async () => {
    render(await Home());
    expect(screen.getByRole('heading', { name: /Neueste Videos/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Coaching ansehen/ })).toHaveAttribute('href', '/coaching');
  });
});
