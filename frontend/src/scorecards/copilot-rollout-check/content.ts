/**
 * Copilot-Rollout-Check — renderer content. Auftrags-Texte, Bänder, Gate-Angebot
 * und der Auto-Enable-Satz sind VERBATIM aus der Quiz-Spec (v1) bzw. den
 * Bau-Anweisungen. Per-Band schritte/antiPattern sind neu formuliert (die Spec
 * definiert dort nur die Ein-Satz-Diagnosen) — für Daniels Kalibrierung markiert.
 * Anbieter-Tabelle + Quellen aus research-2026-07-12 (verifiziert, mit Doc-Stand).
 */

import type { ScorecardContent, Tipp, TippHebel } from "@/lib/scorecard/content";

/** One of the acht Dimensionen: vier Rollout-Entscheidungen (Video #09) plus
 *  vier Nutzungs-Schritte (Video #10). */
export interface RolloutDimension {
  /** Scoring category on the definition (S1–S4, N1–N4). */
  category: string;
  /** Report grouping: Einführung (IT-Aufträge) vs. Nutzung (Entscheider-Aufträge). */
  block: "einfuehrung" | "nutzung";
  /** Short display label for the status rows. */
  label: string;
  /** Gated-report heading for this Auftrag. */
  auftragTitle: string;
  /** The fully formulated Auftrag an die IT (kopierbar). */
  auftrag: string;
  /** Fundorte/Prüfpunkte below the Auftrag (gated report only). Click paths are
   *  tenant-verified (research-2026-07-12) or Learn-doc-sourced (see sources). */
  checkliste: Tipp[];
}

/** Date-robust Auto-Enable wording (Bau-Anweisung 5 — no date logic in code). */
export const AUTO_ENABLE_SATZ =
  "Den OpenAI-Anbieter schaltet Microsoft zum 24. Juli 2026 automatisch für alle frei, sofern " +
  "niemand aktiv widerspricht. Prüft, was bei euch an ist.";

export const DIMENSIONEN: RolloutDimension[] = [
  {
    category: "anbieter",
    block: "einfuehrung",
    label: "Anbieter-Schalter",
    auftragTitle: "Auftrag 1: Anbieter-Schalter dokumentieren",
    auftrag:
      "Dokumentiert pro KI-Anbieter-Schalter im M365 Admin Center (Anthropic, OpenAI, Mistral, " +
      "Vorschau-Modelle): Ist er aktiv, wer hat es entschieden, mit welcher Begründung? Achtung: " +
      "Aktivieren gilt als Zustimmung zu den jeweiligen Bedingungen, und die Anbieter unterscheiden " +
      "sich bei der EU-Datengrenze grundlegend.",
    checkliste: [
      {
        lead: "Das Haupt-Panel:",
        body:
          "admin.microsoft.com → Copilot → Einstellungen → „KI-Anbieter, die als " +
          "Microsoft-Unterauftragsverarbeiter tätig sind“. Dort stehen Anthropic und OpenAI, je " +
          "mit eigener Benutzer-Zuweisung. Nötige Rolle: AI Administrator oder Global Administrator.",
        evidence: "practice",
      },
      {
        lead: "Die versteckte Checkbox:",
        body:
          "Im Anthropic-Eintrag sitzt unterhalb der Benutzer-Auswahl die Checkbox " +
          "„Anthropic-Modelle in Copilot-Erfahrungen in Microsoft 365-Apps zulassen“. Achtung: Bei " +
          "EU-Tenants, die nach dem 25. März 2026 erstellt wurden, ist sie ab Werk an.",
        evidence: "data",
      },
      {
        lead: "Zwei weitere Panels daneben:",
        body:
          "„KI-Anbieter für andere große Sprachmodelle“ (Mistral, mit separater " +
          "Zustimmungs-Checkbox und eigenem Vertrag statt Microsoft-Wrap) und „KI-Modelle in der " +
          "Vorschau“ (Anthropic Preview mit 30 Tagen Datenaufbewahrung).",
        evidence: "data",
      },
      {
        lead: "Der zweite Ort:",
        body:
          "Power Platform Admin Center (admin.powerplatform.microsoft.com) → Environments → " +
          "Settings → Product → Features → „Enable External models“, pro Environment. Bleibt " +
          "ausgegraut, solange das Haupt-Panel aus ist.",
        evidence: "practice",
      },
      {
        lead: "Laufend im Blick:",
        body:
          "Message Center im Admin Center nach „Anthropic“ und „OpenAI“ filtern. So seht ihr " +
          "Änderungen wie den OpenAI-Auto-Enable zum 24. Juli 2026, bevor sie passieren.",
        evidence: "practice",
      },
    ],
  },
  {
    category: "training",
    block: "einfuehrung",
    label: "Training und Datennutzung",
    auftragTitle: "Auftrag 2: Modell-Training schriftlich ausschließen",
    auftrag:
      "Legt ein Beleg-Dokument an, das für jede aktivierte Modell-Stufe festhält, dass Firmendaten " +
      "nicht ins Modell-Training fließen: ein Absatz pro Stufe, mit wörtlichem Zitat aus der " +
      "jeweiligen Quelle, Link, Doc-Stand und Prüfdatum. Die vier Stufen: Microsoft-gehostete " +
      "Modelle, Subprozessoren (Anthropic, OpenAI), Fremd-Anbieter (Mistral), Vorschau-Modelle mit " +
      "Data Retention.",
    checkliste: [
      {
        lead: "Stufe 1, Microsoft-gehostete Modelle (der Standard):",
        body:
          "Der Beleg steht wörtlich im Copilot-Privacy-Doc auf Microsoft Learn: „Prompts, " +
          "responses, and data accessed through Microsoft Graph aren't used to train foundation " +
          "LLMs.“ Zitat, Link und Doc-Stand ins Beleg-Dokument (Quelle unten).",
        evidence: "data",
      },
      {
        lead: "Stufe 2, Subprozessoren (Anthropic, OpenAI):",
        body:
          "Laut den Subprozessor-Docs gelten Microsofts Product Terms und der " +
          "Datenschutznachtrag (DPA). Der Klick auf Aktivieren gilt als Zustimmung zu den " +
          "Bedingungen: Macht beim Aktivieren einen Screenshot des Dialogs, er ist Teil des Belegs.",
        evidence: "data",
      },
      {
        lead: "Stufe 3, Fremd-Anbieter (Mistral):",
        body:
          "Microsofts Zusagen gelten hier nicht. Der Beleg kommt nur aus den " +
          "Mistral-Vertragsbedingungen und dem Mistral-DPA, beide sind im Zustimmungs-Dialog " +
          "verlinkt. Ohne diesen Absatz keine Aktivierung.",
        evidence: "data",
      },
      {
        lead: "Stufe 4, Vorschau-Modelle mit Data Retention:",
        body:
          "Anthropic speichert hier Ein- und Ausgaben bis zu 30 Tage und dokumentiert: „Anthropic " +
          "doesn't use retained data for model training without your express permission.“ " +
          "Anthropic-Terms und Retention-Policy ins Beleg-Dokument verlinken.",
        evidence: "data",
      },
      {
        lead: "Termin-Warnung:",
        body:
          AUTO_ENABLE_SATZ +
          " Ab dann zählt OpenAI als aktivierte Stufe und gehört ins Beleg-Dokument.",
        evidence: "data",
      },
    ],
  },
  {
    category: "berechtigungen",
    block: "einfuehrung",
    label: "Berechtigungen",
    auftragTitle: "Auftrag 3: Berechtigungs-Review vor der ersten Lizenz",
    auftrag:
      "Führt ein Berechtigungs-Review für die Datenquellen durch, die Copilot sehen wird, bevor " +
      "die erste Lizenz verteilt wird: Zieht die Oversharing-Reports, lasst die Site-Owner den " +
      "Zugriff bestätigen und prüft für ein kleines, benanntes Pilot-Team per Stichprobe, worauf " +
      "jede Person effektiv Zugriff hat.",
    checkliste: [
      {
        lead: "Ehrlich vorab:",
        body:
          "Einen Report „was kann Copilot pro Nutzer sehen“ gibt es tenant-weit nicht. Copilot " +
          "sieht, was der jeweilige Nutzer sieht. Der Weg ist deshalb umgekehrt: Findet die " +
          "Inhalte, die zu breit geteilt sind.",
        evidence: "data",
      },
      {
        lead: "Oversharing-Reports ziehen:",
        body:
          "SharePoint Advanced Management ist in eurer Copilot-Lizenz enthalten. Die " +
          "Data-Access-Governance-Reports im SharePoint Admin Center zeigen Sites mit " +
          "„Jeder“-Freigaben, organisationsweiten Links und breitem Zugriff.",
        evidence: "practice",
      },
      {
        lead: "Purview dazunehmen:",
        body:
          "Microsoft Purview → „DSPM für KI“ (Data Security Posture Management) bringt ein " +
          "Oversharing-Assessment speziell für den Copilot-Rollout mit.",
        evidence: "practice",
      },
      {
        lead: "Site-Owner bestätigen lassen:",
        body:
          "Mit Site Access Reviews (Teil von SharePoint Advanced Management) bestätigen die " +
          "Site-Owner der auffälligen Sites, wer den Zugriff wirklich braucht.",
        evidence: "practice",
      },
      {
        lead: "Pro-Nutzer-Stichprobe fürs Pilot-Team:",
        body:
          "Pro wichtiger Site: Site-Einstellungen → Websiteberechtigungen → „Berechtigungen " +
          "überprüfen“, Person eingeben. Zeigt den effektiven Zugriff dieser Person auf die Site. " +
          "Für ein benanntes Pilot-Team ist das überschaubar.",
        evidence: "practice",
      },
      {
        lead: "Übergangsschutz:",
        body:
          "Bis das Review durch ist: Restricted Content Discovery auf sensible Sites legen, dann " +
          "tauchen deren Inhalte nicht in Copilot-Antworten auf.",
        evidence: "practice",
      },
    ],
  },
  {
    category: "lizenz",
    block: "einfuehrung",
    label: "Lizenz und Zahlweise",
    auftragTitle: "Auftrag 4: Lizenz-Schiene und Zahlweise prüfen",
    auftrag:
      "Prüft vor der Bestellung Schiene (Copilot Business ab M365 Business Basic, max. 300 Nutzer, " +
      "vs. Enterprise-Add-on) und Zahlweise (jährlich vs. monatlich). Beides steht auf derselben " +
      "Bestellseite, der Unterschied sind bis zu 40 Prozent.",
    checkliste: [
      {
        lead: "Wo ihr vergleicht:",
        body:
          "Die deutschen Preisseiten zu Microsoft 365 Copilot (Business und Enterprise) und das " +
          "Lizenzierungs-Doc auf Microsoft Learn, beide unten in den Quellen verlinkt. Bestellt " +
          "wird im Admin Center unter Abrechnung → Dienste kaufen: Dort stehen Schiene und " +
          "Zahlweise auf derselben Seite.",
        evidence: "practice",
      },
    ],
  },

  // ── Nutzungs-Block (Video #10): Entscheider-Aufträge, nicht delegierbar ────
  {
    category: "use-case",
    block: "nutzung",
    label: "Use-Case",
    auftragTitle: "Auftrag 5: Einen Prozess wählen",
    auftrag:
      "Wähl einen einzigen Prozess, in dem messbar Zeit oder Geld steckt (Angebote, Reklamationen, " +
      "Besprechungs-Nachbereitung), und benenn einen Verantwortlichen. Ein Use-Case, nicht zwanzig " +
      "Lizenzen.",
    checkliste: [
      {
        lead: "Woran Du einen guten ersten Prozess erkennst:",
        body:
          "Er tut weh, er läuft oft (mehrmals pro Woche), sein Aufwand ist messbar, und es gibt " +
          "eine Person, deren Alltag er ist. Fehlt eines davon, nimm den nächsten Kandidaten.",
        evidence: "practice",
      },
    ],
  },
  {
    category: "basislinie",
    block: "nutzung",
    label: "Basislinie und Wert-Hypothese",
    auftragTitle: "Auftrag 6: Basislinie messen, Wert-Hypothese aufschreiben",
    auftrag:
      "Miss den Ist-Zustand, bevor jemand einen Prompt schreibt: Wie lange dauert der Prozess " +
      "heute, wie oft läuft er pro Woche, was kostet er. Dann schreib die Wert-Hypothese in einem " +
      "Satz auf: Was genau soll sich um wie viel verbessern, bis wann.",
    checkliste: [
      {
        lead: "Die Ein-Satz-Vorlage:",
        body:
          "„Wir senken [Messgröße, z. B. die Bearbeitungszeit pro Angebot] von [heute] auf [Ziel] " +
          "bis [Datum].“ Ohne Basislinie kannst Du hinterher nicht wissen, ob KI etwas gebracht " +
          "hat, Du kannst es nur glauben.",
        evidence: "practice",
      },
    ],
  },
  {
    category: "befaehigung",
    block: "nutzung",
    label: "Befähigung",
    auftragTitle: "Auftrag 7: Die Nutzer befähigen, nicht die Firma schulen",
    auftrag:
      "Befähige die drei, vier Menschen, deren Alltag dieser Prozess ist, statt die ganze Firma zu " +
      "schulen. Ein System ist erst fertig, wenn diese Leute damit arbeiten.",
    checkliste: [
      {
        lead: "Woran Du Befähigung von Bereitstellung unterscheidest:",
        body:
          "Die Nutzer haben am eigenen Prozess geübt, nicht an Beispiel-Prompts. Die ersten echten " +
          "Ergebnisse sind gemeinsam entstanden, und es gibt einen kurzen Draht für Rückfragen. " +
          "Bereitstellen ohne Einführung produziert genau die ungenutzten Lizenzen, die Du gerade " +
          "hast.",
        evidence: "practice",
      },
    ],
  },
  {
    category: "entscheid",
    block: "nutzung",
    label: "Daten-Entscheid",
    auftragTitle: "Auftrag 8: Den Termin setzen, an dem die Daten entscheiden",
    auftrag:
      "Setz heute den Termin sechs bis acht Wochen nach Start, an dem Basislinie gegen Ergebnis " +
      "gehalten wird. Ist der Wert da, skalierst Du auf den nächsten Prozess. Ist er nicht da, " +
      "schaltest Du ab und nimmst die nächste Hypothese. Beides ist ein Ergebnis.",
    checkliste: [
      {
        lead: "Damit der Termin hält:",
        body:
          "Leg vorab fest, wer am Tisch sitzt und ab welchem Wert skaliert wird. Zufriedene Nutzer " +
          "sind nicht dasselbe wie belegter Wert: Im Copilot-Pilot der britischen Regierung (DBT, " +
          "1.000 Lizenzen) waren 72 Prozent zufrieden, einen belastbaren Produktivitätsnachweis " +
          "fand die Auswertung trotzdem nicht (Quelle unten).",
        evidence: "data",
      },
    ],
  },
];

/** Status word per S-question points (spec: ✅ erledigt / 🟡 halb / 🔴 offen / ⚫ unbekannt). */
export const STATUS_BY_POINTS: Record<number, { icon: string; word: string }> = {
  3: { icon: "✅", word: "erledigt" },
  2: { icon: "🟡", word: "halb" },
  1: { icon: "🔴", word: "offen" },
  0: { icon: "⚫", word: "unbekannt" },
};

/** Gated report: die acht Aufträge mit Checkliste (weakest first) + Anbieter-Tabelle. */
const tipps: TippHebel[] = [
  ...DIMENSIONEN.map((d) => ({
    category: d.category,
    title: d.auftragTitle,
    subtitle:
      d.block === "einfuehrung"
        ? "Den Auftrag kopieren und an die IT schicken. Die Checkliste darunter beantwortet die Rückfragen gleich mit."
        : "Diesen Auftrag kannst Du nicht delegieren. Die Checkliste darunter macht ihn konkret.",
    tipps: [
      { lead: "Dein Auftrag:", body: d.auftrag, evidence: "practice" as const },
      ...d.checkliste,
    ],
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
    // v2-Versprechen (Video #09 + #10): Einführung UND Nutzung.
    lead:
      "12 Fragen, 3 Minuten. Danach weißt Du, welche der acht Entscheidungen bei euch offen sind, " +
      "von der Einführung bis zur Nutzung, und Du bekommst die offenen als fertig formulierte " +
      "Aufträge: vier für Deine IT, vier für Dich.",
    startLabel: "Check starten",
    meta: "Kostenlos · Stand der Recherche Juli 2026 · keine Rechtsberatung",
  },
  resultHeading: "Dein Ergebnis",
  // Keys eingefroren (gespeicherte v1-Ergebnisse); obere zwei Labels umbenannt
  // (Daniel 27.07.), weil ab v2 auch die Nutzung in den Score einfließt.
  outcomeLabel: {
    blindflug: "Blindflug",
    bauchgefuehl: "Bauchgefühl",
    "fast-startklar": "Auf halber Strecke",
    "rollout-ready": "Läuft und liefert",
  },
  // KEIN scoreParagraph: numerischer Score bleibt unsichtbar (Daniel 15.07.,
  // wie bei den anderen Checks) — er existiert nur intern für Bänder/Tags/hot.
  byOutcome: {
    blindflug: {
      diagnose:
        "Bei euch sind beide Hälften offen: die Entscheidungen der Einführung und die Führung der " +
        "Nutzung. Copilot ist entweder noch nicht da, oder er liegt da, ohne dass jemand gesagt " +
        "hat, welcher Prozess damit besser werden soll. Das ist kein Vorwurf, sondern der " +
        "Normalzustand, wenn niemand die acht Fragen gestellt hat: Microsoft setzt die " +
        "Standard-Schalter, der Händler wählt die Lizenz, und die Nutzung bleibt dem Zufall " +
        "überlassen. Ab heute drehst Du das um.",
      schritte: [
        "Nimm Deinen ersten Auftrag aus dem Report und stoß ihn heute an: IT-Aufträge schickst Du weiter, Entscheider-Aufträge gehören Dir.",
        "Prüft als Erstes die Anbieter-Schalter im M365 Admin Center. " + AUTO_ENABLE_SATZ,
        "Verteil keine weiteren Lizenzen und wähl stattdessen den einen Prozess, an dem Copilot sich beweisen muss.",
      ],
      antiPattern:
        "Vermeide den Reflex, erst Lizenzen zu bestellen und die Fragen später zu klären. " +
        "Aktivieren gilt als Zustimmung zu den jeweiligen Bedingungen, und rückwärts aufräumen ist " +
        "teurer als vorher entscheiden.",
    },
    bauchgefuehl: {
      diagnose:
        "Ihr ahnt die Themen, aber belegt ist nichts: Die Einführung ist nicht dokumentiert, und " +
        "für die Nutzung gibt es weder Basislinie noch Wert-Hypothese. Wenn morgen jemand fragt, " +
        "wer welchen Anbieter-Schalter aktiviert hat oder was Copilot konkret bringt, steht ihr " +
        "mit leeren Händen da. Die gute Nachricht: Beides sind klare Aufträge, und die bekommst Du " +
        "hier fertig formuliert.",
      schritte: [
        "Mach aus dem Bauchgefühl Belege: Schick die offenen IT-Aufträge raus und lass Dir die erledigten schriftlich bestätigen.",
        "Wähl den einen Prozess und schreib die Wert-Hypothese auf, bevor weitere Lizenzen verteilt werden.",
        "Prüft den Stand der Anbieter-Schalter zuerst. " + AUTO_ENABLE_SATZ,
      ],
      antiPattern:
        "Vermeide, Dich auf mündliche Zusagen und gefühlte Erfolge zu verlassen. Was nicht " +
        "festgehalten ist, existiert bei der nächsten Nachfrage nicht, und ein Nutzen ohne " +
        "Basislinie ist ein Glaube, kein Beleg.",
    },
    "fast-startklar": {
      diagnose:
        "Ein Teil steht, ein Teil fehlt: Entweder ist Copilot sauber eingeführt, aber niemand " +
        "führt die Nutzung, oder die Nutzung läuft, während Einführungs-Entscheidungen offen sind. " +
        "Die acht Zeilen unten zeigen Dir, welche Hälfte bei euch dran ist, und Dein erster " +
        "Auftrag schließt genau diese Lücke.",
      schritte: [
        "Stoß die offenen Aufträge an: IT-Aufträge weiterleiten, Entscheider-Aufträge selbst anpacken.",
        "Lass Dir die erledigten Entscheidungen schriftlich bestätigen, ein Absatz pro Entscheidung reicht.",
        "Setz den Termin, an dem Basislinie gegen Ergebnis gehalten wird. Ohne Termin bleibt der Nutzen ein Gefühl.",
      ],
      antiPattern:
        "Vermeide, die offene Hälfte auf später zu verschieben. Ein Berechtigungs-Review nach der " +
        "Lizenz-Verteilung kommt zu spät, und eine Nutzung ohne Messplan bleibt unbelegbar, egal " +
        "wie gut sie sich anfühlt.",
    },
    "rollout-ready": {
      diagnose:
        "Sauber: Die Einführung ist entschieden und dokumentiert, die Nutzung wird geführt, der " +
        "Check bestätigt es. Was jetzt zählt: den Stand halten und den belegten Wert nutzen, um " +
        "den nächsten Prozess anzugehen.",
      schritte: [
        "Lass Dir die Entscheidungen von der IT schriftlich bestätigen, mit Datum und Namen.",
        "Legt einen festen Rhythmus fest, in dem ihr neue Anbieter-Schalter und Vorschau-Modelle prüft. Microsoft ändert die Standards, zuletzt zum 24. Juli 2026.",
        "Skaliert mit System: Nimm den belegten Wert aus dem ersten Prozess und wiederhol das Muster am nächsten. Basislinie zuerst, dann bauen.",
      ],
      antiPattern:
        "Vermeide, den Stand als dauerhaft erledigt abzuhaken. Die Schalter-Landschaft ändert " +
        "sich, und ein Prozess mit belegtem Wert ist der Anfang, nicht das Ziel.",
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
    {
      id: "ms-copilot-privacy",
      text:
        "Microsoft Learn: Copilot-Privacy-Doc mit der Training-Zusage („aren't used to train " +
        "foundation LLMs“) (Doc-Stand 09.07.2026)",
      url: "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy",
    },
    {
      id: "ms-secure-govern-blueprint",
      text:
        "Microsoft Learn: Deployment-Blueprint „Secure and Governed Data Foundation for Copilot“, " +
        "Oversharing-Reports mit SharePoint Advanced Management + Purview (Doc-Stand 06.05.2026)",
      url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/secure-govern-copilot-foundational-deployment-guidance",
    },
    {
      id: "uk-dbt-trial",
      text:
        "GOV.UK: M365-Copilot-Pilot des Department for Business and Trade (1.000 Lizenzen, 3 " +
        "Monate): 72 Prozent zufrieden, aber „no robust evidence that time savings lead to " +
        "improved productivity“ (veröffentlicht 2025)",
      url: "https://www.gov.uk/government/publications/microsoft-365-copilot-pilot-dbt-evaluation-report",
    },
  ],
  optin: {
    heading: "Hol Dir das Auftrags-Paket für Deine IT und für Dich",
    body:
      "Damit schickst Du Deiner IT heute vier Aufträge, die sie ohne Rückfragen abarbeiten kann, " +
      "und bekommst vier dazu, die nur Du anstoßen kannst: Use-Case, Basislinie, Befähigung, " +
      "Daten-Entscheid. Zu jedem Auftrag: die Checkliste mit den exakten Klickpfaden im Admin " +
      "Center oder der passenden Vorlage, die Namen der Reports, die eure IT ziehen kann, und " +
      "jede Aussage mit Quelle und Doc-Stand. Dazu die Anbieter-Tabelle fürs IT-Gespräch: vier " +
      "Schalter, vier Rechtslagen, auf einen Blick. Dauerhaft abrufbar über Deinen persönlichen " +
      "Link. Trag einfach Deine E-Mail ein.",
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
  // Kanal-Link als Platzhalter — nach den Launches auf die Video-URLs umstellen.
  video: {
    intro:
      "Die vier Einführungs-Entscheidungen zeige ich Dir in Video #09, die vier " +
      "Nutzungs-Schritte in Video #10. Beide findest Du auf dem Kanal:",
    title: "Copilot sicher einführen und wirklich nutzen",
    label: "Video #09 + #10",
    url: "https://www.youtube.com/@DanielKreuzhofer",
  },
};
