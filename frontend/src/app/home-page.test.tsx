import { render, screen } from '@testing-library/react';
import { ChatProvider } from '@/context/ChatContext';

// Avoid a live RSS fetch in tests — the home page loads videos via getLatestVideos.
jest.mock('@/lib/youtube', () => ({
  getLatestVideos: jest.fn(async () => require('@/components/home/content').FEATURED_VIDEOS),
}));

import Home, { metadata } from './page';

async function renderHome() {
  const page = await Home();
  render(<ChatProvider>{page}</ChatProvider>);
}

describe('Home (personal profile)', () => {
  it('leads with the profile hero and contact section', async () => {
    await renderHome();
    expect(screen.getByRole('heading', { level: 1, name: /Daniel Kreuzhofer/ })).toBeInTheDocument();
    expect(document.getElementById('about')).toBeInTheDocument();
    expect(document.getElementById('experience')).toBeInTheDocument();
    expect(document.getElementById('contact')).toBeInTheDocument();
  });

  it('shows the "What I built" demos linking to both tools', async () => {
    await renderHome();
    expect(screen.getByRole('link', { name: /Skills Transparency|Transparenz/ })).toHaveAttribute('href', '/transparency');
    expect(screen.getByRole('link', { name: /Fit.?Analys/i })).toHaveAttribute('href', '/fit-analysis');
  });

  it('keeps the latest videos and blog teaser below the profile', async () => {
    await renderHome();
    expect(screen.getByRole('heading', { name: /Latest videos/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /From the blog/ })).toBeInTheDocument();
  });

  it('no longer pushes coaching, the sales call, or the old /about page', async () => {
    await renderHome();
    expect(screen.queryByText(/Erstgespräch/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Coaching ansehen/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mehr über mich/ })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('link').some((l) => l.getAttribute('href') === '/about')
    ).toBe(false);
  });

  it('renders the profile in English (no German UI copy left over)', async () => {
    await renderHome();
    for (const german of [/KI-Coaching mit Kante/, /Was ich gebaut habe/, /Zwei Tools/, /Neueste Videos/, /Zum YouTube-Kanal/, /Alle Artikel/, /Kontakt/, /fachliche/]) {
      expect(screen.queryByText(german)).not.toBeInTheDocument();
    }
    expect(screen.getByText(/What I built/)).toBeInTheDocument();
  });

  it('uses an English profile title and description without the coaching claim', () => {
    expect(String(metadata.description)).not.toMatch(/Werdegang|Projekte/);
    expect(String(metadata.title)).toMatch(/Daniel Kreuzhofer/);
    expect(String(metadata.title)).not.toMatch(/Coaching/i);
  });
});
