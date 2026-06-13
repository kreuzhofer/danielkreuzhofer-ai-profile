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
  it("'beschreiben' (S4 ≥ 2, S5 < 2) renders the Weg-A text", () => {
    const a = answers({ S4: "wenig", S5: "teilweise" }); // S4=2 → beschreiben
    expect(model(a).wegVolltext).toContain("Automatisieren — und zwar wahrscheinlich ganz ohne");
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

  it("K4 = reine Infrastruktur adds the IT paragraph", () => {
    expect(model(answers({ K4: "infrastruktur" })).bedeutung.join(" ")).toContain(
      "kümmert sich um Infrastruktur",
    );
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

describe("invariant: a source is shown IFF its number/case appears in the text", () => {
  it("holds for arbitrary answers (no unsourced number, no orphan source)", () => {
    fc.assert(
      fc.property(answersArb, (a) => {
        const m = model(a);
        const text = [
          m.scoreParagraph,
          m.kontextZeile,
          m.typDiagnose,
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
