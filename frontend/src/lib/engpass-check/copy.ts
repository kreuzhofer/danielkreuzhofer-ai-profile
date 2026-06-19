/**
 * Engpass-Check — all user-facing copy.
 *
 * Verbatim from `06-quiz-spec.md` and `01-signup-page.md`. Kept in one place so
 * the wording can be reviewed (Daniels Review-Punkte) without touching logic.
 */

import type { Band, Dimension } from "./types";

export const INTRO = {
  heading: "Der Engpass-Check",
  lead:
    "11 Fragen, 3 Minuten. Danach weißt Du, wo Dein Vertriebsprozess wirklich hängt, " +
    "welcher Engpass-Typ bei euch dominiert — und welcher der drei Lösungswege zu eurer " +
    "Situation passt. Dein Ergebnis siehst Du sofort, ohne Anmeldung.",
  startLabel: "Check starten",
  meta: "11 Fragen · 3 Minuten · Ergebnis sofort, ohne Anmeldung",
} as const;

export const BAND_COPY: Record<Band, { name: string; range: string; description: string }> = {
  feintuning: {
    name: "Feintuning",
    range: "0–30",
    description: "Prozess läuft, Optimierung an Einzelstellen.",
  },
  spuerbar: {
    name: "Spürbarer Engpass",
    range: "31–60",
    description: "Klarer Hebel vorhanden, Diagnose lohnt sofort.",
  },
  akut: {
    name: "Akuter Engpass",
    range: "61–100",
    description:
      "Hier liegt richtig Durchsatz brach — und jede KI-Investition am falschen Schritt verpufft.",
  },
};

export const TYP_COPY: Record<Dimension, { name: string; diagnose: string }> = {
  "mess-blindflug": {
    name: "Mess-Blindflug",
    diagnose:
      "Du kannst Deinen Engpass nicht sehen — euch fehlen die Zahlen. Bevor ihr irgendetwas " +
      "baut oder kauft: Baseline aufsetzen. Sonst könnt ihr Erfolg nie beweisen.",
  },
  "wissens-monopol": {
    name: "Wissens-Monopol",
    diagnose:
      "Dein Prozess hängt an Köpfen, nicht an Systemen. Was nur Herr Müller weiß, kann keine " +
      "Software übernehmen — erst beschreiben, dann automatisieren.",
  },
  "uebergabe-stau": {
    name: "Übergabe-Stau",
    diagnose:
      "Dein Engpass sitzt zwischen den Abteilungen. Jede Freigabe-Schleife kostet Tage — genau " +
      "hier haben Schulte (70% schneller) und RSP (2h → 10 Min) angesetzt.",
  },
  "schnittstellen-luecke": {
    name: "Schnittstellen-Lücke",
    diagnose:
      "Deine Systeme reden nicht miteinander — Menschen sind die Schnittstelle. Copy-Paste ist " +
      "der teuerste Prozessschritt, den niemand auf der Rechnung hat.",
  },
};

export const RESULT = {
  heading: "Dein Ergebnis",
  scoreLabel: "Engpass-Score",
  typLabel: "Dein Engpass-Typ",
} as const;

export const OPTIN = {
  // Opt-in sells the Toolkit, not a PDF copy of the (already free) report (Spec §F).
  heading: "Dein Ergebnis steht. Jetzt das Werkzeug für die Umsetzung.",
  emailLabel: "E-Mail-Adresse",
  emailPlaceholder: "dein.name@firma.de",
  submitLabel: "Toolkit anfordern",
  consent:
    "Mit „Toolkit anfordern“ willige ich ein, dass meine E-Mail-Adresse und meine Check-Antworten " +
    "gespeichert und verarbeitet werden, damit ich mein Umsetzungs-Toolkit erhalte, und dass mir " +
    "Daniel Kreuzhofer regelmäßig Tipps und Angebote rund um KI per E-Mail schickt. Die " +
    "Verarbeitung läuft über Dienstleister in der EU (Hosting, E-Mail-Versand, Newsletter) mit " +
    "Auftragsverarbeitungsvertrag; meine Daten werden nicht verkauft. Ich bestätige per " +
    "Double-Opt-in und kann mich jederzeit abmelden.",
  datenschutzLabel: "Mehr in der Datenschutzerklärung",
  datenschutzHref: "/datenschutz",
  // Confirmation-Hinweis nach Submit (02-confirmation-page.md)
  successHeading: "Fast geschafft — schau in Dein Postfach",
  successBody:
    "Ich habe Dir gerade eine E-Mail geschickt. Ein Klick auf den Bestätigungs-Link, dann hast " +
    "Du Dein Umsetzungs-Toolkit. (Falls nichts ankommt: kurz im Spam-Ordner schauen.)",
  errorBody:
    "Da ist gerade etwas schiefgelaufen. Dein Ergebnis siehst Du oben weiterhin — bitte versuch " +
    "es in einem Moment noch einmal.",
} as const;

export const DATENSCHUTZ_HINWEIS =
  "Deine Antworten bleiben bis zum Klick auf „Toolkit anfordern“ nur in Deinem Browser. Erst dann " +
  "werden E-Mail und Antworten gespeichert (Hosting: Hostinger, Frankfurt) und der Bestätigungs-Link " +
  "per E-Mail verschickt (IONOS); nach Bestätigung läuft der Newsletter über CleverReach. Alle " +
  "Verarbeiter in der EU, AVV vorhanden. Kein Tracking, keine Cookies außer technisch notwendig.";
