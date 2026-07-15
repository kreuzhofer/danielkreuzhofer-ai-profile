/**
 * Copilot-Rollout-Check — renderer content. Auftrags-Texte, Bänder, Gate-Angebot
 * und der Auto-Enable-Satz sind VERBATIM aus der Quiz-Spec (v1) bzw. den
 * Bau-Anweisungen. Per-Band schritte/antiPattern sind neu formuliert (die Spec
 * definiert dort nur die Ein-Satz-Diagnosen) — für Daniels Kalibrierung markiert.
 * Anbieter-Tabelle + Quellen aus research-2026-07-12 (verifiziert, mit Doc-Stand).
 */

import type { ScorecardContent, TippHebel } from "@/lib/scorecard/content";

/** One of the four Rollout-Entscheidungen ("Dinge" aus Video #09). */
export interface RolloutDimension {
  /** Scoring category on the definition (S1–S4). */
  category: string;
  /** Short display label for the status rows. */
  label: string;
  /** Gated-report heading for this Auftrag. */
  auftragTitle: string;
  /** The fully formulated Auftrag an die IT (spec-verbatim, kopierbar). */
  auftrag: string;
}

export const DIMENSIONEN: RolloutDimension[] = [
  {
    category: "anbieter",
    label: "Anbieter-Schalter",
    auftragTitle: "Auftrag 1: Anbieter-Schalter dokumentieren",
    auftrag:
      "Dokumentiert pro KI-Anbieter-Schalter im M365 Admin Center (Anthropic, OpenAI, Mistral, " +
      "Vorschau-Modelle): Ist er aktiv, wer hat es entschieden, mit welcher Begründung? Achtung: " +
      "Aktivieren gilt als Zustimmung zu den jeweiligen Bedingungen, und die Anbieter unterscheiden " +
      "sich bei der EU-Datengrenze grundlegend.",
  },
  {
    category: "training",
    label: "Training und Datennutzung",
    auftragTitle: "Auftrag 2: Modell-Training schriftlich ausschließen",
    auftrag:
      "Bestätigt schriftlich, dass Firmendaten bei keiner aktivierten Stufe ins Modell-Training " +
      "fließen. Ein Absatz pro Stufe reicht.",
  },
  {
    category: "berechtigungen",
    label: "Berechtigungen",
    auftragTitle: "Auftrag 3: Berechtigungs-Review vor der ersten Lizenz",
    auftrag:
      "Führt ein Berechtigungs-Review für alle Datenquellen durch, die Copilot sehen wird, bevor " +
      "die erste Lizenz verteilt wird. Startet mit einem kleinen, benannten Pilot-Team.",
  },
  {
    category: "lizenz",
    label: "Lizenz und Zahlweise",
    auftragTitle: "Auftrag 4: Lizenz-Schiene und Zahlweise prüfen",
    auftrag:
      "Prüft vor der Bestellung Schiene (Copilot Business ab M365 Business Basic, max. 300 Nutzer, " +
      "vs. Enterprise-Add-on) und Zahlweise (jährlich vs. monatlich). Beides steht auf derselben " +
      "Bestellseite, der Unterschied sind bis zu 40 Prozent.",
  },
];

/** Status word per S-question points (spec: ✅ erledigt / 🟡 halb / 🔴 offen / ⚫ unbekannt). */
export const STATUS_BY_POINTS: Record<number, { icon: string; word: string }> = {
  3: { icon: "✅", word: "erledigt" },
  2: { icon: "🟡", word: "halb" },
  1: { icon: "🔴", word: "offen" },
  0: { icon: "⚫", word: "unbekannt" },
};

/** Date-robust Auto-Enable wording (Bau-Anweisung 5 — no date logic in code). */
export const AUTO_ENABLE_SATZ =
  "Den OpenAI-Anbieter schaltet Microsoft zum 24. Juli 2026 automatisch für alle frei, sofern " +
  "niemand aktiv widerspricht. Prüft, was bei euch an ist.";

/** Gated report: die vier Aufträge (weakest first via nextLever) + Anbieter-Tabelle. */
const tipps: TippHebel[] = [
  ...DIMENSIONEN.map((d) => ({
    category: d.category,
    title: d.auftragTitle,
    subtitle: "Zum Kopieren für Deine IT.",
    tipps: [{ lead: "Dein Auftrag:", body: d.auftrag, evidence: "practice" as const }],
  })),
  {
    title: "Die Anbieter-Tabelle fürs IT-Gespräch",
    subtitle:
      "Vier Schalter, vier verschiedene Rechtslagen. Kompaktfassung, Stand der Recherche 14. Juli 2026.",
    tipps: [
      {
        lead: "Anthropic (Subprozessor-Panel):",
        body:
          "Microsoft-DPA gilt. Verarbeitung außerhalb der EU-Datengrenze (EUDB). Standard: aus.",
        evidence: "data",
      },
      {
        lead: "OpenAI (Subprozessor-Panel):",
        body:
          "Microsoft-DPA gilt. Verarbeitung innerhalb der EU-Datengrenze, nur eine pseudonymisierte " +
          "User-ID geht in die USA. Standard: aus, Auto-Enable zum 24. Juli 2026.",
        evidence: "data",
      },
      {
        lead: "Mistral (Panel „Andere große Sprachmodelle“):",
        body:
          "Der Microsoft-Wrap gilt nicht: Es gelten Mistral-Vertragsbedingungen und Mistral-DPA, " +
          "ohne Microsoft-Zusagen zu Datenresidenz, SLA und Copyright-Schadloshaltung. Betrieb laut " +
          "Dialog außerhalb von Microsoft. Standard: aus, mit separater Zustimmungs-Checkbox.",
        evidence: "data",
      },
      {
        lead: "Anthropic Preview mit Data Retention (Vorschau-Panel):",
        body:
          "Anthropic als eigenständiger Verarbeiter nach Anthropic-Bedingungen, 30 Tage " +
          "Datenaufbewahrung, außerhalb der EU-Datengrenze. Standard: keine Benutzer zugewiesen.",
        evidence: "data",
      },
    ],
  },
];

export const content: ScorecardContent = {
  intro: {
    eyebrow: "Copilot-Rollout-Check",
    heading: "Der Copilot-Rollout-Check",
    // Spec-Versprechen; Fragenzahl auf 8 korrigiert (K1–K4 + S1–S4).
    lead:
      "8 Fragen, 2 Minuten. Danach weißt Du, welche der vier Entscheidungen bei euch noch offen " +
      "sind, bevor Copilot ausrollt, und Du bekommst die offenen als fertig formulierte Aufträge " +
      "für Deine IT.",
    startLabel: "Check starten",
    meta: "Kostenlos · Stand der Recherche Juli 2026 · keine Rechtsberatung",
  },
  resultHeading: "Dein Ergebnis",
  outcomeLabel: {
    blindflug: "Blindflug",
    bauchgefuehl: "Bauchgefühl",
    "fast-startklar": "Fast startklar",
    "rollout-ready": "Rollout-ready",
  },
  // KEIN scoreParagraph: numerischer Score bleibt unsichtbar (Daniel 15.07.,
  // wie bei den anderen Checks) — er existiert nur intern für Bänder/Tags/hot.
  byOutcome: {
    blindflug: {
      diagnose:
        "Die vier Rollout-Entscheidungen sind bei euch schon gefallen, nur nicht von euch. " +
        "Microsoft setzt die Standard-Schalter, der Händler wählt die Lizenz, und was Copilot sehen " +
        "darf, ergibt sich aus gewachsenen Berechtigungen. Das ist kein Vorwurf, sondern der " +
        "Normalzustand, wenn niemand die vier Fragen gestellt hat. Ab heute stellst Du sie.",
      schritte: [
        "Nimm Deinen ersten Auftrag aus dem Report und schick ihn heute an Deine IT. Nicht als Frage, als Auftrag mit Termin.",
        "Prüft als Erstes die Anbieter-Schalter im M365 Admin Center. " + AUTO_ENABLE_SATZ,
        "Verteil keine weiteren Lizenzen, bevor die vier Aufträge beantwortet sind.",
      ],
      antiPattern:
        "Vermeide den Reflex, erst Lizenzen zu bestellen und die Fragen später zu klären. " +
        "Aktivieren gilt als Zustimmung zu den jeweiligen Bedingungen, und rückwärts aufräumen ist " +
        "teurer als vorher entscheiden.",
    },
    bauchgefuehl: {
      diagnose:
        "Ihr ahnt die Themen, aber dokumentiert ist nichts. Wenn morgen jemand fragt, wer welchen " +
        "Anbieter-Schalter mit welcher Begründung aktiviert hat, steht ihr mit leeren Händen da. Die " +
        "gute Nachricht: Der Weg zum sauberen Rollout besteht aus vier klaren Aufträgen an die IT, " +
        "und die bekommst Du hier fertig formuliert.",
      schritte: [
        "Mach aus dem Bauchgefühl Dokumente: Schick die offenen Aufträge an Deine IT und lass Dir die erledigten schriftlich bestätigen.",
        "Setz einen Termin, an dem die vier Antworten vorliegen. Eine Woche reicht für den Anfang.",
        "Prüft den Stand der Anbieter-Schalter zuerst. " + AUTO_ENABLE_SATZ,
      ],
      antiPattern:
        "Vermeide, Dich auf mündliche Zusagen zu verlassen. Was nicht festgehalten ist, existiert " +
        "bei der nächsten Nachfrage nicht, egal wie sicher sich heute jemand ist.",
    },
    "fast-startklar": {
      diagnose:
        "Ihr habt die meisten Entscheidungen getroffen, ein bis zwei Aufträge sind noch offen. " +
        "Genau die holst Du Dir jetzt: Unten steht Dein erster Auftrag, fertig formuliert für Deine " +
        "IT. Damit wird aus fast startklar wirklich startklar.",
      schritte: [
        "Schick die offenen Aufträge an Deine IT. Fertig formuliert findest Du sie im Auftrags-Paket.",
        "Lass Dir die erledigten Entscheidungen schriftlich bestätigen, ein Absatz pro Entscheidung reicht.",
        "Leg fest, wer künftig neue KI-Schalter im Admin Center prüft, bevor sie aktiv werden.",
      ],
      antiPattern:
        "Vermeide, die letzten offenen Punkte auf die Zeit nach dem Rollout zu verschieben. Ein " +
        "Berechtigungs-Review nach der Lizenz-Verteilung kommt zu spät, dann hat Copilot die Lücken " +
        "schon gesehen.",
    },
    "rollout-ready": {
      diagnose:
        "Sauber: Die vier Rollout-Entscheidungen sind bei euch getroffen und dokumentiert, der " +
        "Check bestätigt es. Was jetzt noch fehlt, ist wenig, aber wichtig: Lass Dir den Stand von " +
        "der IT schriftlich bestätigen, damit er auch in sechs Monaten noch belastbar ist.",
      schritte: [
        "Lass Dir die vier Entscheidungen von der IT schriftlich bestätigen, mit Datum und Namen.",
        "Legt einen festen Rhythmus fest, in dem ihr neue Anbieter-Schalter und Vorschau-Modelle prüft. Microsoft ändert die Standards, zuletzt zum 24. Juli 2026.",
        "Nutzt den sauberen Unterbau: Startet mit einem kleinen Pilot-Team und messt, was Copilot konkret bringt.",
      ],
      antiPattern:
        "Vermeide, den Stand als dauerhaft erledigt abzuhaken. Die Schalter-Landschaft ändert sich, " +
        "und eine Entscheidung von heute ist ohne Review-Rhythmus in einem halben Jahr wieder offen.",
    },
  },
  // Spec-Edge: S1 = 0 → Auto-Enable-Fakt betonen, unabhängig vom Gesamtscore.
  personalisierung: {
    questionId: "S1",
    byAnswer: {
      "weiss-nicht": "Ein Punkt vorab, unabhängig von Deinem Ergebnis: " + AUTO_ENABLE_SATZ,
    },
  },
  tipps,
  sources: [
    {
      id: "ms-anthropic-subprozessor",
      text:
        "Microsoft Learn: Anthropic als KI-Subprozessor, Verarbeitung außerhalb der EU Data " +
        "Boundary (Doc-Stand 01.07.2026)",
      url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor",
    },
    {
      id: "ms-openai-subprozessor",
      text:
        "Microsoft Learn: OpenAI als KI-Subprozessor, Auto-Enable zum 24.07.2026 (Doc-Stand " +
        "10.07.2026)",
      url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/openai-subprocessor",
    },
    {
      id: "ms-copilot-licensing",
      text: "Microsoft Learn: M365-Copilot-Lizenzierung, Business vs. Enterprise (Abruf 12.07.2026)",
      url: "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-licensing",
    },
    {
      id: "ms-preise-de",
      text:
        "Microsoft: deutsche Preisseite M365 Copilot, jährliche vs. monatliche Zahlweise (Abruf " +
        "12.07.2026)",
      url: "https://www.microsoft.com/de-de/microsoft-365-copilot/pricing",
    },
  ],
  optin: {
    heading: "Hol Dir das Auftrags-Paket",
    body:
      "Alle vier Aufträge fertig formuliert, dazu die Anbieter-Tabelle fürs IT-Gespräch und die " +
      "Quellen mit Doc-Stand, als dauerhaft abrufbaren Report. Trag einfach Deine E-Mail ein.",
    button: "Auftrags-Paket anfordern",
    consent:
      "Mit „Auftrags-Paket anfordern“ willige ich ein, dass meine E-Mail-Adresse und meine " +
      "Check-Antworten gespeichert und verarbeitet werden, damit ich mein Auftrags-Paket erhalte, " +
      "und dass mir Daniel Kreuzhofer regelmäßig Tipps und Angebote rund um KI per E-Mail schickt. " +
      "Die Verarbeitung läuft über Dienstleister in der EU (Hosting, E-Mail-Versand, Newsletter) " +
      "mit Auftragsverarbeitungsvertrag; meine Daten werden nicht verkauft. Ich bestätige per " +
      "Double-Opt-in und kann mich jederzeit abmelden.",
    datenschutzHref: "/datenschutz",
    datenschutzHinweis:
      "Deine Antworten bleiben bis zum Klick auf „Auftrags-Paket anfordern“ nur in Deinem Browser. " +
      "Erst dann werden E-Mail und Antworten gespeichert (Hosting: Hostinger, Frankfurt) und der " +
      "Bestätigungs-Link per E-Mail verschickt (IONOS); nach Bestätigung läuft der Newsletter über " +
      "CleverReach. Alle Verarbeiter in der EU, AVV vorhanden. Kein Tracking, keine Cookies außer " +
      "technisch notwendig.",
    successHeading: "Fast geschafft, schau in Dein Postfach",
    successBody:
      "Ich habe Dir gerade eine E-Mail geschickt. Ein Klick auf den Bestätigungs-Link, dann kommt " +
      "Dein Auftrags-Paket. (Falls nichts ankommt: kurz im Spam-Ordner schauen.)",
    errorBody:
      "Da ist gerade etwas schiefgelaufen. Dein Ergebnis siehst Du oben weiterhin, bitte versuch " +
      "es in einem Moment noch einmal.",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "dein.name@firma.de",
  },
  // Video #09 launcht am 19.07.2026 — URL nach Launch auf das Video umstellen.
  video: {
    intro:
      "Die vier Entscheidungen im Detail, mit Blick ins Admin Center, zeige ich Dir im Video:",
    title: "Copilot DSGVO-konform und günstig einführen",
    label: "Video #09",
    url: "https://www.youtube.com/@DanielKreuzhofer",
  },
};
