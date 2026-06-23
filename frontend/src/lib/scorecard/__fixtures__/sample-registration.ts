import type { ScorecardRegistration } from "../registry";
import { SAMPLE_DEFINITION } from "./sample-definition";

/** A complete registration for the SAMPLE_DEFINITION — used to test the renderer. */
export const SAMPLE_REGISTRATION: ScorecardRegistration = {
  definition: SAMPLE_DEFINITION,
  doiSubject: "Bestätige Deine Anmeldung",
  deliverySubject: "Dein Ergebnis ist da",
  meta: { title: "Sample-Check", description: "Ein Beispiel-Scorecard." },
  branding: {
    bg: "#0e0e10",
    surface: "#17171b",
    ink: "#f5f5f5",
    inkMuted: "#a0a0a8",
    accent: "#ff6a3d",
    accentInk: "#0e0e10",
    brandName: "Sample",
    brandAuthor: "Daniel Kreuzhofer",
  },
  content: {
    intro: {
      heading: "Der Sample-Check",
      lead: "2 Fragen, sofort ein Ergebnis.",
      startLabel: "Check starten",
      meta: "2 Fragen · sofort · ohne Anmeldung",
    },
    resultHeading: "Dein Ergebnis",
    outcomeLabel: {
      einkaeufer: "Einkäufer",
      verwalter: "Verwalter",
      mitmacher: "Mitmacher",
      vorbild: "Vorbild",
    },
    byOutcome: {
      einkaeufer: {
        diagnose: "{score}/100 — Einkäufer. Beispiel-Diagnose.",
        schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."],
        antiPattern: "Vermeide X.",
      },
      verwalter: {
        diagnose: "{score}/100 — Verwalter. Beispiel-Diagnose.",
        schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."],
        antiPattern: "Vermeide X.",
      },
      mitmacher: {
        diagnose: "{score}/100 — Mitmacher. Beispiel-Diagnose.",
        schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."],
        antiPattern: "Vermeide X.",
      },
      vorbild: {
        diagnose: "{score}/100 — Vorbild. Beispiel-Diagnose.",
        schritte: ["Schritt eins.", "Schritt zwei.", "Schritt drei."],
        antiPattern: "Vermeide X.",
      },
    },
    personalisierung: { questionId: "K1", byAnswer: { gf: "Als GF gilt für Dich besonders …" } },
    freeTool: { label: "Dein Werkzeug", body: "Die eine Frage: Beispiel." },
    sources: [{ id: "s1", text: "Beispiel-Quelle (2025)", url: "https://example.com" }],
    optin: {
      heading: "Dein Ergebnis steht. Jetzt das Werkzeug.",
      body: "Trag Deine E-Mail ein, ich schick Dir das Toolkit.",
      button: "Toolkit anfordern",
      consent: "Mit Klick willige ich ein … (Beispiel-Consent).",
      datenschutzHref: "/datenschutz",
      successHeading: "Fast geschafft — schau in Dein Postfach",
      successBody: "Ein Klick auf den Link, dann hast Du Dein Toolkit.",
      errorBody: "Da ist etwas schiefgelaufen — bitte gleich nochmal.",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "dein.name@firma.de",
    },
    video: { intro: "Das ganze Denkmodell steckt im Video:", title: "Beispiel-Video", label: "Video", url: "" },
  },
};
