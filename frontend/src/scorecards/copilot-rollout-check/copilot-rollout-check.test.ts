import { getScorecard } from "@/lib/scorecard/registry";
import { buildResult } from "@/lib/scorecard/result";
import { resolveOutcome } from "@/lib/scorecard/outcome";
import { buildScorecardReport } from "@/lib/scorecard/report-model";
import type { Answers } from "@/lib/scorecard/types";

const reg = getScorecard("copilot-rollout-check")!;

/** Build answers from terse overrides, defaulting each question to its first option. */
function answers(overrides: Partial<Answers>): Answers {
  const base: Answers = {};
  for (const q of reg.definition.questions) base[q.id] = q.options[0].id;
  const merged: Answers = { ...base };
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) merged[k] = v;
  }
  return merged;
}

/** All eight score questions at 0 points. */
const ALL_WEISS_NICHT: Partial<Answers> = {
  S1: "weiss-nicht", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht",
  N1: "weiss-nicht", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht",
};

describe("Copilot-Rollout-Check definition (v2: Einführung + Nutzung)", () => {
  it("is registered and resolvable by slug", () => {
    expect(reg).toBeDefined();
    expect(reg.definition.slug).toBe("copilot-rollout-check");
  });

  it("has the 12 questions in order with the right kinds", () => {
    const ids = reg.definition.questions.map((q) => q.id);
    expect(ids).toEqual([
      "K1", "K2", "K3", "S1", "S2", "S3", "S4", "N1", "N2", "N3", "N4", "K4",
    ]);
    for (const q of reg.definition.questions) {
      const isScore = q.id.startsWith("S") || q.id.startsWith("N");
      expect(q.kind).toBe(isScore ? "score" : "context");
    }
  });

  it("every score question offers exactly the points 0–3, with 'weiss-nicht' as the 0", () => {
    const scoreQs = reg.definition.questions.filter((q) => q.kind === "score");
    expect(scoreQs).toHaveLength(8);
    for (const q of scoreQs) {
      const points = q.options.map((o) => o.points).sort();
      expect(points).toEqual([0, 1, 2, 3]);
      const zero = q.options.find((o) => o.points === 0)!;
      expect(zero.id).toBe("weiss-nicht");
    }
    expect(reg.definition.scoring).toEqual({ maxPoints: 24, direction: "higher-better" });
  });

  it("maps the eight dimensions to categories in question order", () => {
    const categories = reg.definition.questions
      .filter((q) => q.kind === "score")
      .map((q) => q.category);
    expect(categories).toEqual([
      "anbieter", "training", "berechtigungen", "lizenz",
      "use-case", "basislinie", "befaehigung", "entscheid",
    ]);
  });

  it("uses rollout_-prefixed attribute keys on the context questions", () => {
    const byId = new Map(reg.definition.questions.map((q) => [q.id, q]));
    expect(reg.definition.attributePrefix).toBe("rollout_");
    expect(byId.get("K1")!.attributeKey).toBe("rollout_rolle");
    expect(byId.get("K2")!.attributeKey).toBe("rollout_groesse");
    expect(byId.get("K3")!.attributeKey).toBe("rollout_copilot_stand");
    expect(byId.get("K4")!.attributeKey).toBe("rollout_bremse");
  });

  it("qualifies on K1 (Führungsrolle) AND K2 (50–2.000), like the KI-Führungs-Check", () => {
    expect(reg.definition.qualification.requireQualifies).toEqual(["K1", "K2"]);
    expect(buildResult(reg.definition, answers({ K1: "gf", K2: "50-250" })).qualified).toBe(true);
    expect(buildResult(reg.definition, answers({ K1: "it-leitung", K2: "50-250" })).qualified).toBe(false);
    expect(buildResult(reg.definition, answers({ K1: "gf", K2: "u50" })).qualified).toBe(false);
  });
});

describe("bands (keys stable for old leads; labels renamed for the Nutzungs-Erweiterung)", () => {
  it("keeps the four band KEYS unchanged (stored results from v1 must keep rendering)", () => {
    const outcome = reg.definition.outcome;
    expect(outcome.type).toBe("bands");
    if (outcome.type !== "bands") return;
    expect(outcome.bands).toEqual([
      { key: "blindflug", min: 0, max: 25 },
      { key: "bauchgefuehl", min: 26, max: 50 },
      { key: "fast-startklar", min: 51, max: 75 },
      { key: "rollout-ready", min: 76, max: 100 },
    ]);
  });

  it("renames the upper two LABELS (Daniel-approved 27.07.)", () => {
    expect(reg.content.outcomeLabel.blindflug).toBe("Blindflug");
    expect(reg.content.outcomeLabel.bauchgefuehl).toBe("Bauchgefühl");
    expect(reg.content.outcomeLabel["fast-startklar"]).toBe("Auf halber Strecke");
    expect(reg.content.outcomeLabel["rollout-ready"]).toBe("Läuft und liefert");
  });

  it("resolves the exact band boundaries 25/26, 50/51 and 75/76", () => {
    const at = (score: number) =>
      resolveOutcome(reg.definition.outcome, { score, categoryScores: {} });
    expect(at(25)).toBe("blindflug");
    expect(at(26)).toBe("bauchgefuehl");
    expect(at(50)).toBe("bauchgefuehl");
    expect(at(51)).toBe("fast-startklar");
    expect(at(75)).toBe("fast-startklar");
    expect(at(76)).toBe("rollout-ready");
  });

  it("0 raw points → score 0 → Blindflug; 24/24 → score 100 → Läuft und liefert", () => {
    const worst = buildResult(reg.definition, answers(ALL_WEISS_NICHT));
    expect(worst.score).toBe(0);
    expect(worst.outcome).toBe("blindflug");

    const best = buildResult(reg.definition, answers({}));
    expect(best.rawSum).toBe(24);
    expect(best.score).toBe(100);
    expect(best.outcome).toBe("rollout-ready");
  });

  it("attainable raw sums land in the right band around the boundaries (24-Punkte-Basis)", () => {
    // raw 6 → 25 (Blindflug) vs raw 7 → 29 (Bauchgefühl)
    const raw6 = buildResult(
      reg.definition,
      answers({ ...ALL_WEISS_NICHT, S1: "dokumentiert", S2: "schriftlich" }),
    );
    expect(raw6.rawSum).toBe(6);
    expect(raw6.score).toBe(25);
    expect(raw6.outcome).toBe("blindflug");

    // raw 12 → 50 (Bauchgefühl): der #10-Wunschlead — Rollout perfekt, Nutzung null
    const raw12 = buildResult(
      reg.definition,
      answers({ N1: "weiss-nicht", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht" }),
    );
    expect(raw12.rawSum).toBe(12);
    expect(raw12.score).toBe(50);
    expect(raw12.outcome).toBe("bauchgefuehl");

    // raw 13 → 54 (Auf halber Strecke)
    const raw13 = buildResult(
      reg.definition,
      answers({ N1: "fuer-alle", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht" }),
    );
    expect(raw13.rawSum).toBe(13);
    expect(raw13.score).toBe(54);
    expect(raw13.outcome).toBe("fast-startklar");

    // raw 18 → 75 (Auf halber Strecke) vs raw 19 → 79 (Läuft und liefert)
    const raw18 = buildResult(
      reg.definition,
      answers({ N1: "ideen-liste", N2: "geschaetzt", N3: "nur-verteilt", N4: "laeuft-weiter" }),
    );
    expect(raw18.rawSum).toBe(18);
    expect(raw18.outcome).toBe("fast-startklar");

    const raw19 = buildResult(
      reg.definition,
      answers({ N1: "ideen-liste", N2: "geschaetzt", N3: "nur-verteilt", N4: "irgendwann" }),
    );
    expect(raw19.rawSum).toBe(19);
    expect(raw19.outcome).toBe("rollout-ready");
  });
});

describe("next lever (schwächste der acht Dimensionen = Dein erster Auftrag)", () => {
  it("picks the weakest dimension, also from the Nutzungs-Block", () => {
    expect(buildResult(reg.definition, answers({ S3: "weiss-nicht" })).nextLever).toBe("berechtigungen");
    expect(buildResult(reg.definition, answers({ N2: "weiss-nicht" })).nextLever).toBe("basislinie");
  });

  it("resolves ties to the earlier question (S1 first)", () => {
    const allEqual = buildResult(
      reg.definition,
      answers({
        S1: "bekannt", S2: "muendlich", S3: "review-geplant", S4: "schiene-ja",
        N1: "ideen-liste", N2: "geschaetzt", N3: "schulung", N4: "irgendwann",
      }),
    );
    expect(allEqual.nextLever).toBe("anbieter");
  });
});

describe("registry pins (attribution + funnel wiring)", () => {
  it("pins trackmysalesCode explicitly to 'copilot-rollout-check' (never the slug default)", () => {
    expect(reg.trackmysalesCode).toBe("copilot-rollout-check");
  });

  it("pins cleverreachSource and the mail subjects from the handoff", () => {
    expect(reg.cleverreachSource).toBe("copilot-rollout-check");
    expect(reg.doiSubject).toBe("Ein Klick noch, dann kommt Dein Auftrags-Paket");
    expect(reg.deliverySubject).toBe("Dein Auftrags-Paket ist da");
    expect(reg.bookingUrl).toContain("calendly.com");
  });
});

describe("cleverreachTags (rollout-hot unverändert; nutzung-hot neu für den #10-Lead)", () => {
  const tagsFor = (overrides: Partial<Answers>) => {
    const a = answers(overrides);
    return reg.cleverreachTags!(buildResult(reg.definition, a), a);
  };

  it("always tags copilot-stand and bremse", () => {
    const tags = tagsFor({ K3: "gekauft-aktiv", K4: "kosten" });
    expect(tags).toContain("copilot-stand:gekauft-aktiv");
    expect(tags).toContain("bremse:kosten");
  });

  it("rollout-hot fires: qualified + K3 rollout-geplant + Gesamt-Score ≤ 50", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "rollout-geplant",
      S1: "nie-draufgeschaut", S2: "nie-geprueft", S3: "ohne-review", S4: "haendler",
      N1: "fuer-alle", N2: "gefuehl", N3: "nur-verteilt", N4: "laeuft-weiter", // raw 8 → 33
    });
    expect(tags).toContain("rollout-hot");
  });

  it("rollout-hot fires at exactly Score 50 (raw 12 von 24)", () => {
    const tags = tagsFor({
      K1: "vertriebsleiter", K2: "250-1000", K3: "gekauft-kaum-genutzt",
      N1: "weiss-nicht", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht",
    });
    expect(tags).toContain("rollout-hot");
  });

  it("rollout-hot does NOT fire above Score 50", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "rollout-geplant",
      N1: "fuer-alle", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht", // raw 13 → 54
    });
    expect(tags).not.toContain("rollout-hot");
  });

  it("nutzung-hot fires: qualified + gekauft-kaum-genutzt + Nutzungs-Block exakt an der Grenze (6/12)", () => {
    // Rollout perfekt (12), Nutzung 6 → Gesamt 75: rollout-hot nein, nutzung-hot ja
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "gekauft-kaum-genutzt",
      N1: "ideen-liste", N2: "geschaetzt", N3: "nur-verteilt", N4: "laeuft-weiter",
    });
    expect(tags).toContain("nutzung-hot");
    expect(tags).not.toContain("rollout-hot");
  });

  it("nutzung-hot fires with Nutzung at 0, even alongside rollout-hot", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "gekauft-kaum-genutzt",
      N1: "weiss-nicht", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht",
    });
    expect(tags).toContain("nutzung-hot");
    expect(tags).toContain("rollout-hot"); // Gesamt 50 → beide Tags, ein Lead kann beide tragen
  });

  it("nutzung-hot does NOT fire above 6 Nutzungs-Punkten", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "gekauft-kaum-genutzt",
      N1: "ideen-liste", N2: "geschaetzt", N3: "nur-verteilt", N4: "irgendwann", // Nutzung 7
    });
    expect(tags).not.toContain("nutzung-hot");
  });

  it("nutzung-hot does NOT fire for Zustand A (rollout-geplant): Nutzung 0 ist da noch kein Signal", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "rollout-geplant",
      N1: "weiss-nicht", N2: "weiss-nicht", N3: "weiss-nicht", N4: "weiss-nicht",
    });
    expect(tags).not.toContain("nutzung-hot");
  });

  it("nutzung-hot does NOT fire when unqualified", () => {
    const tags = tagsFor({
      K1: "team", K2: "50-250", K3: "gekauft-kaum-genutzt", ...ALL_WEISS_NICHT,
    });
    expect(tags).not.toContain("nutzung-hot");
  });

  it("rollout-hot does NOT fire when unqualified, even with hot K3 and Score 0", () => {
    const tags = tagsFor({ K1: "team", K2: "50-250", K3: "rollout-geplant", ...ALL_WEISS_NICHT });
    expect(tags).not.toContain("rollout-hot");
  });

  it("neither hot tag fires for a non-hot K3 (aktiver Einsatz), even qualified with Score 0", () => {
    const tags = tagsFor({ K1: "gf", K2: "50-250", K3: "gekauft-aktiv", ...ALL_WEISS_NICHT });
    expect(tags).not.toContain("rollout-hot");
    expect(tags).not.toContain("nutzung-hot");
  });
});

describe("v1-Kompatibilität (Deploy-Übergang)", () => {
  it("v1 answers (ohne N-Fragen) resolven weiter: N-Kategorien zählen 0, Band-Key existiert", () => {
    // Simuliert eine Session/Submission aus v1: nur K1-K4 + S1-S4 beantwortet.
    const v1: Answers = {
      K1: "gf", K2: "50-250", K3: "gekauft-kaum-genutzt",
      S1: "dokumentiert", S2: "schriftlich", S3: "review-abgeschlossen", S4: "bewusst-entschieden",
      K4: "datenschutz",
    };
    const result = buildResult(reg.definition, v1);
    expect(result.rawSum).toBe(12); // volle Einführung, Nutzung unbeantwortet = 0
    expect(result.score).toBe(50);
    expect(result.outcome).toBe("bauchgefuehl");
    expect(reg.content.byOutcome[result.outcome]).toBeDefined();
    const report = buildScorecardReport(reg, result, v1);
    expect(report.outcomeLabel).toBe("Bauchgefühl");
  });
});

describe("content (Spec-Texte + Copy-Regeln)", () => {
  it("every band has a content block and a label", () => {
    const bands = reg.definition.outcome.type === "bands" ? reg.definition.outcome.bands : [];
    expect(bands).toHaveLength(4);
    for (const b of bands) {
      expect(reg.content.byOutcome[b.key]).toBeDefined();
      expect(reg.content.outcomeLabel[b.key]).toBeDefined();
    }
  });

  it("carries the spec landing footer and the new question count + both blocks in the promise", () => {
    expect(reg.content.intro.meta).toBe(
      "Kostenlos · Stand der Recherche Juli 2026 · keine Rechtsberatung",
    );
    expect(reg.content.intro.lead).toMatch(/12 Fragen/);
    expect(reg.content.intro.lead).toMatch(/vier für Deine IT, vier für Dich/);
  });

  it("S1 = 0 (weiß nicht) surfaces the date-robust Auto-Enable fact, regardless of score", () => {
    const a = answers({ S1: "weiss-nicht" });
    const report = buildScorecardReport(reg, buildResult(reg.definition, a), a);
    expect(report.bedeutung[0]).toContain("24. Juli 2026");

    const clean = answers({});
    const cleanReport = buildScorecardReport(reg, buildResult(reg.definition, clean), clean);
    expect(cleanReport.bedeutung).toHaveLength(0);
  });

  it("gated tipps deliver acht Aufträge (8 Kategorien in Reihenfolge) plus die Anbieter-Tabelle", () => {
    const tipps = reg.content.tipps!;
    expect(tipps).toHaveLength(9);
    expect(tipps.slice(0, 8).map((h) => h.category)).toEqual([
      "anbieter", "training", "berechtigungen", "lizenz",
      "use-case", "basislinie", "befaehigung", "entscheid",
    ]);
    expect(tipps[8].category).toBeUndefined();
    expect(tipps[8].title).toMatch(/Anbieter-Tabelle/);
    expect(tipps[8].tipps).toHaveLength(4);
  });

  it("every Auftrag-Hebel opens with the kopierbarer Auftrag and carries a Checkliste below it", () => {
    const tipps = reg.content.tipps!;
    for (const hebel of tipps.slice(0, 8)) {
      expect(hebel.tipps[0].lead).toBe("Dein Auftrag:");
      expect(hebel.tipps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("die Entscheider-Aufträge tragen die vier #10-Schritte mit Vorlagen", () => {
    const tipps = reg.content.tipps!;
    const nutzung = JSON.stringify(tipps.slice(4, 8));
    expect(nutzung).toMatch(/einzigen Prozess/); // Use-Case: einer, nicht zwanzig
    expect(nutzung).toMatch(/Wert-Hypothese/); // Basislinie + Ein-Satz-Vorlage
    expect(nutzung).toMatch(/deren Alltag dieser Prozess ist/); // Befähigung
    expect(nutzung).toMatch(/sechs bis acht Wochen/); // Daten-Entscheid
    expect(nutzung).toMatch(/72 Prozent/); // UK-DBT-Beleg: Zufriedenheit ≠ Wert
  });

  it("Checkliste 1 names the exact admin-center locations (tenant-verified paths)", () => {
    const body = JSON.stringify(reg.content.tipps![0]);
    expect(body).toMatch(/KI-Anbieter, die als Microsoft-Unterauftragsverarbeiter tätig sind/);
    expect(body).toMatch(/admin\.microsoft\.com/);
    expect(body).toMatch(/Enable External models/);
    expect(body).toMatch(/25\. März 2026/);
    expect(body).toMatch(/Message Center/);
  });

  it("Checkliste 2 maps all four Modell-Stufen to their Beleg-Quelle", () => {
    const hebel = JSON.stringify(reg.content.tipps![1]);
    expect(hebel).toMatch(/aren't used to train foundation LLMs/);
    expect(hebel).toMatch(/Product Terms/);
    expect(hebel).toMatch(/Mistral/);
    expect(hebel).toMatch(/express permission/);
    expect(hebel).toMatch(/24\. Juli 2026/);
  });

  it("Checkliste 3 is honest about per-user reports and names the concrete tools", () => {
    const hebel = JSON.stringify(reg.content.tipps![2]);
    expect(hebel).toMatch(/gibt es tenant-weit nicht/);
    expect(hebel).toMatch(/Data-Access-Governance/);
    expect(hebel).toMatch(/SharePoint Advanced Management/);
    expect(hebel).toMatch(/Berechtigungen überprüfen/);
    expect(hebel).toMatch(/DSPM/);
  });

  it("opt-in gate sells acht Aufträge (Outcome + Inventar) and names the sub-processors", () => {
    expect(reg.content.optin.heading).toBe("Hol Dir das Auftrags-Paket für Deine IT und für Dich");
    expect(reg.content.optin.body).toMatch(/ohne Rückfragen/);
    expect(reg.content.optin.body).toMatch(/nur Du anstoßen kannst/);
    expect(reg.content.optin.body).toMatch(/Anbieter-Tabelle/);
    expect(reg.content.optin.datenschutzHinweis).toMatch(/CleverReach/);
    expect(reg.content.optin.datenschutzHinweis).toMatch(/IONOS/);
  });

  it("sources include training commitment, oversharing blueprint and the UK-DBT-Trial", () => {
    const ids = reg.content.sources.map((s) => s.id);
    expect(ids).toContain("ms-copilot-privacy");
    expect(ids).toContain("ms-secure-govern-blueprint");
    expect(ids).toContain("uk-dbt-trial");
    expect(reg.content.sources.length).toBe(7);
  });

  it("uses no em-dashes anywhere in the German copy (AI-Tell rule)", () => {
    expect(JSON.stringify(reg.content)).not.toContain("—");
  });
});
