import { workshopContent } from './content';

/** Counts words in a string. */
const wc = (s: string) => s.trim().split(/\s+/).length;

describe('workshop content module', () => {
  it('exposes the hero headline from the vault copy', () => {
    expect(workshopContent.hero.headline).toMatch(/KI-Souveränität/);
    expect(workshopContent.hero.headline).toMatch(/Rechnung/);
    expect(workshopContent.hero.headline).toMatch(/Roadmap/);
  });

  it('keeps the hero intro terse — the Kante, not the process', () => {
    expect(workshopContent.hero.intro).toMatch(/Bauchgefühl/);
    expect(workshopContent.hero.intro).toMatch(/Anbieter-Folien/);
    // Content-Leitfaden: "Kurze Formeln statt Romane" — hero stays under 50 words.
    expect(wc(workshopContent.hero.intro)).toBeLessThanOrEqual(50);
  });

  it('provides the six at-a-glance facts a decision-maker needs', () => {
    const g = workshopContent.atAGlance;
    expect(g.duration).toMatch(/90 Minuten/);
    expect(g.price).toMatch(/99 €/);
    expect(g.capacity).toMatch(/5 Plätze/);
    expect(g.preWork).toMatch(/Pre-Work/);
    expect(g.payment).toMatch(/keine Kreditkarte/);
  });

  it('promises two outcome artefacts (Rechnung + Roadmap)', () => {
    expect(workshopContent.outcome.artefacts).toHaveLength(2);
    expect(workshopContent.outcome.artefacts[0].name).toMatch(/Souveränitäts-Rechnung/);
    expect(workshopContent.outcome.artefacts[1].name).toMatch(/90-Tage-Roadmap/);
  });

  it('lists exactly five agenda blocks as short fragments', () => {
    const { blocks } = workshopContent.agenda;
    expect(blocks).toHaveLength(5);
    expect(blocks[0].name).toMatch(/Lage/);
    expect(blocks[4].name).toMatch(/Abschluss/);
    // Each block is a fragment, not a sentence — max 10 words.
    for (const b of blocks) {
      expect(wc(b.content)).toBeLessThanOrEqual(10);
    }
  });

  it('marks the two agenda blocks that produce the artefacts', () => {
    const withResults = workshopContent.agenda.blocks.filter((b) => b.result);
    expect(withResults.map((b) => b.result)).toContain('Deine Rechnung');
    expect(withResults.map((b) => b.result)).toContain('Deine Roadmap');
  });

  it('provides the demarcation as scannable bullets plus one Kante line', () => {
    const { demarcation } = workshopContent;
    expect(demarcation.heading).toMatch(/NICHT bekommst/);
    expect(demarcation.bullets).toHaveLength(3);
    expect(demarcation.bullets.join(' ')).toMatch(/Folienschlacht/);
    expect(demarcation.kante).toMatch(/Cloud bleibt für uns richtig/);
  });

  it('keeps the framework to the fine print not already in the at-a-glance box', () => {
    const labels = workshopContent.framework.items.map((i) => i.label);
    expect(labels).toEqual(['Aufzeichnung', 'Ablauf', 'Pilot']);
  });

  it('provides the newsletter consent text from the vault copy', () => {
    expect(workshopContent.consent.newsletter).toMatch(/E-Mail-Adresse/);
    expect(workshopContent.consent.newsletter).toMatch(/Abmeldung/);
  });

  it('provides the storno conditions and links to the privacy page', () => {
    expect(workshopContent.legal.stornoConditions).toMatch(/Verschiebung/);
    expect(workshopContent.legal.stornoConditions).toMatch(/storniere/);
    expect(workshopContent.legal.privacyHref).toBe('/datenschutz');
  });

  it('stays within the Content-Leitfaden norm of 200–300 words', () => {
    const c = workshopContent;
    const g = c.atAGlance;
    const total =
      wc(c.hero.intro) +
      [g.duration, g.price, g.capacity, g.preWork, g.payment].reduce((n, s) => n + wc(s), 0) +
      c.outcome.artefacts.reduce((n, a) => n + wc(a.name) + wc(a.body), 0) +
      c.agenda.blocks.reduce((n, b) => n + wc(b.content) + (b.result ? wc(b.result) : 0), 0) +
      c.demarcation.bullets.reduce((n, b) => n + wc(b), 0) +
      wc(c.demarcation.kante) +
      c.framework.items.reduce((n, i) => n + wc(i.label) + wc(i.value), 0) +
      wc(c.consent.newsletter) +
      wc(c.legal.stornoConditions);
    expect(total).toBeLessThanOrEqual(300);
  });
});
