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

/** Weg-Outcome → Volltext-Variante. „beschreiben" rendert den Weg-A-Text (Spec D). */
function wegToVariant(weg: Weg): WegVariant {
  switch (weg) {
    case "stufe-0":
      return "stufe-0";
    case "beschreiben":
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
  /** Raw Weg outcome — used by the toolkit to highlight the lead's path. */
  weg: Weg;
  /** Score-Band-Absatz mit eingesetztem Score. */
  scoreParagraph: string;
  kontextZeile: string;
  typDiagnose: string;
  /** „Was das für Dich bedeutet" — 0–2 Personalisierungs-Absätze. */
  bedeutung: string[];
  schritte: readonly [string, string, string];
  wegVolltext: string;
  gfSatz: string;
  antiPattern: string;
  /** Nur die Belege, die im Ergebnis tatsächlich vorkamen, in Render-Reihenfolge. */
  sources: ReportSource[];
}

/** Personalisierungs-Block (Punkt 3) — Prioritätsreihenfolge, gekappt bei 2. */
function buildBedeutung(answers: Answers, typ: Dimension): string[] {
  const out: string[] = [];

  // S6 (PoC / eingestellt) sind sich gegenseitig ausschließend.
  if (answers.S6 === "poc") out.push(PERSONALISIERUNG.poc);
  else if (answers.S6 === "eingestellt") out.push(PERSONALISIERUNG.eingestellt);

  if (answers.S1 === "2w-plus" && (typ === "uebergabe-stau" || typ === "schnittstellen-luecke")) {
    out.push(PERSONALISIERUNG.zweiWochen);
  }
  if (answers.K4 === "infrastruktur" || answers.K4 === "keine-it") {
    out.push(PERSONALISIERUNG.itInfrastruktur);
  }
  if (answers.K2 === "ue2000" || answers.K2 === "u50") {
    out.push(PERSONALISIERUNG.groesseRand);
  }

  return out.slice(0, MAX_PERSONALISIERUNG);
}

/** Quellen-Auswahl (Punkt 8) — nur Belege, deren Inhalt gerendert wird. */
function selectSources(answers: Answers, typ: Dimension, variant: WegVariant): ReportSource[] {
  const needed = new Set<SourceId>();
  needed.add("salesforce2024"); // Kontext-Zeile zeigt die 27 % in jedem Band

  if (typ === "wissens-monopol") needed.add("kyocera2018");
  if (typ === "schnittstellen-luecke") needed.add("salesforce2025");
  if (typ === "uebergabe-stau" || variant === "weg-a") {
    needed.add("encowaySchulte"); // Schulte erscheint in Diagnose UND im Weg-A-Text
    needed.add("camosRsp"); // RSP ebenso
  }
  if (typ === "mess-blindflug" || answers.S6 === "poc") needed.add("gartner2024");

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
  return {
    score: result.score,
    band: result.band,
    bandName: BAND_COPY[result.band].name,
    typ: result.typ,
    typName: TYP_COPY[result.typ].name,
    weg: result.weg,
    scoreParagraph: SCORE_BAND_PARAGRAPH[result.band].replace(/\{score\}/g, String(result.score)),
    kontextZeile: KONTEXT_ZEILE,
    typDiagnose: TYP_DIAGNOSE[result.typ],
    bedeutung: buildBedeutung(answers, result.typ),
    schritte: TYP_SCHRITTE[result.typ],
    wegVolltext: WEG_VOLLTEXT[variant],
    gfSatz: GF_SATZ[result.typ],
    antiPattern: TYP_ANTIPATTERN[result.typ],
    sources: selectSources(answers, result.typ, variant),
  };
}
