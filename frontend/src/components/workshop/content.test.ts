import { workshopContent } from './content';

describe('workshop content module', () => {
  it('exposes the hero headline from the vault copy', () => {
    expect(workshopContent.hero.headline).toMatch(/KI-Souveränität/);
    expect(workshopContent.hero.headline).toMatch(/Rechnung/);
    expect(workshopContent.hero.headline).toMatch(/Roadmap/);
  });

  it('provides the hero intro text from the vault copy', () => {
    expect(workshopContent.hero.intro).toMatch(/Bauchgefühl/);
    expect(workshopContent.hero.intro).toMatch(/Anbieter-Folien/);
    expect(workshopContent.hero.intro).toMatch(/90 Minuten/);
  });

  it('lists exactly five agenda blocks from the vault plan', () => {
    expect(workshopContent.agenda.blocks).toHaveLength(5);
    expect(workshopContent.agenda.blocks[0].name).toMatch(/Lage/);
    expect(workshopContent.agenda.blocks[2].name).toMatch(/Messen/);
    expect(workshopContent.agenda.blocks[4].name).toMatch(/Abschluss/);
  });

  it('promises two outcome artefacts (Rechnung + Roadmap)', () => {
    expect(workshopContent.outcome.artefacts).toHaveLength(2);
    expect(workshopContent.outcome.artefacts[0]).toMatch(/Souveränitäts-Rechnung/);
    expect(workshopContent.outcome.artefacts[1]).toMatch(/90-Tage-Roadmap/);
  });

  it('provides the demarcation block from the vault copy', () => {
    expect(workshopContent.demarcation.heading).toMatch(/NICHT bekommst/);
    expect(workshopContent.demarcation.body).toMatch(/Folienschlacht/);
    expect(workshopContent.demarcation.body).toMatch(/Cloud bleibt für uns richtig/);
  });

  it('provides the framework block with termin, price, capacity, pre-work, recording, pilot clause', () => {
    const { framework } = workshopContent;
    expect(framework.priceLabel).toMatch(/99/);
    expect(framework.capacityLabel).toMatch(/5 Unternehmen/);
    expect(framework.preWorkLabel).toMatch(/Vorbereitung/);
    expect(framework.recordingLabel).toMatch(/Aufzeichnung/);
    expect(framework.pilotClause).toMatch(/ab 3/);
  });

  it('provides the newsletter consent text from the vault copy', () => {
    expect(workshopContent.consent.newsletter).toMatch(/E-Mail-Adresse/);
    expect(workshopContent.consent.newsletter).toMatch(/Abmeldung/);
  });

  it('provides the storno/verschiebe conditions for the legal block', () => {
    expect(workshopContent.legal.stornoConditions).toMatch(/Verschiebung/);
    expect(workshopContent.legal.stornoConditions).toMatch(/storniere/);
  });

  it('references the privacy page from the legal block', () => {
    expect(workshopContent.legal.privacyHref).toBe('/datenschutz');
  });
});
