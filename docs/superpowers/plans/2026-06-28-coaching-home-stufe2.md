# Coaching-Startseite (Stufe 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the personal-profile homepage with a coaching sales-landing for the “90-Tage AI Win” offer, move today’s profile content to `/about`, and flip the navigation from single-page anchors to route-based links with an “Erstgespräch buchen” CTA.

**Architecture:** A new `src/components/coaching/` module holds a typed content constant (`content.ts`, Daniel-editable copy) plus presentational section components. `src/app/page.tsx` composes those sections inside the existing `Layout`. A new `src/app/about/page.tsx` re-homes the current home composition. `Navigation` becomes route-based and its two recruiter CTAs collapse into one external booking CTA.

**Tech Stack:** Next.js 16 (App Router, server components), React 19, TypeScript, Tailwind v4 design tokens (Stufe-1 rebrand), Jest + @testing-library/react.

---

## Reference facts (read before starting)

- **Booking URL** (already used by scorecards + `src/lib/email/send.ts`): `https://calendly.com/danielkreuzhofer/30min`. It is **external** → render as `<a href target="_blank" rel="noopener noreferrer">`, never `next/link`.
- **Design tokens** (from globals.css, do not invent new ones): orange ramp `--primary-300..900` + `--primary-500` (brand), cyan ramp `--secondary-300..900` + `--secondary-400`, `--accent-ink` (dark text on orange/cyan fills), `--foreground` / `--foreground-muted`, `--surface`, `--surface-elevated`, `--border`, `--background`, `--gradient-hero`. Display font helper class: `brand-display` (Anton, uppercase). Section heading helper: `heading-section`.
- **Button** (`src/components/ui/Button.tsx`): `variant: 'primary'|'secondary'|'outline'|'ghost'`, `size: 'sm'|'md'|'lg'`, `href` renders an `<a>` and spreads `...rest` (so `target`/`rel` pass through). `primary` = orange fill + `--accent-ink` text; `secondary` = cyan outline.
- **Layout** (`src/components/Layout.tsx`) is the home chrome (`'use client'`): sticky header with wordmark, `Navigation`, `MobileMenu`, footer. It wraps children in `<main><div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">`. Both the new landing and `/about` use `Layout`.
- **Existing home composition** (current `src/app/page.tsx`) is moved verbatim to `/about` in Task 11.
- Coaching section components are **server components** (no `'use client'`) unless noted — they are static. They may import the client `Button`/`next/link`; that is allowed.
- Copy source: `vault/05-knowledge/90 Day AI Win - Offer - Deutsch.md`. The copy below is a faithful first draft; Daniel finalizes it later by editing only `content.ts`.

## File Structure

**Create:**
- `src/components/coaching/content.ts` — all landing copy + types + `BOOKING_URL`, `ENGPASS_HREF`, `ABOUT_HREF`. One source of truth for text.
- `src/components/coaching/LandingSection.tsx` — generic eyebrow+heading+intro+bullets section (used by Für-wen, Problem, Ergebnis).
- `src/components/coaching/CoachingHero.tsx` — landing hero (booking + engpass CTAs).
- `src/components/coaching/ProofStrip.tsx` — authority anchor (#2).
- `src/components/coaching/MethodTimeline.tsx` — Smart AI Wins System phases + 12-week plan (#5).
- `src/components/coaching/InvestmentCard.tsx` — price + includes (#7).
- `src/components/coaching/FaqSection.tsx` — native `<details>` accordion (#8).
- `src/components/coaching/LeadMagnetsSection.tsx` — 3 checks + optional video/newsletter (#9).
- `src/components/coaching/FinalCtaSection.tsx` — closing CTA (#10).
- `src/components/coaching/index.ts` — barrel export.
- `src/app/about/page.tsx` — re-homed profile.
- One co-located `*.test.tsx` per component above.

**Modify:**
- `src/app/page.tsx` — compose the landing.
- `src/components/Navigation.tsx` — route-based `DEFAULT_SECTIONS` + booking CTA (desktop + mobile).
- `src/components/Layout.tsx` — header logo `href="#"` → `href="/"`.
- `src/components/RecruiterCTASection.tsx` — recast copy to “Was ich gebaut habe” (German).
- `src/components/Navigation.test.tsx`, `src/components/KeyboardNavigation.test.tsx`, `__tests__/properties/navigation.property.test.tsx` — update nav expectations.

---

## Task 1: Coaching content module

**Files:**
- Create: `src/components/coaching/content.ts`
- Test: `src/components/coaching/content.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/coaching/content.test.ts
import { BOOKING_URL, ENGPASS_HREF, ABOUT_HREF, coachingContent } from './content';

describe('coaching content module', () => {
  it('exposes the external Calendly booking URL', () => {
    expect(BOOKING_URL).toBe('https://calendly.com/danielkreuzhofer/30min');
    expect(ENGPASS_HREF).toBe('/engpass-check');
    expect(ABOUT_HREF).toBe('/about');
  });

  it('provides hero copy with both CTAs', () => {
    expect(coachingContent.hero.headline).toMatch(/90 Tagen/);
    expect(coachingContent.hero.primaryCta).toBe('Erstgespräch buchen');
    expect(coachingContent.hero.secondaryHref).toBe('/engpass-check');
  });

  it('provides four method phases and a price', () => {
    expect(coachingContent.method.phases).toHaveLength(4);
    expect(coachingContent.investment.heading).toMatch(/5\.900/);
    expect(coachingContent.investment.includes.length).toBeGreaterThanOrEqual(4);
  });

  it('lists the three lead magnets with internal hrefs', () => {
    const hrefs = coachingContent.leadMagnets.magnets.map((m) => m.href);
    expect(hrefs).toEqual(['/engpass-check', '/ki-fuehrungs-check', '/dsgvo-check']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/content.test.ts`
Expected: FAIL — cannot find module `./content`.

- [ ] **Step 3: Write the content module**

```ts
// src/components/coaching/content.ts

/** External Calendly link for the Erstgespräch CTA. Render with target/rel. */
export const BOOKING_URL = 'https://calendly.com/danielkreuzhofer/30min';
export const ENGPASS_HREF = '/engpass-check';
export const ABOUT_HREF = '/about';

export type Accent = 'primary' | 'secondary';

/** A heading + intro + bullet list block (Für-wen, Problem, Ergebnis). */
export interface ListSection {
  eyebrow: string;
  heading: string;
  intro: string;
  bullets: string[];
  accent: Accent;
}

export interface MethodPhase {
  name: string;
  weeks: string;
  points: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface LeadMagnet {
  title: string;
  description: string;
  href: string;
}

export const coachingContent = {
  hero: {
    eyebrow: 'KI-Coaching mit Kante',
    headline: 'Zeig, dass KI funktioniert — in 90 Tagen, ohne Chaos',
    tagline:
      'Done-With-You-Pilot für Bereichsleiter im Mittelstand mit KI-Mandat. Schnell, risikoarm, messbar — statt Theorie und Ideenparken.',
    primaryCta: 'Erstgespräch buchen',
    secondaryCta: 'Engpass-Check (3 Min)',
    secondaryHref: ENGPASS_HREF,
  },
  proof: {
    eyebrow: 'Warum ich',
    heading: 'Senior AI Solutions Architect bei AWS',
    points: [
      '20+ Jahre Enterprise- und Cloud-Architektur',
      'Täglich KI-Systeme für Unternehmen im Einsatz — kein Hype, gebaute Praxis',
      'Strategie statt Tool-Spielerei: Ergebnisse, die intern überzeugen',
    ],
    linkText: 'Mehr über mich',
    linkHref: ABOUT_HREF,
  },
  forWhom: {
    eyebrow: 'Für wen',
    heading: 'Bereichsleiter im Mittelstand mit KI-Mandat',
    intro:
      'Vertriebs-, Marketing-, Service- oder Operations-Leitung, die unter Druck steht, mit KI schnell echten Business-Impact zu liefern.',
    bullets: [
      'Sie suchen einen schnellen, risikoarmen Einstieg — keine Pilot-Friedhöfe',
      'Sie wollen strategische Führung statt Tool-Spielerei',
      'Sie dürfen Bereichsbudget bis 10k netto eigenständig zeichnen',
      'Nicht geeignet für Startups, Hobby-Teams oder Rollen ohne Linien-P&L und KI-Mandat',
    ],
    accent: 'secondary',
  } as ListSection,
  problem: {
    eyebrow: 'Das Problem',
    heading: 'KI-Druck von oben — aber wo anfangen?',
    intro:
      'Ihr Vertriebs-, Service- oder Operations-Prozess ist zu manuell, zu langsam oder zu fehleranfällig. KI könnte helfen — doch zwischen Tool-Flut und Shadow-AI fehlt der erste belastbare Schritt.',
    bullets: [
      'Manuelle Schritte und verpasste Chancen kosten täglich Zeit',
      'Viele Tools, wenig Klarheit, welcher Hebel wirklich zählt',
      'Der erste Pilot soll sitzen — nicht im Sand verlaufen',
    ],
    accent: 'primary',
  } as ListSection,
  method: {
    eyebrow: 'Die Methode',
    heading: 'Smart AI Wins System™',
    subline: 'Bremsen lösen. Pilot planen. Impact liefern.',
    phases: [
      {
        name: 'Kickoff & Analyse',
        weeks: 'Woche 1',
        points: [
          '90-min Strategiegespräch',
          'Prozess analysieren, Engpässe & manuelle Schritte identifizieren',
          '1–2 KI-Hebel mit hohem Potenzial auswählen',
        ],
      },
      {
        name: 'Pilot planen',
        weeks: 'Woche 2–3',
        points: [
          '2 × 60-min Co-Creation Sessions',
          'Schlanken KI-Piloten entwickeln: Ziele, Erfolgskriterien, internes Buy-in',
          'Ergebnis: präsentationsreife Pilotplanung',
        ],
      },
      {
        name: 'Umsetzung & Coaching',
        weeks: 'Woche 4–10',
        points: [
          '4 × 45-min Check-Ins',
          'Sie setzen um — ich begleite, optimiere, beseitige Blocker',
          'Asynchrone E-Mail-Unterstützung zwischen den Terminen',
        ],
      },
      {
        name: 'Impact Review',
        weeks: 'Woche 11–12',
        points: [
          '60-min Abschlusssession',
          'Erfolge messen & dokumentieren',
          'Review der Stakeholder-Präsentation, nächste Schritte klären',
        ],
      },
    ] as MethodPhase[],
  },
  result: {
    eyebrow: 'Das Ergebnis',
    heading: 'Ein echter Win — als Basis zum Skalieren',
    intro: 'Nach 90 Tagen haben Sie nicht mehr Theorie, sondern einen Beweis.',
    bullets: [
      'Ein konkreter, umgesetzter KI-Pilot',
      'Messbarer Impact im Prozess — mehr Effizienz, weniger Fehler',
      'Internes Vertrauen durch belegte Ergebnisse + eine skalierbare Methode',
    ],
    accent: 'secondary',
  } as ListSection,
  investment: {
    eyebrow: 'Investition',
    heading: '5.900 € netto',
    subline: 'Einmalig. Klarer Rahmen. Kein Overhead.',
    includes: [
      '1:1 Coaching-Sessions (alle 2 Wochen, 3 Monate)',
      'Asynchrone Unterstützung via E-Mail oder Loom',
      'Feedback zu internen Präsentationen und Pilotplänen',
      'Zugang zum Smart AI Wins System™ + Templates',
      'Klarer Fahrplan vom ersten Friction-Point bis zum messbaren Ergebnis',
    ],
    cta: 'Erstgespräch buchen',
  },
  faq: {
    eyebrow: 'FAQ',
    heading: 'Häufige Fragen',
    items: [
      {
        q: 'Ist das Coaching oder Umsetzung?',
        a: 'Done-With-You, nicht Done-For-You. Sie führen — ich unterstütze mit Struktur, Klarheit und Strategie.',
      },
      {
        q: 'Mit welchen Tools arbeiten wir?',
        a: 'Technologie-unabhängig. Ich helfe, passende Tools zu wählen, Shadow-AI-Risiken zu vermeiden und clever zwischen Build und Buy zu entscheiden.',
      },
      {
        q: 'Wie viel Zeit muss ich einplanen?',
        a: 'Etwa 1–2 Stunden pro Woche für Calls und Vorbereitung — mehr, wenn Sie selbst umsetzen. Die meisten Piloten lassen sich gut in den Alltag integrieren.',
      },
      {
        q: 'Was, wenn ich nicht technisch bin?',
        a: 'Kein Problem. Sie müssen nicht coden — Sie müssen führen. Ich übersetze Tech in Strategie und Entscheidungsgrundlagen.',
      },
    ] as FaqItem[],
  },
  leadMagnets: {
    eyebrow: 'Noch nicht bereit?',
    heading: 'Erste Schritte ohne Risiko',
    intro:
      'Verschaffen Sie sich in wenigen Minuten Klarheit — und bleiben Sie über den Newsletter zu konkreten KI-Hebeln auf dem Laufenden.',
    magnets: [
      {
        title: 'KI-Engpass-Check',
        description: 'In 3 Minuten zum größten Hebel in Ihrem Prozess.',
        href: '/engpass-check',
      },
      {
        title: 'KI-Führungs-Check',
        description: 'Wie souverän führen Sie Ihr Team durch die KI-Transformation?',
        href: '/ki-fuehrungs-check',
      },
      {
        title: 'DSGVO-Check',
        description: 'Welche KI-Tools Sie wie rechtssicher einsetzen können.',
        href: '/dsgvo-check',
      },
    ] as LeadMagnet[],
    /** Daniel füllt die YouTube-Kanal-URL; leer = Block wird nicht gerendert. */
    youtubeUrl: '',
    youtubeText: 'Neueste Videos auf YouTube',
  },
  finalCta: {
    heading: 'Startklar?',
    body:
      'Kurzes Erstgespräch zum Kennenlernen. Wenn es passt, erhalten Sie noch am selben Tag Ihren Kalenderlink.',
    cta: 'Erstgespräch buchen',
  },
} as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/content.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/content.ts frontend/src/components/coaching/content.test.ts
git commit -m "feat(coaching): add Stufe-2 landing content module"
```

---

## Task 2: LandingSection (generic list section)

**Files:**
- Create: `src/components/coaching/LandingSection.tsx`
- Test: `src/components/coaching/LandingSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/LandingSection.test.tsx
import { render, screen } from '@testing-library/react';
import { LandingSection } from './LandingSection';

const props = {
  eyebrow: 'Für wen',
  heading: 'Bereichsleiter mit KI-Mandat',
  intro: 'Kurzer Einleitungssatz.',
  bullets: ['Punkt eins', 'Punkt zwei'],
  accent: 'secondary' as const,
};

describe('LandingSection', () => {
  it('renders eyebrow, heading, intro and all bullets', () => {
    render(<LandingSection id="for-whom" {...props} />);
    expect(screen.getByText('Für wen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bereichsleiter mit KI-Mandat' })).toBeInTheDocument();
    expect(screen.getByText('Kurzer Einleitungssatz.')).toBeInTheDocument();
    expect(screen.getByText('Punkt eins')).toBeInTheDocument();
    expect(screen.getByText('Punkt zwei')).toBeInTheDocument();
  });

  it('exposes the section id for the page anchor map', () => {
    const { container } = render(<LandingSection id="problem" {...props} />);
    expect(container.querySelector('section#problem')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/LandingSection.test.tsx`
Expected: FAIL — cannot find module `./LandingSection`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/LandingSection.tsx
import React from 'react';
import type { Accent } from './content';

export interface LandingSectionProps {
  id: string;
  eyebrow: string;
  heading: string;
  intro: string;
  bullets: string[];
  accent: Accent;
}

const ACCENT_TEXT: Record<Accent, string> = {
  primary: 'text-[var(--primary-400)]',
  secondary: 'text-[var(--secondary-400)]',
};

const ACCENT_MARKER: Record<Accent, string> = {
  primary: 'bg-[var(--primary-500)]',
  secondary: 'bg-[var(--secondary-400)]',
};

export function LandingSection({ id, eyebrow, heading, intro, bullets, accent }: LandingSectionProps) {
  return (
    <section id={id} aria-label={heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className={`text-xs font-bold tracking-[0.18em] uppercase mb-3 ${ACCENT_TEXT[accent]}`}>
          {eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-4">{heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-6">{intro}</p>
        <ul className="space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[var(--foreground)]">
              <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${ACCENT_MARKER[accent]}`} aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default LandingSection;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/LandingSection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/LandingSection.tsx frontend/src/components/coaching/LandingSection.test.tsx
git commit -m "feat(coaching): add generic LandingSection"
```

---

## Task 3: CoachingHero

**Files:**
- Create: `src/components/coaching/CoachingHero.tsx`
- Test: `src/components/coaching/CoachingHero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/CoachingHero.test.tsx
import { render, screen } from '@testing-library/react';
import { CoachingHero } from './CoachingHero';

describe('CoachingHero', () => {
  it('renders the headline and the brand eyebrow', () => {
    render(<CoachingHero />);
    expect(screen.getByRole('heading', { level: 1, name: /90 Tagen/ })).toBeInTheDocument();
    expect(screen.getByText('KI-Coaching mit Kante')).toBeInTheDocument();
  });

  it('links the primary CTA to the external Calendly booking URL in a new tab', () => {
    render(<CoachingHero />);
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('links the secondary CTA to the Engpass-Check', () => {
    render(<CoachingHero />);
    expect(screen.getByRole('link', { name: /Engpass-Check/ })).toHaveAttribute('href', '/engpass-check');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/CoachingHero.test.tsx`
Expected: FAIL — cannot find module `./CoachingHero`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/CoachingHero.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { coachingContent, BOOKING_URL } from './content';

export function CoachingHero() {
  const { hero } = coachingContent;
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center
                 bg-[var(--gradient-hero)] px-4 pb-20 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 text-center"
    >
      <div className="relative z-10 max-w-4xl mx-auto flex-1 flex flex-col justify-center">
        <p className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">
          {hero.eyebrow}
        </p>
        <h1 className="brand-display text-4xl md:text-5xl lg:text-6xl text-[var(--foreground)] mb-5">
          {hero.headline}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10">
          {hero.tagline}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
            {hero.primaryCta}
          </Button>
          <Button variant="secondary" size="lg" href={hero.secondaryHref}>
            {hero.secondaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CoachingHero;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/CoachingHero.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/CoachingHero.tsx frontend/src/components/coaching/CoachingHero.test.tsx
git commit -m "feat(coaching): add landing hero with booking + engpass CTAs"
```

---

## Task 4: ProofStrip (authority anchor)

**Files:**
- Create: `src/components/coaching/ProofStrip.tsx`
- Test: `src/components/coaching/ProofStrip.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/ProofStrip.test.tsx
import { render, screen } from '@testing-library/react';
import { ProofStrip } from './ProofStrip';

describe('ProofStrip', () => {
  it('renders the authority heading and all proof points', () => {
    render(<ProofStrip />);
    expect(screen.getByRole('heading', { name: /AWS/ })).toBeInTheDocument();
    expect(screen.getByText(/20\+ Jahre/)).toBeInTheDocument();
  });

  it('links to the about page', () => {
    render(<ProofStrip />);
    expect(screen.getByRole('link', { name: /Mehr über mich/ })).toHaveAttribute('href', '/about');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/ProofStrip.test.tsx`
Expected: FAIL — cannot find module `./ProofStrip`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/ProofStrip.tsx
import React from 'react';
import Link from 'next/link';
import { coachingContent } from './content';

export function ProofStrip() {
  const { proof } = coachingContent;
  return (
    <section
      id="proof"
      aria-label={proof.heading}
      className="py-10 md:py-12 border-y border-[var(--border)] bg-[var(--surface)]
                 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {proof.eyebrow}
        </p>
        <h2 className="heading-section text-xl md:text-2xl text-[var(--foreground)] mb-6">
          {proof.heading}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3 mb-6">
          {proof.points.map((p) => (
            <li key={p} className="text-[var(--foreground-muted)] text-sm leading-relaxed">{p}</li>
          ))}
        </ul>
        <Link
          href={proof.linkHref}
          className="inline-flex items-center text-sm font-medium text-[var(--primary-400)] hover:text-[var(--primary-300)]"
        >
          {proof.linkText}
          <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </section>
  );
}

export default ProofStrip;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/ProofStrip.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/ProofStrip.tsx frontend/src/components/coaching/ProofStrip.test.tsx
git commit -m "feat(coaching): add ProofStrip authority section"
```

---

## Task 5: MethodTimeline

**Files:**
- Create: `src/components/coaching/MethodTimeline.tsx`
- Test: `src/components/coaching/MethodTimeline.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/MethodTimeline.test.tsx
import { render, screen } from '@testing-library/react';
import { MethodTimeline } from './MethodTimeline';

describe('MethodTimeline', () => {
  it('renders the system name and subline', () => {
    render(<MethodTimeline />);
    expect(screen.getByRole('heading', { name: /Smart AI Wins System/ })).toBeInTheDocument();
    expect(screen.getByText(/Bremsen lösen\. Pilot planen\. Impact liefern\./)).toBeInTheDocument();
  });

  it('renders all four phases with their week labels', () => {
    render(<MethodTimeline />);
    expect(screen.getByText('Kickoff & Analyse')).toBeInTheDocument();
    expect(screen.getByText('Impact Review')).toBeInTheDocument();
    expect(screen.getByText('Woche 1')).toBeInTheDocument();
    expect(screen.getByText('Woche 11–12')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/MethodTimeline.test.tsx`
Expected: FAIL — cannot find module `./MethodTimeline`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/MethodTimeline.tsx
import React from 'react';
import { coachingContent } from './content';

export function MethodTimeline() {
  const { method } = coachingContent;
  return (
    <section id="method" aria-label={method.heading} className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {method.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-2">{method.heading}</h2>
        <p className="text-[var(--secondary-400)] font-semibold mb-8">{method.subline}</p>
        <ol className="space-y-6">
          {method.phases.map((phase, i) => (
            <li
              key={phase.name}
              className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  <span className="text-[var(--primary-400)] mr-2">{i + 1}.</span>
                  {phase.name}
                </h3>
                <span className="flex-shrink-0 text-sm font-medium text-[var(--foreground-muted)]">{phase.weeks}</span>
              </div>
              <ul className="space-y-2">
                {phase.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[var(--foreground-muted)] text-sm">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary-500)]" aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default MethodTimeline;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/MethodTimeline.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/MethodTimeline.tsx frontend/src/components/coaching/MethodTimeline.test.tsx
git commit -m "feat(coaching): add Smart AI Wins method timeline"
```

---

## Task 6: InvestmentCard

**Files:**
- Create: `src/components/coaching/InvestmentCard.tsx`
- Test: `src/components/coaching/InvestmentCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/InvestmentCard.test.tsx
import { render, screen } from '@testing-library/react';
import { InvestmentCard } from './InvestmentCard';

describe('InvestmentCard', () => {
  it('renders the price and every included item', () => {
    render(<InvestmentCard />);
    expect(screen.getByRole('heading', { name: /5\.900 € netto/ })).toBeInTheDocument();
    expect(screen.getByText(/Zugang zum Smart AI Wins System/)).toBeInTheDocument();
  });

  it('renders the booking CTA to Calendly in a new tab', () => {
    render(<InvestmentCard />);
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/InvestmentCard.test.tsx`
Expected: FAIL — cannot find module `./InvestmentCard`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/InvestmentCard.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { coachingContent, BOOKING_URL } from './content';

export function InvestmentCard() {
  const { investment } = coachingContent;
  return (
    <section id="investment" aria-label="Investition" className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--primary-700)] bg-[var(--surface)] p-8 text-center">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {investment.eyebrow}
        </p>
        <h2 className="brand-display text-3xl md:text-4xl text-[var(--foreground)] mb-2">{investment.heading}</h2>
        <p className="text-[var(--foreground-muted)] mb-6">{investment.subline}</p>
        <ul className="text-left space-y-3 mb-8">
          {investment.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[var(--foreground)]">
              <span className="mt-1 text-[var(--success)]" aria-hidden="true">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button variant="primary" size="lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
          {investment.cta}
        </Button>
      </div>
    </section>
  );
}

export default InvestmentCard;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/InvestmentCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/InvestmentCard.tsx frontend/src/components/coaching/InvestmentCard.test.tsx
git commit -m "feat(coaching): add investment/price card"
```

---

## Task 7: FaqSection

**Files:**
- Create: `src/components/coaching/FaqSection.tsx`
- Test: `src/components/coaching/FaqSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/FaqSection.test.tsx
import { render, screen } from '@testing-library/react';
import { FaqSection } from './FaqSection';

describe('FaqSection', () => {
  it('renders every question as a summary', () => {
    render(<FaqSection />);
    expect(screen.getByText('Ist das Coaching oder Umsetzung?')).toBeInTheDocument();
    expect(screen.getByText('Mit welchen Tools arbeiten wir?')).toBeInTheDocument();
    expect(screen.getByText(/Wie viel Zeit/)).toBeInTheDocument();
    expect(screen.getByText(/nicht technisch/)).toBeInTheDocument();
  });

  it('renders each answer text', () => {
    render(<FaqSection />);
    expect(screen.getByText(/Done-With-You, nicht Done-For-You/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/FaqSection.test.tsx`
Expected: FAIL — cannot find module `./FaqSection`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/FaqSection.tsx
import React from 'react';
import { coachingContent } from './content';

export function FaqSection() {
  const { faq } = coachingContent;
  return (
    <section id="faq" aria-label="FAQ" className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--primary-400)]">
          {faq.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-6">{faq.heading}</h2>
        <div className="space-y-3">
          {faq.items.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <summary className="cursor-pointer list-none font-medium text-[var(--foreground)] flex items-center justify-between gap-4">
                {item.q}
                <span aria-hidden="true" className="text-[var(--foreground-muted)] group-open:rotate-45 transition-transform">＋</span>
              </summary>
              <p className="mt-3 text-[var(--foreground-muted)] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/FaqSection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/FaqSection.tsx frontend/src/components/coaching/FaqSection.test.tsx
git commit -m "feat(coaching): add FAQ accordion section"
```

---

## Task 8: LeadMagnetsSection

**Files:**
- Create: `src/components/coaching/LeadMagnetsSection.tsx`
- Test: `src/components/coaching/LeadMagnetsSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/LeadMagnetsSection.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/LeadMagnetsSection.test.tsx`
Expected: FAIL — cannot find module `./LeadMagnetsSection`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/coaching/LeadMagnetsSection.tsx
import React from 'react';
import Link from 'next/link';
import { coachingContent } from './content';

export function LeadMagnetsSection() {
  const { leadMagnets } = coachingContent;
  return (
    <section
      id="lead-magnets"
      aria-label={leadMagnets.heading}
      className="py-12 md:py-16 border-t border-[var(--border)]"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[var(--secondary-400)]">
          {leadMagnets.eyebrow}
        </p>
        <h2 className="heading-section text-2xl md:text-3xl text-[var(--foreground)] mb-3">{leadMagnets.heading}</h2>
        <p className="text-[var(--foreground-muted)] mb-8 max-w-2xl">{leadMagnets.intro}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {leadMagnets.magnets.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5
                         hover:border-[var(--secondary-500)] transition-colors"
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--secondary-400)]">
                {m.title}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)]">{m.description}</p>
            </Link>
          ))}
        </div>
        {leadMagnets.youtubeUrl ? (
          <a
            href={leadMagnets.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-8 text-sm font-medium text-[var(--secondary-400)] hover:text-[var(--secondary-300)]"
          >
            {leadMagnets.youtubeText}
            <span aria-hidden="true" className="ml-1">→</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default LeadMagnetsSection;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/LeadMagnetsSection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/LeadMagnetsSection.tsx frontend/src/components/coaching/LeadMagnetsSection.test.tsx
git commit -m "feat(coaching): add lead-magnets nurture section"
```

---

## Task 9: FinalCtaSection + barrel export

**Files:**
- Create: `src/components/coaching/FinalCtaSection.tsx`
- Create: `src/components/coaching/index.ts`
- Test: `src/components/coaching/FinalCtaSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/coaching/FinalCtaSection.test.tsx
import { render, screen } from '@testing-library/react';
import { FinalCtaSection } from './FinalCtaSection';

describe('FinalCtaSection', () => {
  it('renders the closing heading and booking CTA', () => {
    render(<FinalCtaSection />);
    expect(screen.getByRole('heading', { name: 'Startklar?' })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/components/coaching/FinalCtaSection.test.tsx`
Expected: FAIL — cannot find module `./FinalCtaSection`.

- [ ] **Step 3: Write the component and barrel**

```tsx
// src/components/coaching/FinalCtaSection.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { coachingContent, BOOKING_URL } from './content';

export function FinalCtaSection() {
  const { finalCta } = coachingContent;
  return (
    <section
      id="final-cta"
      aria-label="Erstgespräch buchen"
      className="py-16 md:py-20 text-center bg-[var(--gradient-hero)]
                 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="brand-display text-3xl md:text-4xl text-[var(--foreground)] mb-4">{finalCta.heading}</h2>
        <p className="text-[var(--foreground-muted)] text-lg mb-8">{finalCta.body}</p>
        <Button variant="primary" size="lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
          {finalCta.cta}
        </Button>
      </div>
    </section>
  );
}

export default FinalCtaSection;
```

```ts
// src/components/coaching/index.ts
export { CoachingHero } from './CoachingHero';
export { ProofStrip } from './ProofStrip';
export { LandingSection } from './LandingSection';
export { MethodTimeline } from './MethodTimeline';
export { InvestmentCard } from './InvestmentCard';
export { FaqSection } from './FaqSection';
export { LeadMagnetsSection } from './LeadMagnetsSection';
export { FinalCtaSection } from './FinalCtaSection';
export { coachingContent } from './content';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/components/coaching/FinalCtaSection.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/coaching/FinalCtaSection.tsx frontend/src/components/coaching/FinalCtaSection.test.tsx frontend/src/components/coaching/index.ts
git commit -m "feat(coaching): add final CTA section + barrel export"
```

---

## Task 10: Assemble the landing page (`/`)

**Files:**
- Modify: `src/app/page.tsx` (full replace)
- Test: `src/app/landing-page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/landing-page.test.tsx
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home (coaching landing)', () => {
  it('renders the coaching hero headline, the method, the price and the final CTA', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1, name: /90 Tagen/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Smart AI Wins System/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /5\.900 € netto/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Startklar?' })).toBeInTheDocument();
  });

  it('renders the three landing list-sections (Für wen, Problem, Ergebnis)', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Bereichsleiter im Mittelstand/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /wo anfangen/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /echter Win/ })).toBeInTheDocument();
  });
});
```

Note: `Home` renders `Layout` (a `'use client'` component using `usePathname`). The repo’s jest setup already mocks `next/navigation` for the existing Navigation/Layout tests; if this test reports `usePathname` is undefined, add `import '@/test-utils/next-navigation-mock';` the same way a sibling Layout/Navigation test does (check `src/components/Navigation.test.tsx` imports and mirror them).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/app/landing-page.test.tsx`
Expected: FAIL — current `Home` renders the profile, not the coaching headline.

- [ ] **Step 3: Replace the page**

```tsx
// src/app/page.tsx
import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import {
  CoachingHero,
  ProofStrip,
  LandingSection,
  MethodTimeline,
  InvestmentCard,
  FaqSection,
  LeadMagnetsSection,
  FinalCtaSection,
  coachingContent,
} from '@/components/coaching';

export const metadata: Metadata = {
  title: '90-Tage AI Win — KI-Coaching mit Kante | Daniel Kreuzhofer',
  description:
    'Done-With-You-Coaching für Bereichsleiter im Mittelstand: in 90 Tagen einen risikoarmen, messbaren KI-Pilot planen, umsetzen und beweisen.',
  openGraph: {
    title: '90-Tage AI Win — KI-Coaching mit Kante',
    description:
      'In 90 Tagen einen risikoarmen, messbaren KI-Pilot planen, umsetzen und beweisen. Done-With-You für Bereichsleiter mit KI-Mandat.',
    type: 'website',
  },
};

/**
 * Home = coaching sales landing for the 90-Tage AI Win offer (Stufe 2).
 * Profile content now lives at /about.
 */
export default function Home() {
  const { forWhom, problem, result } = coachingContent;
  return (
    <Layout>
      <CoachingHero />
      <ProofStrip />
      <LandingSection id="for-whom" {...forWhom} />
      <LandingSection id="problem" {...problem} />
      <MethodTimeline />
      <LandingSection id="result" {...result} />
      <InvestmentCard />
      <FaqSection />
      <LeadMagnetsSection />
      <FinalCtaSection />
    </Layout>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/app/landing-page.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/page.tsx frontend/src/app/landing-page.test.tsx
git commit -m "feat(coaching): make / the 90-Tage AI Win sales landing"
```

---

## Task 11: Re-home the profile at `/about`

**Files:**
- Create: `src/app/about/page.tsx`
- Modify: `src/components/RecruiterCTASection.tsx` (recast copy to “Was ich gebaut habe”)
- Test: `src/app/about/about-page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/about/about-page.test.tsx
import { render, screen } from '@testing-library/react';
import AboutPage from './page';

describe('AboutPage (re-homed profile)', () => {
  it('renders the profile sections and the demos block', () => {
    render(<AboutPage />);
    // "Was ich gebaut habe" demos link to the two tools
    expect(screen.getByRole('link', { name: /Skills Transparency|Transparenz/ })).toHaveAttribute('href', '/transparency');
    expect(screen.getByRole('link', { name: /Fit.?Analys/i })).toHaveAttribute('href', '/fit-analysis');
  });
});
```

(If `usePathname` errors, mirror the navigation mock import used by `src/components/Navigation.test.tsx`, as in Task 10.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- src/app/about/about-page.test.tsx`
Expected: FAIL — cannot find module `./page` (about route does not exist yet).

- [ ] **Step 3a: Recast the demos block copy** in `src/components/RecruiterCTASection.tsx`

Replace the section intro block (the `<div className="text-center mb-10">…</div>`, currently lines ~85–97) with German “Was ich gebaut habe” copy:

```tsx
        {/* Section intro */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-[var(--primary-400)] uppercase tracking-wide mb-2">
            Was ich gebaut habe
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
            Transparenz statt Behauptungen
          </h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto">
            Zwei Tools, die ich selbst gebaut habe — als Beweis, wie ich mit KI und ehrlicher
            Selbsteinschätzung arbeite. Schauen Sie rein.
          </p>
        </div>
```

Leave the two `<Link>` cards (`/transparency`, `/fit-analysis`) unchanged. (The English card copy may be polished later by Daniel; out of scope here.)

- [ ] **Step 3b: Create the about route**

```tsx
// src/app/about/page.tsx
import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { SkillsSection } from '@/components/SkillsSection';
import { RecruiterCTASection } from '@/components/RecruiterCTASection';
import { ContactSection } from '@/components/ContactSection';
import {
  getAbout,
  getHero,
  getExperiences,
  getProjects,
  getSkillCategories,
  getContact,
} from '@/lib/content';

export const metadata: Metadata = {
  title: 'Über mich | Daniel Kreuzhofer',
  description:
    'Daniel Kreuzhofer — Senior AI Solutions Architect. Werdegang, Projekte, Skills und zwei selbst gebaute KI-Tools (Transparenz-Dashboard & Fit-Analyse).',
  openGraph: {
    title: 'Über mich | Daniel Kreuzhofer',
    description: 'Werdegang, Projekte, Skills und selbst gebaute KI-Tools.',
    type: 'website',
  },
};

/** /about — re-homed personal profile (was the single-page home before Stufe 2). */
export default function AboutPage() {
  const hero = getHero();
  const about = getAbout();
  const experiences = getExperiences();
  const projects = getProjects();
  const skillCategories = getSkillCategories();
  const contact = getContact();

  return (
    <Layout>
      <HeroSection
        headline={hero.headline}
        tagline={hero.tagline}
        ctaText={hero.ctaText}
        ctaHref={hero.ctaHref}
      />
      <AboutSection about={about} />
      <ExperienceSection experiences={experiences} />
      <ProjectsSection projects={projects} />
      <SkillsSection skillCategories={skillCategories} />
      <RecruiterCTASection />
      <ContactSection contact={contact} />
    </Layout>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- src/app/about/about-page.test.tsx src/components/RecruiterCTASection.test.tsx`
Expected: PASS. If `RecruiterCTASection.test.tsx` asserted the old English intro copy ("For Recruiters & Hiring Managers" / "I believe in radical transparency"), update those assertions to the new German copy ("Was ich gebaut habe" / "Transparenz statt Behauptungen").

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/about/page.tsx frontend/src/app/about/about-page.test.tsx frontend/src/components/RecruiterCTASection.tsx frontend/src/components/RecruiterCTASection.test.tsx
git commit -m "feat(about): re-home profile at /about with 'Was ich gebaut habe' demos"
```

---

## Task 12: Route-based navigation + booking CTA

**Files:**
- Modify: `src/components/Navigation.tsx` (DEFAULT_SECTIONS + desktop CTA + mobile CTA)
- Modify: `src/components/Layout.tsx` (header logo href `#` → `/`)
- Modify: `src/components/Navigation.test.tsx`
- Modify: `src/components/KeyboardNavigation.test.tsx`
- Modify: `__tests__/properties/navigation.property.test.tsx`

**Mapping that determines every test edit (apply consistently):**
- Section links: `About / Experience / Projects / Skills / Contact / Blog` → `Coaching (/) · Über mich (/about) · Blog (/blog)`.
- CTAs: `Skills Transparency` (→/transparency) and `Fit Analysis` (→/fit-analysis) → a single `Erstgespräch buchen` external link (→ Calendly).

- [ ] **Step 1: Update the failing tests first**

In `src/components/Navigation.test.tsx`, replace the section-presence block (currently lines ~134–139) and the active-link assertions that reference removed sections:

```tsx
      // route-based nav (Stufe 2)
      expect(screen.getByRole('link', { name: 'Coaching' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Über mich' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Experience' })).not.toBeInTheDocument();
```

Add a CTA assertion in the same `describe`:

```tsx
  it('renders the Erstgespräch booking CTA as an external link', () => {
    render(<Navigation sections={DEFAULT_SECTIONS} currentSection="" />);
    const cta = screen.getByRole('link', { name: 'Erstgespräch buchen' });
    expect(cta).toHaveAttribute('href', 'https://calendly.com/danielkreuzhofer/30min');
    expect(cta).toHaveAttribute('target', '_blank');
  });
```

For any assertion in this file that used `name: 'Experience'`/`'About'`/`'Projects'`/`'Skills'`/`'Contact'` on a `DEFAULT_SECTIONS` render (the tests around lines 129–266), retarget it to `'Coaching'`, `'Über mich'`, or `'Blog'`. The `NavLink`-only unit tests (lines ~20–116) pass an explicit `label="Experience"` prop and need **no change** (they don't use DEFAULT_SECTIONS).

In `src/components/KeyboardNavigation.test.tsx`, any assertion/selector referencing `'Fit Analysis'` or `'Skills Transparency'` (e.g. the focus-ring test near line 462) retargets to `'Erstgespräch buchen'`. Keep the existing class assertion intent — the booking CTA uses `bg-[var(--primary-500)] text-[var(--accent-ink)]` with `focus:ring-[var(--primary-500)]`; assert against those tokens.

In `__tests__/properties/navigation.property.test.tsx`, if it derives expected labels from `DEFAULT_SECTIONS`, it keeps working automatically (it reads the constant). If it hard-codes the old labels, replace them with `['Coaching', 'Über mich', 'Blog']`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --prefix frontend -- src/components/Navigation.test.tsx src/components/KeyboardNavigation.test.tsx __tests__/properties/navigation.property.test.tsx`
Expected: FAIL — `Coaching`/`Über mich`/`Erstgespräch buchen` links not found (nav still anchor-based).

- [ ] **Step 3a: Update `DEFAULT_SECTIONS`** in `src/components/Navigation.tsx` (currently lines 501–508)

```tsx
export const DEFAULT_SECTIONS: Omit<NavLinkProps, 'isActive' | 'onClick'>[] = [
  { href: '/', label: 'Coaching' },
  { href: '/about', label: 'Über mich' },
  { href: '/blog', label: 'Blog' },
];
```

- [ ] **Step 3b: Replace the desktop CTA block** in `src/components/Navigation.tsx` (the `<div className="flex items-center ml-4 space-x-2">…</div>` containing the two `<Link>`s, currently lines ~588–616)

```tsx
      {/* Booking CTA */}
      <div className="flex items-center ml-4">
        <a
          href="https://calendly.com/danielkreuzhofer/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="
            px-4 py-2
            bg-[var(--primary-500)] hover:bg-[var(--primary-400)]
            text-[var(--accent-ink)] text-sm font-medium
            rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]
          "
        >
          Erstgespräch buchen
        </a>
      </div>
```

Note: the active-state logic for `{ href: '/', label: 'Coaching' }` already works — `isRouteActive` special-cases that `pathname === '/'` only lights up Coaching on the home route (it checks exact match or `href + '/'`).

- [ ] **Step 3c: Replace the mobile CTA block** in `src/components/Navigation.tsx` — the `<div className="px-4 py-4 border-t border-[var(--border)] space-y-3">…</div>` inside `MobileMenu` containing the two `<Link>` CTAs (currently lines ~342–402)

```tsx
        {/* CTA */}
        <div className="px-4 py-4 border-t border-[var(--border)]">
          <a
            href="https://calendly.com/danielkreuzhofer/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="
              flex items-center justify-center
              w-full px-4 py-3 min-h-[44px]
              bg-[var(--primary-500)] hover:bg-[var(--primary-400)]
              text-[var(--accent-ink)] font-medium text-base
              rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] focus:ring-offset-[var(--surface)]
            "
          >
            Erstgespräch buchen
          </a>
        </div>
```

- [ ] **Step 3d: Fix the home logo href** in `src/components/Layout.tsx` (currently line ~113, `href="#"`)

```tsx
              <a
                href="/"
                aria-label="Daniel Kreuzhofer - Go to homepage"
```

(Leave the rest of that `<a>` — wordmark `<img>`, classes — unchanged.)

- [ ] **Step 4: Run the targeted tests, then the full suite**

Run: `npm test --prefix frontend -- src/components/Navigation.test.tsx src/components/KeyboardNavigation.test.tsx __tests__/properties/navigation.property.test.tsx`
Expected: PASS.

Then run the full suite to catch any remaining references to the old IA (e.g. a Layout test asserting `#about` scroll-spy):

Run: `npm test --prefix frontend`
Expected: PASS. For any failure caused by this change, apply the **Mapping** above (old section/CTA name → new). Do not loosen unrelated assertions.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Navigation.tsx frontend/src/components/Layout.tsx frontend/src/components/Navigation.test.tsx frontend/src/components/KeyboardNavigation.test.tsx frontend/__tests__/properties/navigation.property.test.tsx
git commit -m "feat(nav): route-based navigation + Erstgespräch booking CTA"
```

---

## Task 13: Full verification (build + lint + suite + manual)

**Files:** none (verification only)

- [ ] **Step 1: Type-check + lint**

Run: `npm run lint --prefix frontend`
Expected: no **new** errors in `src/components/coaching/**`, `src/app/page.tsx`, `src/app/about/**`, `src/components/Navigation.tsx`, `src/components/Layout.tsx`, `src/components/RecruiterCTASection.tsx`. (Pre-existing lint debt elsewhere is out of scope — note it, don’t fix it.)

- [ ] **Step 2: Production build (proves both routes prerender)**

Run: `npm run build:local --prefix frontend`
Expected: compiles; route list includes `/` and `/about`. No “Functions cannot be passed directly to Client Components” error (all coaching sections are server components passing only serializable props; `Layout`/`Button` are the client boundary).

- [ ] **Step 3: Full test suite**

Run: `npm test --prefix frontend`
Expected: all suites green.

- [ ] **Step 4: Manual smoke (visual)**

Start `npm run dev:local --prefix frontend`, then verify on the LAN URL (allowedDevOrigins already configured):
- `/` shows hero → proof → für-wen → problem → method → ergebnis → investment → faq → lead-magnets → final CTA, in order.
- Both “Erstgespräch buchen” CTAs (hero + investment + final + nav) open Calendly in a new tab.
- Nav shows Coaching · Über mich · Blog + booking CTA; mobile menu likewise; logo → `/`.
- `/about` shows the full profile + the “Was ich gebaut habe” demos linking to `/transparency` and `/fit-analysis`.
- Mobile (real device via LAN IP): nav, menu, and chat work; no empty space below the hero.

- [ ] **Step 5: Commit (only if any verification fix was needed)**

```bash
git add -A
git commit -m "chore(coaching): verification fixes for Stufe-2 landing"
```

---

## Self-Review (completed during planning)

**1. Spec coverage** (`docs/superpowers/specs/2026-06-27-coaching-home-stufe2-design.md`):
- IA/routes (`/` landing, `/about` re-home, funnels/blog/legal untouched) → Tasks 10, 11.
- Nav route-based + booking CTA, recruiter items removed → Task 12.
- 10-section order with Beweis at #2 → Tasks 3–9 + assembly Task 10 (Hero, Proof, Für-wen, Problem, Method, Ergebnis, Investment, FAQ, Lead-Magnets, Final-CTA).
- Recruiter features as `/about` demos → Task 11 (RecruiterCTASection recast + linked, removed from nav in Task 12).
- Content from offer doc, Daniel-finalizable in one file → Task 1 (`content.ts`).
- SEO metadata for `/` and `/about` → Tasks 10, 11.
- Edge case “old `/#about` hash links must not dead-end”: the nav no longer emits them; `NavLink` still resolves any remaining anchor hrefs. No in-repo internal `/#about` links remain after Task 12 (verified by the Task 13 full-suite + build).

**2. Placeholder scan:** none. `youtubeUrl: ''` is an intentional, tested empty-state (Task 8 asserts no YouTube link renders), listed as a Daniel open-point in the spec — not a code placeholder.

**3. Type consistency:** `coachingContent` shape in Task 1 matches every consumer — `LandingSection` props (Task 2) match `ListSection`; `forWhom/problem/result` spread into `LandingSection` in Task 10; `MethodPhase`/`FaqItem`/`LeadMagnet` consumed in Tasks 5/7/8; `BOOKING_URL` reused in Tasks 3/6/9/12. Barrel (Task 9) exports exactly the names imported by Task 10.

---

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review (spec then quality) between tasks.
2. **Inline Execution** — batch execution in this session with checkpoints.

Git-safety reminder for subagents (per this project’s history): never run destructive git (`reset --hard`, `checkout -- <file>`, `clean`) — there is an uncommitted change in the working tree to preserve. Commit only the files each task lists.
