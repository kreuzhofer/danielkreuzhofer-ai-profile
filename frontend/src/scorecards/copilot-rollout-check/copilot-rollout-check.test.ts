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

describe("Copilot-Rollout-Check definition", () => {
  it("is registered and resolvable by slug", () => {
    expect(reg).toBeDefined();
    expect(reg.definition.slug).toBe("copilot-rollout-check");
  });

  it("has the 8 spec questions in order with the right kinds", () => {
    const ids = reg.definition.questions.map((q) => q.id);
    expect(ids).toEqual(["K1", "K2", "K3", "S1", "S2", "S3", "S4", "K4"]);
    for (const q of reg.definition.questions) {
      expect(q.kind).toBe(q.id.startsWith("S") ? "score" : "context");
    }
  });

  it("every score question offers exactly the points 0–3, with 'weiss-nicht' as the 0", () => {
    const scoreQs = reg.definition.questions.filter((q) => q.kind === "score");
    expect(scoreQs).toHaveLength(4);
    for (const q of scoreQs) {
      const points = q.options.map((o) => o.points).sort();
      expect(points).toEqual([0, 1, 2, 3]);
      const zero = q.options.find((o) => o.points === 0)!;
      expect(zero.id).toBe("weiss-nicht");
    }
    expect(reg.definition.scoring).toEqual({ maxPoints: 12, direction: "higher-better" });
  });

  it("maps the four dimensions to categories in question order", () => {
    const categories = reg.definition.questions
      .filter((q) => q.kind === "score")
      .map((q) => q.category);
    expect(categories).toEqual(["anbieter", "training", "berechtigungen", "lizenz"]);
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
    const k1 = reg.definition.questions.find((q) => q.id === "K1")!;
    const k2 = reg.definition.questions.find((q) => q.id === "K2")!;
    const qualifying = (q: typeof k1) => q.options.filter((o) => o.qualifies).map((o) => o.id);
    expect(qualifying(k1)).toEqual(["vertriebsleiter", "gf", "bereichsleitung"]);
    expect(qualifying(k2)).toEqual(["50-250", "250-1000", "1000-2000"]);

    expect(buildResult(reg.definition, answers({ K1: "gf", K2: "50-250" })).qualified).toBe(true);
    expect(buildResult(reg.definition, answers({ K1: "it-leitung", K2: "50-250" })).qualified).toBe(false);
    expect(buildResult(reg.definition, answers({ K1: "gf", K2: "u50" })).qualified).toBe(false);
  });
});

describe("bands (Daniel-approved: Blindflug / Bauchgefühl / Fast startklar / Rollout-ready)", () => {
  it("defines the four bands with the approved boundaries", () => {
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

  it("0 raw points → score 0 → Blindflug; 12/12 → score 100 → Rollout-ready", () => {
    const worst = buildResult(
      reg.definition,
      answers({ S1: "weiss-nicht", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht" }),
    );
    expect(worst.score).toBe(0);
    expect(worst.outcome).toBe("blindflug");

    const best = buildResult(reg.definition, answers({}));
    expect(best.rawSum).toBe(12);
    expect(best.score).toBe(100);
    expect(best.outcome).toBe("rollout-ready");
  });

  it("attainable raw sums land in the right band around the boundaries", () => {
    // raw 3 → 25 (Blindflug) vs raw 4 → 33 (Bauchgefühl)
    const raw3 = buildResult(
      reg.definition,
      answers({ S1: "dokumentiert", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht" }),
    );
    expect(raw3.score).toBe(25);
    expect(raw3.outcome).toBe("blindflug");

    // raw 6 → 50 (Bauchgefühl) vs raw 7 → 58 (Fast startklar)
    const raw6 = buildResult(
      reg.definition,
      answers({ S1: "bekannt", S2: "muendlich", S3: "review-geplant", S4: "weiss-nicht" }),
    );
    expect(raw6.rawSum).toBe(6);
    expect(raw6.score).toBe(50);
    expect(raw6.outcome).toBe("bauchgefuehl");

    const raw7 = buildResult(
      reg.definition,
      answers({ S1: "dokumentiert", S2: "muendlich", S3: "ohne-review", S4: "haendler" }),
    );
    expect(raw7.rawSum).toBe(7);
    expect(raw7.score).toBe(58);
    expect(raw7.outcome).toBe("fast-startklar");
  });
});

describe("next lever (schwächste Dimension = Dein erster Auftrag)", () => {
  it("picks the weakest dimension", () => {
    const result = buildResult(reg.definition, answers({ S3: "weiss-nicht" }));
    expect(result.nextLever).toBe("berechtigungen");
  });

  it("resolves ties to the earlier question (S1 first)", () => {
    const allEqual = buildResult(
      reg.definition,
      answers({ S1: "bekannt", S2: "muendlich", S3: "review-geplant", S4: "schiene-ja" }),
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

describe("cleverreachTags (hot-Flag lives here, NOT in the engine)", () => {
  const tagsFor = (overrides: Partial<Answers>) => {
    const a = answers(overrides);
    return reg.cleverreachTags!(buildResult(reg.definition, a), a);
  };

  it("always tags copilot-stand and bremse", () => {
    const tags = tagsFor({ K3: "gekauft-aktiv", K4: "kosten" });
    expect(tags).toContain("copilot-stand:gekauft-aktiv");
    expect(tags).toContain("bremse:kosten");
  });

  it("fires rollout-hot: qualified + K3 rollout-geplant + score ≤ 50", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "rollout-geplant",
      S1: "nie-draufgeschaut", S2: "nie-geprueft", S3: "ohne-review", S4: "haendler", // raw 4 → 33
    });
    expect(tags).toContain("rollout-hot");
  });

  it("fires rollout-hot: qualified + K3 gekauft-kaum-genutzt + score exactly 50", () => {
    const tags = tagsFor({
      K1: "vertriebsleiter", K2: "250-1000", K3: "gekauft-kaum-genutzt",
      S1: "bekannt", S2: "muendlich", S3: "review-geplant", S4: "weiss-nicht", // raw 6 → 50
    });
    expect(tags).toContain("rollout-hot");
  });

  it("does NOT fire above score 50, even when qualified with a hot K3", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "rollout-geplant",
      S1: "dokumentiert", S2: "muendlich", S3: "ohne-review", S4: "haendler", // raw 7 → 58
    });
    expect(tags).not.toContain("rollout-hot");
  });

  it("does NOT fire when unqualified, even with hot K3 and score 0", () => {
    const tags = tagsFor({
      K1: "team", K2: "50-250", K3: "rollout-geplant",
      S1: "weiss-nicht", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht",
    });
    expect(tags).not.toContain("rollout-hot");
  });

  it("does NOT fire for a non-hot K3 (aktiver Einsatz), even qualified with low score", () => {
    const tags = tagsFor({
      K1: "gf", K2: "50-250", K3: "gekauft-aktiv",
      S1: "weiss-nicht", S2: "weiss-nicht", S3: "weiss-nicht", S4: "weiss-nicht",
    });
    expect(tags).not.toContain("rollout-hot");
    expect(tags).toContain("copilot-stand:gekauft-aktiv");
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

  it("carries the spec landing footer and the corrected question count", () => {
    expect(reg.content.intro.meta).toBe(
      "Kostenlos · Stand der Recherche Juli 2026 · keine Rechtsberatung",
    );
    // Spec promise says "7 Fragen", but K1–K4 + S1–S4 are 8 — the count is corrected.
    expect(reg.content.intro.lead).toMatch(/8 Fragen/);
  });

  it("S1 = 0 (weiß nicht) surfaces the date-robust Auto-Enable fact, regardless of score", () => {
    const a = answers({ S1: "weiss-nicht" }); // other S at 3 → high score
    const report = buildScorecardReport(reg, buildResult(reg.definition, a), a);
    expect(report.bedeutung[0]).toContain("24. Juli 2026");
    expect(report.bedeutung[0]).toContain("sofern niemand aktiv widerspricht");

    const clean = answers({});
    const cleanReport = buildScorecardReport(reg, buildResult(reg.definition, clean), clean);
    expect(cleanReport.bedeutung).toHaveLength(0);
  });

  it("gated tipps deliver the vier Aufträge (mapped to the four categories) plus the Anbieter-Tabelle", () => {
    const tipps = reg.content.tipps!;
    expect(tipps).toHaveLength(5);
    expect(tipps.slice(0, 4).map((h) => h.category)).toEqual([
      "anbieter", "training", "berechtigungen", "lizenz",
    ]);
    expect(tipps[4].category).toBeUndefined();
    expect(tipps[4].title).toMatch(/Anbieter-Tabelle/);
    expect(tipps[4].tipps).toHaveLength(4); // 4 Stufen der Eskalations-Leiter
  });

  it("every Auftrag-Hebel opens with the kopierbarer Auftrag and carries a Checkliste below it", () => {
    const tipps = reg.content.tipps!;
    for (const hebel of tipps.slice(0, 4)) {
      expect(hebel.tipps[0].lead).toBe("Dein Auftrag:");
      // Checkliste = at least one concrete Fundort/Prüfpunkt below the Auftrag
      expect(hebel.tipps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("Checkliste 1 names the exact admin-center locations (tenant-verified paths)", () => {
    const body = JSON.stringify(reg.content.tipps![0]);
    expect(body).toMatch(/KI-Anbieter, die als Microsoft-Unterauftragsverarbeiter tätig sind/);
    expect(body).toMatch(/admin\.microsoft\.com/);
    expect(body).toMatch(/Enable External models/);
    expect(body).toMatch(/25\. März 2026/); // Apps-Checkbox-Gotcha für neue EU-Tenants
    expect(body).toMatch(/Message Center/);
  });

  it("Checkliste 2 maps all four Modell-Stufen to their Beleg-Quelle", () => {
    const hebel = JSON.stringify(reg.content.tipps![1]);
    expect(hebel).toMatch(/aren't used to train foundation LLMs/); // Stufe 1: Privacy-Doc-Zitat
    expect(hebel).toMatch(/Product Terms/); // Stufe 2: Subprozessoren
    expect(hebel).toMatch(/Mistral/); // Stufe 3: Fremd-Anbieter
    expect(hebel).toMatch(/express permission/); // Stufe 4: Preview mit Retention
    expect(hebel).toMatch(/24\. Juli 2026/); // Auto-Enable zählt als aktivierte Stufe
  });

  it("Checkliste 3 is honest about per-user reports and names the concrete tools", () => {
    const hebel = JSON.stringify(reg.content.tipps![2]);
    expect(hebel).toMatch(/gibt es tenant-weit nicht/);
    expect(hebel).toMatch(/Data-Access-Governance/);
    expect(hebel).toMatch(/SharePoint Advanced Management/);
    expect(hebel).toMatch(/Berechtigungen überprüfen/); // Pro-Nutzer-Stichprobe
    expect(hebel).toMatch(/DSPM/);
  });

  it("die neuen Aufträge 2 und 3 benennen Stufen bzw. Review-Weg statt vager Anweisungen", () => {
    const hebelTexts = reg.content.tipps!;
    const auftrag2 = hebelTexts[1].tipps[0].body;
    expect(auftrag2).toMatch(/Microsoft-gehostete Modelle/);
    expect(auftrag2).toMatch(/Beleg-Dokument/);
    const auftrag3 = hebelTexts[2].tipps[0].body;
    expect(auftrag3).toMatch(/Oversharing-Reports/);
    expect(auftrag3).toMatch(/Stichprobe/);
  });

  it("opt-in gate sells the Auftrags-Paket (Outcome + Inventar) and names the sub-processors", () => {
    expect(reg.content.optin.heading).toBe("Hol Dir das Auftrags-Paket für Deine IT");
    expect(reg.content.optin.body).toMatch(/ohne Rückfragen/);
    expect(reg.content.optin.body).toMatch(/Klickpfaden/);
    expect(reg.content.optin.body).toMatch(/Anbieter-Tabelle/);
    expect(reg.content.optin.datenschutzHinweis).toMatch(/CleverReach/);
    expect(reg.content.optin.datenschutzHinweis).toMatch(/IONOS/);
  });

  it("sources include the training commitment and the oversharing blueprint", () => {
    const ids = reg.content.sources.map((s) => s.id);
    expect(ids).toContain("ms-copilot-privacy");
    expect(ids).toContain("ms-secure-govern-blueprint");
    expect(reg.content.sources.length).toBe(6);
  });

  it("uses no em-dashes anywhere in the German copy (AI-Tell rule)", () => {
    expect(JSON.stringify(reg.content)).not.toContain("—");
  });
});
