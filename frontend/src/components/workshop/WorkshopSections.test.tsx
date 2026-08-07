import { render, screen } from '@testing-library/react';
import {
  WorkshopHero,
  WorkshopAgenda,
  WorkshopOutcome,
  WorkshopFramework,
  WorkshopDemarcation,
  WorkshopLegal,
  WorkshopForm,
} from './WorkshopSections';
import type { Workshop } from '@/db/schema';

/** Minimal workshop fixture — only fields used by the sections. */
function workshopFixture(overrides: Partial<Workshop> = {}): Workshop {
  return {
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
    adminToken: 'hashed-token-placeholder',
    createdAt: new Date('2026-08-07'),
    updatedAt: new Date('2026-08-07'),
    ...overrides,
  };
}

describe('WorkshopHero', () => {
  it('renders the headline and brand eyebrow', () => {
    render(<WorkshopHero workshop={null} />);
    expect(screen.getByRole('heading', { level: 1, name: /KI-Souveränität/ })).toBeInTheDocument();
    expect(screen.getByText('KI-Coaching mit Kante')).toBeInTheDocument();
  });

  it('renders the intro text from the vault copy', () => {
    render(<WorkshopHero workshop={null} />);
    expect(screen.getByText(/Bauchgefühl/)).toBeInTheDocument();
  });
});

describe('WorkshopAgenda', () => {
  it('renders five agenda blocks', () => {
    render(<WorkshopAgenda />);
    expect(screen.getByText(/1\. Lage/)).toBeInTheDocument();
    expect(screen.getByText(/5\. Abschluss/)).toBeInTheDocument();
  });
});

describe('WorkshopOutcome', () => {
  it('renders two artefact promises', () => {
    render(<WorkshopOutcome />);
    expect(screen.getByText(/Souveränitäts-Rechnung/)).toBeInTheDocument();
    expect(screen.getByText(/90-Tage-Roadmap/)).toBeInTheDocument();
  });
});

describe('WorkshopFramework', () => {
  it('shows the placeholder termin when termin is null', () => {
    render(<WorkshopFramework workshop={workshopFixture({ termin: null })} />);
    expect(screen.getByText(/Termin wird noch festgelegt/)).toBeInTheDocument();
  });

  it('shows a formatted termin when set', () => {
    render(<WorkshopFramework workshop={workshopFixture({ termin: new Date('2026-10-23T10:00:00Z') })} />);
    expect(screen.getByText(/23/)).toBeInTheDocument();
    expect(screen.getByText(/Okt/)).toBeInTheDocument();
  });

  it('shows the price label with 99 €', () => {
    render(<WorkshopFramework workshop={workshopFixture()} />);
    expect(screen.getByText(/99 € netto/)).toBeInTheDocument();
  });

  it('shows the pilot clause (ab 3)', () => {
    render(<WorkshopFramework workshop={workshopFixture()} />);
    expect(screen.getByText(/ab 3 angemeldeten/)).toBeInTheDocument();
  });
});

describe('WorkshopDemarcation', () => {
  it('renders the demarcation heading and body', () => {
    render(<WorkshopDemarcation />);
    expect(screen.getByRole('heading', { name: /NICHT bekommst/ })).toBeInTheDocument();
    expect(screen.getByText(/Folienschlacht/)).toBeInTheDocument();
  });
});

describe('WorkshopLegal', () => {
  it('renders storno conditions and links to the privacy page', () => {
    render(<WorkshopLegal />);
    expect(screen.getByText(/Verschiebung/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Datenschutzerklärung/ });
    expect(link).toHaveAttribute('href', '/datenschutz');
  });
});

describe('WorkshopForm', () => {
  it('shows the not-bookable placeholder when bookable is false', () => {
    render(<WorkshopForm bookable={false} />);
    expect(screen.getByText(/Termin wird noch festgelegt/)).toBeInTheDocument();
  });

  it('shows the form section heading when bookable', () => {
    render(<WorkshopForm bookable={true} />);
    expect(screen.getByRole('heading', { name: /Platz reservieren/ })).toBeInTheDocument();
  });

  it('shows the newsletter consent text when bookable', () => {
    render(<WorkshopForm bookable={true} />);
    expect(screen.getByText(/E-Mail-Adresse/)).toBeInTheDocument();
    expect(screen.getByText(/Abmeldung/)).toBeInTheDocument();
  });
});
