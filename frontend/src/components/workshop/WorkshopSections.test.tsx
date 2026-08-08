import { render, screen } from '@testing-library/react';
import {
  WorkshopHero,
  WorkshopAtAGlance,
  WorkshopOutcome,
  WorkshopAgenda,
  WorkshopDemarcation,
  WorkshopFramework,
  WorkshopLegal,
  WorkshopFormPlaceholder,
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
    render(<WorkshopHero />);
    expect(screen.getByRole('heading', { level: 1, name: /KI-Souveränität/ })).toBeInTheDocument();
    expect(screen.getByText('KI-Coaching mit Kante')).toBeInTheDocument();
  });

  it('renders the Kante intro', () => {
    render(<WorkshopHero />);
    expect(screen.getByText(/Bauchgefühl/)).toBeInTheDocument();
  });
});

describe('WorkshopAtAGlance', () => {
  it('shows the placeholder termin when termin is null', () => {
    render(<WorkshopAtAGlance workshop={workshopFixture({ termin: null })} />);
    expect(screen.getByText(/Termin wird noch festgelegt/)).toBeInTheDocument();
  });

  it('shows a formatted termin when set', () => {
    render(<WorkshopAtAGlance workshop={workshopFixture({ termin: new Date('2026-10-23T10:00:00Z') })} />);
    expect(screen.getByText(/23/)).toBeInTheDocument();
    expect(screen.getByText(/Okt/)).toBeInTheDocument();
  });

  it('shows price, capacity, pre-work and payment facts', () => {
    render(<WorkshopAtAGlance workshop={workshopFixture()} />);
    expect(screen.getByText(/99 € netto/)).toBeInTheDocument();
    expect(screen.getByText(/5 Plätze/)).toBeInTheDocument();
    expect(screen.getByText(/Pre-Work/)).toBeInTheDocument();
    expect(screen.getByText(/keine Kreditkarte/)).toBeInTheDocument();
  });
});

describe('WorkshopOutcome', () => {
  it('renders two artefact cards', () => {
    render(<WorkshopOutcome />);
    expect(screen.getByText('Souveränitäts-Rechnung')).toBeInTheDocument();
    expect(screen.getByText('90-Tage-Roadmap')).toBeInTheDocument();
    expect(screen.getByText(/vorstandstauglich/)).toBeInTheDocument();
  });
});

describe('WorkshopAgenda', () => {
  it('renders five agenda blocks', () => {
    render(<WorkshopAgenda />);
    expect(screen.getByText(/1 · Lage/)).toBeInTheDocument();
    expect(screen.getByText(/5 · Abschluss/)).toBeInTheDocument();
  });

  it('marks the blocks that produce the artefacts', () => {
    render(<WorkshopAgenda />);
    expect(screen.getByText(/→ Deine Rechnung/)).toBeInTheDocument();
    expect(screen.getByText(/→ Deine Roadmap/)).toBeInTheDocument();
  });
});

describe('WorkshopDemarcation', () => {
  it('renders the three demarcation bullets and the Kante line', () => {
    render(<WorkshopDemarcation />);
    expect(screen.getByRole('heading', { name: /NICHT bekommst/ })).toBeInTheDocument();
    expect(screen.getByText('Keine Folienschlacht')).toBeInTheDocument();
    expect(screen.getByText(/Cloud bleibt für uns richtig/)).toBeInTheDocument();
  });
});

describe('WorkshopFramework', () => {
  it('renders the three fine-print items', () => {
    render(<WorkshopFramework />);
    expect(screen.getByText('Aufzeichnung')).toBeInTheDocument();
    expect(screen.getByText('Ablauf')).toBeInTheDocument();
    expect(screen.getByText('Pilot')).toBeInTheDocument();
    expect(screen.getByText(/Läuft ab 3 Firmen/)).toBeInTheDocument();
  });
});

describe('WorkshopLegal', () => {
  it('renders storno conditions and links to the privacy page', () => {
    render(<WorkshopLegal />);
    expect(screen.getByText(/Verschiebung/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Datenschutzerklärung/ })).toHaveAttribute('href', '/datenschutz');
  });
});

describe('WorkshopFormPlaceholder', () => {
  it('shows the not-bookable placeholder', () => {
    render(<WorkshopFormPlaceholder />);
    expect(screen.getByText(/Anmeldung aktuell nicht möglich/)).toBeInTheDocument();
  });
});
