/**
 * Report-Modell — Tests.
 *
 * Kernanforderung der Spec: pro Ergebnis nur die zutreffenden Typ-/Weg-/
 * Quellen-Bausteine, und KEINE Zahl ohne hinterlegte Quelle. Die Property
 * unten prüft genau das bidirektional: ein Beleg erscheint im Quellen-Block
 * genau dann, wenn seine Zahl/sein Case im sichtbaren Text vorkommt.
 */

import fc from "fast-check";
import { QUESTIONS } from "./questions";
import { computeResult } from "./scoring";
import { buildReportModel } from "./report";
import type { Answers } from "./types";

const answersArb: fc.Arbitrary<Answers> = fc.record(
  Object.fromEntries(QUESTIONS.map((q) => [q.id, fc.constantFrom(...q.options.map((o) => o.id))])),
) as fc.Arbitrary<Answers>;

function answers(overrides: Partial<Answers>): Answers {
  const base: Answers = {};
  for (const q of QUESTIONS) base[q.id] = q.options[0].id;
  return { ...base, ...overrides };
}

const model = (a: Answers) => buildReportModel(a, computeResult(a));
const sourceIds = (a: Answers) => model(a).sources.map((s) => s.id);

describe("score interpolation", () => {
  it("substitutes the score into the band paragraph", () => {
    const a = answers({ S2: "alle", S3: "fast-alles", S4: "nichts", S5: "nein", S6: "poc" });
    const m = model(a);
    expect(m.scoreParagraph).toContain(`${m.score} von 100`);
    expect(m.scoreParagraph).not.toContain("{score}");
  });
});

describe("weg → volltext mapping", () => {
  it("'beschreiben' (S4 ≥ 2, S5 < 2) renders its own describe-first text, not the Weg-A text", () => {
    const a = answers({ S4: "wenig", S5: "teilweise" }); // S4=2 → beschreiben
    const v = model(a).wegVolltext;
    expect(v).toContain("erst beschreiben");
    expect(v).not.toContain("Automatisieren — und zwar wahrscheinlich ganz ohne");
  });

  it("'beschreiben' no longer pulls in the Schulte/RSP sources", () => {
    const a = answers({ S4: "nichts", S6: "produktiv" }); // wissens dim 3 → beschreiben
    const ids = sourceIds(a);
    expect(ids).not.toContain("encowaySchulte");
    expect(ids).not.toContain("camosRsp");
  });

  it("S5 ≥ 2 renders the Stufe-0 text", () => {
    const a = answers({ S5: "kaum" });
    expect(model(a).wegVolltext).toContain("noch keiner — und das ist die richtige");
  });
});

describe("source selection — only what actually appears", () => {
  it("Mess-Blindflug → Salesforce 2024 + Gartner", () => {
    const a = answers({ S5: "nein" }); // mess-blindflug dominant, weg stufe-0
    expect(sourceIds(a).sort()).toEqual(["gartner2024", "salesforce2024"]);
  });

  it("Wissens-Monopol without PoC → Salesforce 2024 + Kyocera (no Gartner)", () => {
    const a = answers({ S4: "nichts", S6: "produktiv" }); // S4=3 dominant, but S4≥2 → weg beschreiben
    const ids = sourceIds(a);
    expect(ids).toContain("kyocera2018");
    expect(ids).toContain("salesforce2024");
    expect(ids).not.toContain("gartner2024");
  });

  it("Wissens-Monopol WITH PoC → adds Gartner", () => {
    const a = answers({ S4: "nichts", S6: "poc" });
    expect(sourceIds(a)).toContain("gartner2024");
  });

  it("Übergabe-Stau → Salesforce 2024 + Schulte + RSP", () => {
    const a = answers({ S2: "alle", S5: "teilweise", S4: "alles" });
    expect(sourceIds(a).sort()).toEqual(["camosRsp", "encowaySchulte", "salesforce2024"]);
  });

  it("Schnittstellen-Lücke (Weg A) → Salesforce 2024 + Salesforce 2025 + Schulte + RSP", () => {
    const a = answers({ S3: "fast-alles", S5: "teilweise", S4: "alles" });
    const ids = sourceIds(a);
    expect(ids).toContain("salesforce2025");
    expect(ids).toContain("encowaySchulte"); // Weg-A-Text nennt Schulte/RSP
    expect(ids).toContain("camosRsp");
  });
});

describe("personalisierung (Punkt 3)", () => {
  it("S6 = PoC adds the PoC paragraph", () => {
    expect(model(answers({ S6: "poc" })).bedeutung.join(" ")).toContain("Proof of Concept steckengeblieben");
  });

  it("S1 = 2 Wochen + Übergabe-Stau adds the tempo paragraph", () => {
    const a = answers({ S1: "2w-plus", S2: "alle", S5: "teilweise", S4: "alles" });
    expect(model(a).bedeutung.join(" ")).toContain("Zwei Wochen oder mehr");
  });

  it("K4 = reine Infrastruktur → IT paragraph lives in einordnung, not bedeutung", () => {
    const m = model(answers({ K4: "infrastruktur" }));
    expect(m.einordnung.join(" ")).toContain("kümmert sich um Infrastruktur");
    expect(m.bedeutung.join(" ")).not.toContain("kümmert sich um Infrastruktur");
  });

  it("caps at two paragraphs", () => {
    const a = answers({ S6: "poc", S1: "2w-plus", S2: "alle", S5: "teilweise", S4: "alles", K4: "keine-it" });
    expect(model(a).bedeutung.length).toBeLessThanOrEqual(2);
  });

  it("omits the block entirely when no rule applies", () => {
    const a = answers({ S6: "produktiv", S1: "lt-1d", K4: "baut-regelmaessig", K2: "250-1000" });
    expect(model(a).bedeutung).toEqual([]);
  });
});

describe("no dominant typ (max Dimension ≤ 1)", () => {
  it("flags noDominantTyp when no dimension stands out at all", () => {
    expect(model(answers({})).noDominantTyp).toBe(true); // all best → all dims 0
    expect(model(answers({ S2: "alle" })).noDominantTyp).toBe(false); // uebergabe 3
  });

  it("flags noDominantTyp when the strongest dimension is only 1", () => {
    expect(model(answers({ S2: "gelegentlich" })).noDominantTyp).toBe(true); // uebergabe 1
  });

  it("does NOT flag when a dimension reaches 2", () => {
    expect(model(answers({ S4: "wenig" })).noDominantTyp).toBe(false); // wissens 2
  });

  it("replaces the typ diagnosis with the no-dominant block (no Mess-Blindflug claim)", () => {
    const m = model(answers({}));
    expect(m.typDiagnose).toContain("Keine der vier Engstellen");
    expect(m.typDiagnose).not.toContain("Du steuerst Deinen Vertrieb, ohne die Instrumente");
  });

  it("uses neutral schritte / gf / anti-pattern (no case-study markers)", () => {
    const m = model(answers({ S2: "gelegentlich" }));
    const joined = [...m.schritte, m.gfSatz, m.antiPattern].join(" ");
    expect(joined).not.toContain("Schulte");
    expect(joined).not.toContain("RSP");
  });

  it("in the Spürbar band, the score intro does not promise a single Engpass-Typ", () => {
    // S1=2w-plus(2) + S6=poc(3) + S2=gelegentlich(1) → score 35 (Spürbar), max dim 1
    const a = answers({ S1: "2w-plus", S6: "poc", S2: "gelegentlich" });
    const m = model(a);
    expect(m.band).toBe("spuerbar");
    expect(m.noDominantTyp).toBe(true);
    expect(m.scoreParagraph).not.toContain("klar benennbaren Stelle");
    expect(m.scoreParagraph).not.toContain("Engpass-Typ weiter unten");
  });

  it("drops typ-based sources, keeping only what actually appears", () => {
    // all best, K4 default 'baut-regelmaessig' → weg-c (no markers), S6 not PoC
    expect(sourceIds(answers({})).sort()).toEqual(["salesforce2024"]);
  });
});

describe("einordnung — disclaimers always shown, outside the bedeutung cap (#4)", () => {
  it("groesseRand (out-of-range) is shown even when bedeutung is already full", () => {
    // poc + zweiWochen fill bedeutung (cap 2); K2=ue2000 + K4=keine-it are disclaimers
    const a = answers({
      K2: "ue2000",
      K4: "keine-it",
      S6: "poc",
      S1: "2w-plus",
      S2: "alle", // → Übergabe-Stau, so zweiWochen fires
      S5: "teilweise",
    });
    const m = model(a);
    expect(m.bedeutung.length).toBe(2); // poc + zweiWochen
    expect(m.einordnung.join(" ")).toContain("außerhalb dieser Spanne"); // groesseRand survives
    expect(m.einordnung.join(" ")).toContain("kümmert sich um Infrastruktur"); // itInfrastruktur too
  });

  it("is empty when no disclaimer applies", () => {
    expect(model(answers({ K2: "250-1000", K4: "baut-regelmaessig" })).einordnung).toEqual([]);
  });

  it("never carries the personalization (poc) into einordnung", () => {
    const m = model(answers({ S6: "poc", K2: "u50" }));
    expect(m.einordnung.join(" ")).not.toContain("Proof of Concept");
    expect(m.bedeutung.join(" ")).toContain("Proof of Concept steckengeblieben");
  });
});

describe("typ ↔ weg consistency (#2)", () => {
  it("real Mess-Blindflug (dim ≥ 2 via S1 bonus) gets weg stufe-0, not Kaufen/Bauen", () => {
    const a = answers({ S1: "unbekannt", S5: "teilweise" }); // mess dim 2 → typ mess, NOT noDominantTyp
    const m = model(a);
    expect(m.noDominantTyp).toBe(false);
    expect(m.typDiagnose).toContain("Du steuerst Deinen Vertrieb, ohne die Instrumente");
    expect(m.weg).toBe("stufe-0");
    expect(m.wegVolltext).toContain("noch keiner — und das ist die richtige");
  });

  it("no dominant typ → weg section is the 'no clear path' text, not a confident tendency", () => {
    const m = model(answers({ S2: "gelegentlich" })); // typ uebergabe value 1 → noDominantTyp, weg-a
    expect(m.noDominantTyp).toBe(true);
    expect(m.wegVolltext).toContain("Noch kein klarer Weg");
    expect(m.wegVolltext).not.toContain("Automatisieren — und zwar wahrscheinlich ganz ohne");
  });

  it("no dominant typ + weg-a drops Schulte/RSP sources (their text is overridden)", () => {
    expect(sourceIds(answers({ S2: "gelegentlich" })).sort()).toEqual(["salesforce2024"]);
  });
});

describe("invariant: a source is shown IFF its number/case appears in the text", () => {
  it("holds for arbitrary answers (no unsourced number, no orphan source)", () => {
    fc.assert(
      fc.property(answersArb, (a) => {
        const m = model(a);
        const text = [
          m.scoreParagraph,
          m.kontextZeile,
          m.typDiagnose,
          ...m.einordnung,
          ...m.bedeutung,
          ...m.schritte,
          m.wegVolltext,
          m.gfSatz,
          m.antiPattern,
        ].join("\n");
        const ids = new Set(m.sources.map((s) => s.id));

        // marker present in shown text  ⟺  source present in the Quellen block
        const checks: [boolean, string][] = [
          [/State of Sales, 2024/.test(text), "salesforce2024"],
          [/Gartner/.test(text), "gartner2024"],
          [/Statista/.test(text), "kyocera2018"],
          [/State of Sales, 2025/.test(text), "salesforce2025"],
          [/Schulte/.test(text), "encowaySchulte"],
          [/RSP/.test(text), "camosRsp"],
        ];
        for (const [markerPresent, id] of checks) {
          expect(ids.has(id)).toBe(markerPresent);
        }
      }),
      { numRuns: 3 },
    );
  });
});
