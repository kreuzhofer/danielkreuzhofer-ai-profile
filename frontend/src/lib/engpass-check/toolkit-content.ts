/**
 * Engpass-Check — Umsetzungs-Toolkit content (the gated PDF value).
 *
 * Grounded in Daniel's material: the Wege-Entscheidungsbaum + Engpass-Raster come
 * from Video #05 (Akt 3/4) in his voice; the 6 cases are verbatim from the
 * verified DACH case research (with sources); the 90-day skeleton is a compact
 * 3-phase orientation pointing to V03 (the full Smart-AI-Wins system stays in the
 * paid offer). Review-grounded — Daniel can edit any wording here.
 */

import type { Weg } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Engpass-Raster (ausfüllbares Worksheet) — Punkt: "das ausfüllbare Engpass-Raster"
// ─────────────────────────────────────────────────────────────────────────────

export interface RasterStep {
  title: string;
  intro: string;
  /** Field prompts to fill in (rendered as lines/boxes in the PDF). */
  fields: string[];
}

export const ENGPASS_RASTER: { intro: string; steps: RasterStep[] } = {
  intro:
    "Mit diesem Raster gehst Du Deinen Prozess Schritt für Schritt durch, findest die Engstelle " +
    "und legst die drei Zahlen fest, an denen Du später Erfolg misst. Druck es aus oder füll es " +
    "digital aus — 20 Minuten, einmal sauber.",
  steps: [
    {
      title: "1. Dein Angebotsprozess — Schritt für Schritt",
      intro:
        "Schreib die Stationen auf, die ein Angebot von der Anfrage bis zum Versand durchläuft. " +
        "Markier hinter jeder Station, ob dort jemand wartet, prüft oder von Hand überträgt.",
      fields: [
        "Station 1 (z.B. Anfrage erfassen): __________  · wartet/prüft/Handarbeit? ____",
        "Station 2: __________  · wartet/prüft/Handarbeit? ____",
        "Station 3: __________  · wartet/prüft/Handarbeit? ____",
        "Station 4: __________  · wartet/prüft/Handarbeit? ____",
        "Station 5 (z.B. Angebot versenden): __________  · wartet/prüft/Handarbeit? ____",
      ],
    },
    {
      title: "2. Deine Engstelle",
      intro:
        "An welcher Station staut es sich am meisten? Und welcher Art ist der Stau — eine Übergabe " +
        "zwischen Abteilungen, Wissen in einem Kopf, eine fehlende Schnittstelle, oder fehlt die " +
        "Messung selbst?",
      fields: [
        "Die Engstelle sitzt bei: ______________________________________",
        "Art des Engpasses (Übergabe / Wissen / Schnittstelle / Messung): ____________",
      ],
    },
    {
      title: "3. Deine drei Baseline-Zahlen",
      intro:
        "Diese drei Zahlen erhebst Du ab dieser Woche vier Wochen lang — von Hand reicht. Sie sind " +
        "Dein Vorher-Wert und Dein Beweis.",
      fields: [
        "Durchlaufzeit eines Angebots (Anfrage → Versand): __________",
        "Win-Rate (Angebote zu Aufträgen): __________",
        "Umsatz pro Funnel-Stufe: __________",
      ],
    },
    {
      title: "4. Dein Ziel-Satz",
      intro: "Diesen Satz musst Du ausfüllen können, bevor sich der nächste Schritt lohnt:",
      fields: [
        "„Wenn wir an Stelle ______________ arbeiten, wollen wir ____________ um ______ % bewegen — " +
          "messbar bis ____________.“",
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Wege-Entscheidungsbaum (Punkt: "der Entscheidungsbaum für die drei Wege")
// Verbatim-nah aus Video #05 Akt 3/4 (Daniels Stimme).
// ─────────────────────────────────────────────────────────────────────────────

export interface WegNode {
  key: Weg | "stufe-0";
  pfad: "Stufe 0" | "Weg A" | "Weg B" | "Weg C";
  title: string;
  wenn: string;
  text: string;
}

export const WEGE_BAUM: { intro: string; nodes: WegNode[]; itCheck: string } = {
  intro:
    "Erst Problem und Messbarkeit, dann der Lösungsweg — und es sind drei Wege, nicht zwei. Geh " +
    "den Baum von oben nach unten: Die erste Bedingung, die auf Dich zutrifft, ist Dein Weg.",
  nodes: [
    {
      key: "stufe-0",
      pfad: "Stufe 0",
      title: "Erst messen",
      wenn: "Du kannst Erfolg heute nicht messen.",
      text:
        "Bevor Du baust, kaufst oder automatisierst, brauchst Du eine Baseline. Ohne Vorher-Zahl " +
        "kannst Du keinen Erfolg beweisen — und ein Projekt, dessen Erfolg Du nicht beweisen kannst, " +
        "wird beim nächsten Budget-Review gestrichen. Vier Wochen Zahlen sammeln, dann weiter. " +
        "Warten ist hier eine Entscheidung, kein Aufschub.",
    },
    {
      key: "weg-a",
      pfad: "Weg A",
      title: "Automatisieren — ohne KI",
      wenn: "Dein Engpass ist eine regelbasierte Übergabe oder eine fehlende Schnittstelle.",
      text:
        "Eine Regel-Strecke, eine Workflow-Engine, ein Konfigurator — wenn-dann. Ganz oft ist das " +
        "die Lösung, kein KI-Projekt. Schulte (70 % schnellere Angebote) und RSP (von zwei Stunden " +
        "auf zehn Minuten) haben genau das gemacht. Kein LLM, keine Halluzinationen, keine " +
        "Datenschutz-Diskussion. Prüf diesen Weg zuerst.",
    },
    {
      key: "weg-b",
      pfad: "Weg B",
      title: "Kaufen — fertige Lösung vom Markt",
      wenn: "Dein Engpass ist ein Standard-Problem, das tausende Firmen haben.",
      text:
        "Saubere Kontaktdaten, Meeting-Transkription, Dokumenten-Versand mit Unterschrift — solche " +
        "Probleme hat jede zweite Firma, und was tausende Firmen haben, hat längst jemand gelöst, " +
        "wahrscheinlich besser, als Du es selbst bauen würdest. Schau Dich am Markt um, bevor Du " +
        "etwas baust. Der Preis: weniger Flexibilität — eine gekaufte Lösung ist, wie sie ist, Du " +
        "passt Deine Prozesse an.",
    },
    {
      key: "weg-c-denkbar",
      pfad: "Weg C",
      title: "Bauen — nur unter drei Bedingungen",
      wenn: "Der Workflow ist Dein Wettbewerbsvorteil — UND Du hast Know-how/Partner — UND ein klares Ziel.",
      text:
        "Der Weg mit dem höchsten Risiko und unter diesen drei Bedingungen mit dem höchsten Hebel. " +
        "Fehlt eine der drei, lass es. Wenn Du baust: such nicht die eierlegende Wollmilchsau — den " +
        "einen KI-Experten, der alles kann, stellst Du nicht ein. Es wird eine Kombination aus " +
        "externer Beratung, eigenen Leuten und ggf. einem Partner. Und gib nicht zu viel an Externe: " +
        "ein kleines internes Team muss mitentwickeln, sonst verschwindet das Wissen, wenn der " +
        "Partner seine Leute tauscht.",
    },
  ],
  itCheck:
    "Vorab-Check für Weg C — stell Deiner IT die ehrliche Frage: „Baut ihr Software, oder seid ihr " +
    "ein Infrastruktur-Team?“ In vielen Mittelständlern kümmert sich die IT um Server, Netzwerk und " +
    "Lizenzen. Das ist völlig in Ordnung — aber dann ist „machen wir intern“ keine Option, und das " +
    "willst Du wissen, bevor Du planst.",
};

/** Map a result's Weg to the decision-tree node that gets highlighted. */
export function highlightedWeg(weg: Weg): WegNode["pfad"] {
  if (weg === "stufe-0") return "Stufe 0";
  if (weg === "weg-a" || weg === "beschreiben") return "Weg A";
  if (weg === "weg-b") return "Weg B";
  return "Weg C";
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 geprüfte Cases (verbatim aus der DACH-Case-Recherche, mit Quellen)
// ─────────────────────────────────────────────────────────────────────────────

export interface CaseStudy {
  pfad: "A" | "B" | "C";
  company: string;
  context: string;
  engpass: string;
  loesung: string;
  outcome: string;
  quote?: string;
  quelleName: string;
  url: string;
}

export const CASES: CaseStudy[] = [
  {
    pfad: "A",
    company: "Schulte Elektrotechnik",
    context: "Elektrotechnik, Lüdenscheid (konfigurierbare EVOline-Steckerleisten-Systeme)",
    engpass:
      "Jede Angebots-Konfiguration brauchte Rückfragen bei der Konstruktion — die Konstruktion wurde zur internen Engpass-Ressource.",
    loesung:
      "encoway CPQ-Sales-Konfigurator (Standardsoftware, kein KI/LLM): führt durch die Varianten, prüft die technische Plausibilität automatisch, erzeugt das Angebot direkt aus SAP-Produktdaten.",
    outcome: "Angebotserstellung 70 % schneller; Rückfragen bei der Konstruktion entfallen.",
    quote:
      "„Die benötigte Zeit für die Angebotserstellung wurde im Schnitt um 70 Prozent gesenkt.“ — Manfred Aulmann, Leiter Konstruktion",
    quelleName: "encoway-Referenz",
    url: "https://www.encoway.de/referenzen/schulte-evoline/",
  },
  {
    pfad: "A",
    company: "Brückner Maschinenbau",
    context: "Maschinen- und Anlagenbau, Siegsdorf (~2.000 MA)",
    engpass:
      "Bis zu 85 Dokumente und 16 verschiedene Tools pro Angebot; Produktwissen in Einzelpersonen konzentriert.",
    loesung: "camos CPQ + itmX crm ersetzen die 16 Programme — Konfiguration, Kalkulation und Angebot regelbasiert in einem System.",
    outcome:
      "Standardangebot ~45 Minuten schneller, bei komplexen Angeboten mehrere Stunden; Produktwissen zentral gesichert.",
    quote:
      "„Die Erstellung von Standardangeboten wurde um durchschnittlich 45 Minuten pro Angebot verkürzt.“ — Markus Wendlinger, Prozessexperte",
    quelleName: "camos.de",
    url: "https://www.camos.de/de/info-center/cpq-und-crm-brueckner-maschinenbau-setzt-auf-das-erfolgsduo",
  },
  {
    pfad: "B",
    company: "simpleshow",
    context: "E-Learning / SaaS, Berlin (~260 MA)",
    engpass: "Mangelhafte Datenqualität im DACH-Raum; manueller CSV-Export/-Import in Salesforce.",
    loesung: "Wechsel zu Cognism (B2B-Sales-Intelligence) mit direkter Salesforce-Integration.",
    outcome: "2,9 Mio. € DACH-Pipeline, 425 neue Meetings, dreifacher ROI (Stand 2022).",
    quote:
      "„Unsere Pipeline für den DACH-Markt hat 2022 einen Wert von 2,9 Millionen EUR erreicht … eine dreifache Rendite auf unsere Investition.“ — Filipa Enes, Sales Administrator",
    quelleName: "cognism.com",
    url: "https://www.cognism.com/de/blog/simpleshow-case-study",
  },
  {
    pfad: "B",
    company: "Roto Dachsystemtechnologie (Roto DST)",
    context: "Bauzulieferer / Dachsystemtechnik, Bad Mergentheim",
    engpass: "Lead-Vermittlung an Dachdecker-Partner lief manuell über den Innendienst; kein durchgängiger Funnel.",
    loesung: "Vollautomatisiertes Lead-Vermittlungsportal auf HubSpot (Sales/Service/Marketing Hub) mit Partner TRIALTA.",
    outcome: "+50 % über Endkunden-Leads generierter Umsatz im 2. Jahr; manuelle Zuweisung entfällt.",
    quote:
      "„Wir können heute den kompletten Prozess von der Werbeanzeige bis zum eingebauten Fenster messen und optimieren.“ — Roto DST",
    quelleName: "hubspot.de / TRIALTA",
    url: "https://www.hubspot.de/case-studies/roto-dst",
  },
  {
    pfad: "C",
    company: "RSP Spezialsaugtechnik",
    context: "Sondermaschinenbau (Saugbagger), Saalfeld",
    engpass:
      "Über 200 Konfigurationsoptionen, keine automatische Baubarkeits-Prüfung — jedes Angebot mehrfach zur Konstruktion.",
    loesung: "camos CPQ mit eigens abgebildeter RSP-Produktlogik (alle Abhängigkeiten, Regeln, länderspezifische Vorschriften), ERP/PLM-integriert.",
    outcome: "Standardangebot von 2 Stunden auf ~10 Minuten (Faktor 12), ~1.000 Angebote/Jahr, alle technisch geprüft.",
    quote:
      "„Was früher Stunden gedauert hat, erledigen wir heute in Minuten.“ — Robert Hohl, Projektmanager Sales",
    quelleName: "immittelstand.de / camos",
    url: "https://www.immittelstand.de/2026/06/09/angebote-in-minuten-statt-stunden-rsp-digitalisiert-den-vertrieb-komplexer-saugbagger-mit-camos-cpq/",
  },
  {
    pfad: "C",
    company: "IT-Dienstleister (DACH, anonymisiert)",
    context: "IT-Services / Managed Services (~45 MA)",
    engpass: "60 % der Vertriebszeit für manuelle Lead-Qualifizierung; Reaktionszeit auf Anfragen 24–48 Stunden.",
    loesung: "Custom Sales-AI-Pipeline mit Partner VerdaGen.ai (Lead-Qualifizierung, Angebots-Vorbereitung, Nachfass-Sequenzen; n8n + CRM). Projektdauer 7 Wochen.",
    outcome: "Reaktionszeit von 31 Stunden auf 4 Minuten; +28 % qualifizierte Leads; 40 % weniger Routinezeit.",
    quote: undefined, // Case anonymisiert — kein namentliches Zitat veröffentlicht.
    quelleName: "verdagen.ai (anonymisierter Case)",
    url: "https://verdagen.ai/case-studies",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 90-Tage-Plan (kompakt) + Brücke zu V03 / Erstgespräch
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_90: { intro: string; phasen: { titel: string; wochen: string; text: string }[]; bruecke: string } = {
  intro:
    "Steht Dein Weg, kommt die Umsetzung. So sieht das Grundgerüst aus, mit dem die erfolgreichen " +
    "5 % in 90 Tagen einen bewiesenen Piloten liefern — kein Big-Bang-Rollout, erst beweisen, dann skalieren.",
  phasen: [
    {
      titel: "Bremsen lösen",
      wochen: "Wochen 1–3",
      text:
        "Business-Case final ausarbeiten und grünes Licht holen: Wie haben andere das Problem gelöst, " +
        "was ist technisch möglich, Build vs. Buy. Mit Zahlen und einem klaren Plan ins Management.",
    },
    {
      titel: "Pilot umsetzen",
      wochen: "Wochen 4–8",
      text:
        "Klein und fokussiert mit 3–5 Power-Usern. Tool-Shortlist, Buy-vs-Build-Entscheidung, Setup, " +
        "Onboarding — und ab Tag 1 kontinuierlich messen: Wird's besser, nutzen die Leute es wirklich?",
    },
    {
      titel: "Impact beweisen",
      wochen: "Wochen 9–12",
      text:
        "Erfolgsmetriken vorher/nachher. Am Ende stehen messbare Zahlen, eine interne Erfolgsgeschichte " +
        "und eine Entscheidungsgrundlage: team-weit ausrollen — oder Learnings in den nächsten Use-Case.",
    },
  ],
  bruecke:
    "Das ganze System Schritt für Schritt — inklusive der Muster, an denen die 95 % scheitern — " +
    "steckt im 90-Tage-Framework-Video (V03). Wenn Du es an Deinem konkreten Fall durchgehen willst, " +
    "ist das genau das Thema für ein Erstgespräch.",
};

export const BUSINESS_CASE = {
  text:
    "Für den Pitch vor der Geschäftsführung: der ausfüllbare KI-Business-Case One-Pager — vom " +
    "konkreten Problem zu belastbaren Zahlen in 15 Minuten.",
  href: "/downloads/business-case-one-pager",
  label: "Zum Business-Case One-Pager",
} as const;

export const TOOLKIT_LABELS = {
  badge: "Dein Umsetzungs-Toolkit",
  raster: "Das Engpass-Raster (zum Ausfüllen)",
  baum: "Der Entscheidungsbaum: Deine drei Wege",
  cases: "6 geprüfte Cases aus dem Mittelstand",
  plan: "Die nächsten 90 Tage (Kurz-Überblick)",
  businessCase: "Business-Case für Deine GF",
  print: "Als PDF speichern",
} as const;
