import { render, screen } from '@testing-library/react';
import WorkshopPage from './page';
import { getWorkshopBySlug } from '@/lib/workshop/queries';

jest.mock('@/lib/workshop/queries', () => ({
  getWorkshopBySlug: jest.fn(),
}));

describe('WorkshopPage (/workshop/ki-souveraenitaet)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the hero, agenda, outcome, framework, demarcation, and legal sections', async () => {
    (getWorkshopBySlug as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      slug: 'ki-souveraenitaet',
      title: 'KI-Souveränität im Mittelstand',
      termin: null,
      durationMin: 90,
      priceNetEur: 99,
      capacity: 5,
      minBookedToRun: 3,
      status: 'scheduled',
      format: 'live_online',
      locationLabel: 'live online',
      recordingHint: true,
      adminToken: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const params = Promise.resolve({ slug: 'ki-souveraenitaet' });
    const html = await WorkshopPage({ params });
    render(html);
    expect(screen.getByRole('heading', { level: 1, name: /KI-Souveränität/ })).toBeInTheDocument();
    expect(screen.getByText(/1 · Lage/)).toBeInTheDocument();
    expect(screen.getByText('Souveränitäts-Rechnung')).toBeInTheDocument();
    expect(screen.getByText(/99 € netto/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /NICHT bekommst/ })).toBeInTheDocument();
    expect(screen.getByText(/Fable-5/)).toBeInTheDocument();
    expect(screen.getByText(/DSK-Kriterien/)).toBeInTheDocument();
  });

  it('shows the not-bookable placeholder when termin is null', async () => {
    (getWorkshopBySlug as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      slug: 'ki-souveraenitaet',
      title: 'KI-Souveränität im Mittelstand',
      termin: null,
      durationMin: 90,
      priceNetEur: 99,
      capacity: 5,
      minBookedToRun: 3,
      status: 'scheduled',
      format: 'live_online',
      locationLabel: 'live online',
      recordingHint: true,
      adminToken: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const params = Promise.resolve({ slug: 'ki-souveraenitaet' });
    const html = await WorkshopPage({ params });
    render(html);
    expect(screen.getByText(/Anmeldung aktuell nicht möglich/)).toBeInTheDocument();
  });

  it('shows the form section when termin is set', async () => {
    (getWorkshopBySlug as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      slug: 'ki-souveraenitaet',
      title: 'KI-Souveränität im Mittelstand',
      termin: new Date('2026-10-23T10:00:00Z'),
      durationMin: 90,
      priceNetEur: 99,
      capacity: 5,
      minBookedToRun: 3,
      status: 'scheduled',
      format: 'live_online',
      locationLabel: 'live online',
      recordingHint: true,
      adminToken: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const params = Promise.resolve({ slug: 'ki-souveraenitaet' });
    const html = await WorkshopPage({ params });
    render(html);
    expect(screen.getByRole('heading', { name: /Platz reservieren/ })).toBeInTheDocument();
  });
});
