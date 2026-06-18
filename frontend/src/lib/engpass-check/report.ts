/**
 * Engpass-Check — Report-Modell.
 *
 * Pure Funktion: wählt aus dem verbatim Content-Baukasten (`report-content.ts`)
 * für ein konkretes Ergebnis NUR die zutreffenden Typ-/Weg-/Personalisierungs-
 * und Quellen-Bausteine. Keine Zahl ohne hinterlegte Quelle: der Quellen-Block
 * rendert genau die Belege, deren Inhalt im Ergebnis tatsächlich vorkommt.
 */

import { BAND_COPY, TYP_COPY } from "./copy";
import {
  GF_SATZ,
  KONTEXT_ZEILE,
  NO_TYP_ANTIPATTERN,
  NO_TYP_DIAGNOSE,
  NO_TYP_GF_SATZ,
  NO_TYP_SCHRITTE,
  NO_TYP_SCORE_SPUERBAR,
  NO_TYP_WEG,
  PERSONALISIERUNG,
  SCORE_BAND_PARAGRAPH,
  SOURCES,
  TYP_ANTIPATTERN,
  TYP_DIAGNOSE,
  TYP_SCHRITTE,
  WEG_VOLLTEXT,
  type ReportSource,
  type SourceId,
  type WegVariant,
} from "./report-content";
import type { Answers, Band, Dimension, EngpassResult, Weg } from "./types";

/** Spec „1–2-Absatz-Block" → höchstens zwei Personalisierungs-Absätze. */
const MAX_PERSONALISIERUNG = 2;

/**
 * Höchster Dimensionswert, bei dem noch KEIN Engpass-Typ dominiert. Bis hierhin
 * (max Dimension ≤ 1) ist der „Typ" nur ein Tie-Break-Default bzw. ein einzelner
 * schwacher Punkt — dann zeigt der Report den „Kein dominanter Engpass"-Block
 * statt einer (falschen) Typ-Diagnose. Entscheidung mit Daniel 2026-06-15.
 */
const NO_DOMINANT_TYP_MAX = 1;

/** Weg-Outcome → Volltext-Variante. „beschreiben" hat einen eigenen Text (Wissens-
 *  Monopol-Vorstufe zu Weg A) — NICHT mehr der Weg-A-/Schulte-Text. */
function wegToVariant(weg: Weg): WegVariant {
  switch (weg) {
    case "stufe-0":
      return "stufe-0";
    case "beschreiben":
      return "beschreiben";
    case "weg-a":
      return "weg-a";
    case "weg-b":
      return "weg-b";
    case "weg-c-denkbar":
      return "weg-c";
  }
}

export interface ReportModel {
  score: number;
  band: Band;
  bandName: string;
  typ: Dimension;
  typName: string;
  /** Keine Dimension dominiert (max ≤ 1) → „Kein dominanter Engpass"-Darstellung. */
  noDominantTyp: boolean;
  /** Raw Weg outcome — used by the toolkit to highlight the lead's path. */
  weg: Weg;
  /** Score-Band-Absatz mit eingesetztem Score. */
  scoreParagraph: string;
  kontextZeile: string;
  typDiagnose: string;
  /** „Was das für Dich bedeutet" — 0–2 Personalisierungs-Absätze. */
  bedeutung: string[];
  /** Disclaimer/Einordnung (Größe außerhalb Spanne, IT baut nicht) — immer gezeigt, wenn zutreffend. */
  einordnung: string[];
  schritte: readonly [string, string, string];
  wegVolltext: string;
  gfSatz: string;
  antiPattern: string;
  /** Nur die Belege, die im Ergebnis tatsächlich vorkamen, in Render-Reihenfolge. */
  sources: ReportSource[];
  /** Enthält die Quellen eine Firmen-Case-Anbieterreferenz (Schulte/RSP)? → Transparenz-Hinweis (#8). */
  hasVendorCaseSource: boolean;
}

/**
 * Personalisierungs-Block (Punkt 3) — nur echte „Was bedeutet das für mich"-Insights
 * (PoC/eingestellt + Zwei-Wochen), gekappt bei 2. Die relativierenden Disclaimer
 * (Größe/IT) sind bewusst NICHT hier, sondern in `buildEinordnung` (#4).
 */
function buildBedeutung(answers: Answers, typ: Dimension): string[] {
  const out: string[] = [];

  // S6 (PoC / eingestellt) sind sich gegenseitig ausschließend.
  if (answers.S6 === "poc") out.push(PERSONALISIERUNG.poc);
  else if (answers.S6 === "eingestellt") out.push(PERSONALISIERUNG.eingestellt);

  if (answers.S1 === "2w-plus" && (typ === "uebergabe-stau" || typ === "schnittstellen-luecke")) {
    out.push(PERSONALISIERUNG.zweiWochen);
  }

  return out.slice(0, MAX_PERSONALISIERUNG);
}

/**
 * Einordnungs-/Disclaimer-Block — relativiert die Gültigkeit des Reports
 * (Unternehmensgröße außerhalb der Spanne; IT baut keine Software). Wird IMMER
 * gezeigt, wenn er zutrifft (kein Cap), damit diese Hinweise nicht durch den
 * 2er-Cap der Personalisierung weggeschnitten werden (#4). Beide Texte markerfrei.
 */
function buildEinordnung(answers: Answers): string[] {
  const out: string[] = [];
  if (answers.K2 === "ue2000" || answers.K2 === "u50") out.push(PERSONALISIERUNG.groesseRand);
  if (answers.K4 === "infrastruktur" || answers.K4 === "keine-it") {
    out.push(PERSONALISIERUNG.itInfrastruktur);
  }
  return out;
}

/**
 * Quellen-Auswahl (Punkt 8) — nur Belege, deren Inhalt gerendert wird.
 * Im No-Typ-Fall entfällt die Typ-Diagnose, also auch alle typ-getriebenen
 * Belege; Weg- und PoC-getriebene Belege (deren Zahlen weiter erscheinen)
 * bleiben, damit die „keine Zahl ohne Quelle"-Invariante hält.
 */
function selectSources(
  answers: Answers,
  typ: Dimension,
  variant: WegVariant,
  noDominantTyp: boolean,
): ReportSource[] {
  const needed = new Set<SourceId>();
  needed.add("salesforce2024"); // Kontext-Zeile zeigt die 27 % in jedem Band

  if (!noDominantTyp) {
    if (typ === "wissens-monopol") needed.add("kyocera2018");
    if (typ === "schnittstellen-luecke") needed.add("salesforce2025");
    if (typ === "uebergabe-stau") {
      needed.add("encowaySchulte"); // Schulte erscheint in der Typ-Diagnose
      needed.add("camosRsp"); // RSP ebenso
    }
    if (typ === "mess-blindflug") needed.add("gartner2024");
  }
  // Der Weg-A-Volltext (mit Schulte/RSP) wird im No-Typ-Fall durch NO_TYP_WEG
  // ersetzt — dann erscheinen die Namen nicht, also auch ihre Belege nicht.
  if (!noDominantTyp && variant === "weg-a") {
    needed.add("encowaySchulte"); // Weg-A-Text nennt Schulte …
    needed.add("camosRsp"); // … und RSP
  }
  if (answers.S6 === "poc") needed.add("gartner2024"); // PoC-Personalisierung nennt die Gartner-Zahl

  // Stabile Render-Reihenfolge (grob top-to-bottom des Reports).
  const order: SourceId[] = [
    "salesforce2024",
    "gartner2024",
    "kyocera2018",
    "salesforce2025",
    "encowaySchulte",
    "camosRsp",
  ];
  return order.filter((id) => needed.has(id)).map((id) => SOURCES[id]);
}

export function buildReportModel(answers: Answers, result: EngpassResult): ReportModel {
  const variant = wegToVariant(result.weg);
  const noDominantTyp = Math.max(...Object.values(result.dimensions)) <= NO_DOMINANT_TYP_MAX;

  // No-Typ-Fall: der reguläre Spürbar-Absatz verspricht einen einzelnen Typ
  // („… sagt Dir Dein Engpass-Typ weiter unten") — den ersetzen wir. Feintuning
  // („keine akute Engstelle") passt schon und bleibt.
  const scoreSource =
    noDominantTyp && result.band === "spuerbar"
      ? NO_TYP_SCORE_SPUERBAR
      : SCORE_BAND_PARAGRAPH[result.band];

  const sources = selectSources(answers, result.typ, variant, noDominantTyp);

  return {
    score: result.score,
    band: result.band,
    bandName: BAND_COPY[result.band].name,
    typ: result.typ,
    typName: TYP_COPY[result.typ].name,
    noDominantTyp,
    weg: result.weg,
    scoreParagraph: scoreSource.replace(/\{score\}/g, String(result.score)),
    kontextZeile: KONTEXT_ZEILE,
    typDiagnose: noDominantTyp ? NO_TYP_DIAGNOSE : TYP_DIAGNOSE[result.typ],
    einordnung: buildEinordnung(answers),
    bedeutung: buildBedeutung(answers, result.typ),
    schritte: noDominantTyp ? NO_TYP_SCHRITTE : TYP_SCHRITTE[result.typ],
    wegVolltext: noDominantTyp ? NO_TYP_WEG : WEG_VOLLTEXT[variant],
    gfSatz: noDominantTyp ? NO_TYP_GF_SATZ : GF_SATZ[result.typ],
    antiPattern: noDominantTyp ? NO_TYP_ANTIPATTERN : TYP_ANTIPATTERN[result.typ],
    sources,
    hasVendorCaseSource: sources.some(
      (s) => s.id === "encowaySchulte" || s.id === "camosRsp",
    ),
  };
}
