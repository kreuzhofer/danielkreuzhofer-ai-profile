/**
 * KI-Führungs-Check — renderer content. VERBATIM from the approved quiz-spec
 * (A–C). Daniel's voice; keine m-dashes, keine erfundenen Zahlen. The per-typ
 * "Dein Führungs-Score: {score} von 100, Typ X." headline from the spec is
 * omitted here — the score block + outcome heading already show score + typ.
 */

import type { ScorecardContent } from "@/lib/scorecard/content";

export const content: ScorecardContent = {
  intro: {
    heading: "Der KI-Führungs-Check",
    lead:
      "7 Fragen, 3 Minuten. Danach weißt Du, ob Du KI in Deinem Bereich wirklich führst oder bisher " +
      "nur eingekauft hast, welcher Führungs-Typ gerade auf Dich zutrifft, und was Dein nächster Schritt ist.",
    startLabel: "Check starten",
    meta: "7 Fragen · 3 Minuten · Ergebnis sofort, ohne Anmeldung",
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
      diagnose: `Du hast in KI investiert, Lizenzen, vielleicht eine Schulung, und dann läuft es ins Leere. Das ist kein Technik-Problem. Du behandelst KI wie einen neuen Drucker: angeschafft, dann soll das Team ihn benutzen. Aber KI verändert, wie Entscheidungen getroffen werden, und die triffst Du. Solange Du oben nicht sichtbar mitmachst, liest Dein Team genau eine Botschaft heraus: optional. Damit bleibt das Werkzeug liegen, egal wie gut es ist.`,
      schritte: [
        `Verbinde Dir morgen früh KI mit Deinem Postfach und stell ihr eine einzige Frage: "Geh meine Woche durch und gib mir eine Prioritätenliste." Zwei Minuten. Das ist Dein Einstieg, keine zweite Aufgabe.`,
        `Mach es einmal sichtbar: ein Satz im nächsten Team-Meeting, womit Du KI gerade selbst nutzt. Nicht als Ansage, als Beispiel.`,
        `Stell Dir den Reflex an: bei jeder neuen Aufgabe zuerst "geht das mit KI?".`,
      ],
      antiPattern: `Vermeide die nächste Runde Lizenzen oder die nächste Schulung „fürs Team", bevor Du es nicht selbst zwei Wochen benutzt hast. Mehr Einkauf löst das Vorbild-Problem nicht, es verschiebt es nur.`,
    },
    verwalter: {
      diagnose: `Bei euch ist KI ein Thema, aber es ist ein IT- und Tool-Thema. Es wird verwaltet, nicht geführt. Du hast vielleicht Richtlinien, einen Zuständigen, eine Tool-Auswahl, aber Du selbst stehst daneben. Das Problem: Wer KI nur verwaltet, kann nicht beurteilen, ob das Team sie gut nutzt oder nur so tut. Und die großen Hebel, wie ihr arbeitet, verkauft, entscheidet, denkt niemand neu, der das Ganze nicht selbst in der Hand hat.`,
      schritte: [
        `Hol Dir einen eigenen Use-Case aus Deinem Alltag, nicht aus der IT. Angebotsvorbereitung, Gesprächs-Prep, Wochen-Triage. Mach den zu Deinem.`,
        `Verschieb KI von der IT-Agenda auf Deine. Eine konkrete Frage pro Woche, die Du selbst mit KI durchgehst, statt sie zu delegieren.`,
        `Lern die Bounds: einmal bewusst ein KI-Ergebnis gegenprüfen, das gut aussah. Dann weißt Du, wo Du Deinem Team vertrauen kannst und wo nicht.`,
      ],
      antiPattern: `Vermeide, KI weiter als reine Governance-/Tool-Frage zu behandeln. Richtlinien ohne eigenes Vorbild erzeugen Vorsicht, keine Nutzung.`,
    },
    mitmacher: {
      diagnose: `Du nutzt KI selbst, das ist die halbe Miete und mehr als die meisten Chefs. Was fehlt, ist zweierlei: Sichtbarkeit und System. Dein Team weiß oft nicht genau, dass und wie Du es tust, also wirkt Dein Vorbild nur halb. Und Du nutzt es eher punktuell als als Hebel für die Art, wie ihr arbeitet. Aus „ich nutze KI" wird erst dann Führung, wenn Dein Team es sieht und Du es einforderst.`,
      schritte: [
        `Mach Deine Nutzung sichtbar: ein kurzes internes Mailing oder zwei Minuten im Town-Hall mit einem echten Beispiel von Dir. Erlaubt statt ertappt.`,
        `Führ die KI-Challenge-Frage als Auftrag ein: "Warum können wir das nicht mit KI machen?" Nicht als Vorwurf, als Prüf-Auftrag (OB / WIE / WARUM-NICHT).`,
        `Mach aus punktueller Nutzung Routine: ein fester Reflex, eine Stelle im Prozess, wo KI ab jetzt Standard ist.`,
      ],
      antiPattern: `Vermeide, es bei „ich nutze es ja selbst" zu belassen. Stille Nutzung an der Spitze ändert die Kultur nicht. Sichtbarkeit ist der Hebel.`,
    },
    vorbild: {
      diagnose: `Du führst KI, statt sie zu verwalten oder einzukaufen. Du nutzt selbst, machst es sichtbar, kennst die Bounds gut genug, um zu beurteilen, was Dein Team liefert, und Du stellst die richtige Frage. Das ist die Ausgangslage, aus der echte Hebel entstehen, weil nur jemand mit dem Blick aufs ganze System die großen Dinge neu denken kann. Deine Aufgabe verschiebt sich jetzt: von „selbst machen" zu „andere systematisch befähigen".`,
      schritte: [
        `Skaliere das Vorbild: aus Deinem Reflex wird ein wiederkehrender Slot, in dem Dein Team eigene KI-Wins zeigt. Du machst sichtbar, was andere bauen.`,
        `Stell die KI-Challenge-Frage strukturell, in jeder relevanten Entscheidung, und lass ein begründetes Nein gelten, aber kein reflexhaftes „geht nicht".`,
        `Such Dir den einen Prozess, der euer Wettbewerbsvorteil ist, und überleg, wie KI ihn nicht beschleunigt, sondern verändert.`,
      ],
      antiPattern: `Vermeide, dass es an Dir hängen bleibt. Vorbild ist der Anfang, nicht das Ziel. Wenn nur Du KI führst, hast Du einen Engpass geschaffen, Dich selbst.`,
    },
  },
  personalisierung: {
    questionId: "K3",
    byAnswer: {
      "keine-zeit": `Genau deshalb fängst Du klein an: der erste Schritt kostet zwei Minuten, nicht eine Stunde. Nicht noch eine Aufgabe, sondern die, die Dir Montag am meisten auf den Wecker geht.`,
      "wo-anfangen": `Der Einstieg ist nicht ein Tool-Vergleich, sondern ein Reflex: bei der nächsten Aufgabe zuerst fragen, ob KI sie löst. Im Video zeige ich den konkreten Montagmorgen-Move.`,
      datenschutz: `Berechtigt, und lösbar. Wie Du KI datenschutzkonform an Dein Postfach lässt, zeige ich in einem eigenen Video (Link im Toolkit).`,
      skeptisch: `Die Skepsis teilen viele Chefs. Genau deshalb fängst Du an einer Stelle an, wo Du das Ergebnis sofort selbst beurteilen kannst, statt es zu glauben.`,
    },
  },
  freeTool: {
    label: "Deine KI-Challenge-Frage",
    body: `Dein Werkzeug ab Montag, eine einzige Frage: „Warum können wir das nicht mit KI machen?" Nicht als Vorwurf, als Auftrag. Ausgeschrieben: Findet heraus, OB es mit KI geht. Wenn ja, zeigt mir WIE. Wenn nein, will ich WISSEN, WARUM NICHT, und WAS sich ändern müsste, damit es ginge. Was nicht mehr zählt: „Geht bei uns nicht" und „Haben wir immer so gemacht".`,
  },
  sources: [
    {
      id: "rand2024",
      text: `RAND Corporation 2024: 84 % der befragten Industrie-Praktiker (42 von 50) nennen die Führung als Hauptgrund fürs Scheitern von KI-Projekten, nicht die Technik (Studie 65 Praktiker gesamt)`,
      url: "https://www.rand.org/content/dam/rand/pubs/research_reports/RRA2600/RRA2680-1/RAND_RRA2680-1.pdf",
      shownFor: ["einkaeufer", "verwalter"],
    },
    {
      id: "iwkoeln2025",
      text: `IW Köln 2025 (n=1.038 Geschäftsführer): nur 3,6 % entwickeln KI selbst, die KI-Nutzung im Mittelstand bleibt bislang eher oberflächlich`,
      url: "https://www.iwkoeln.de/fileadmin/user_upload/Studien/Report/PDF/2025/IW-Report_2025-KI-als-Wettbewerbsfaktor.pdf",
      shownFor: ["einkaeufer"],
    },
    {
      id: "microsoft2026",
      text: `Microsoft AI Economy Institute (Jan 2026): global nutzen erst 16,3 % der Menschen generative KI`,
      url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2026/01/Microsoft-AI-Diffusion-Report-2025-H2.pdf",
    },
  ],
  optin: {
    heading: "Dein Ergebnis steht. Jetzt das Werkzeug für die Umsetzung.",
    body:
      "Du kennst jetzt Deinen Führungs-Typ und Deinen nächsten Schritt. Das Umsetzungs-Toolkit ist das, " +
      "womit Du morgen anfängst: der 30-Minuten-Selbst-Start-Plan, die KI-Challenge-Frage als Karten-Set " +
      "fürs nächste Meeting, und ein Template, mit dem Du Deinem Team sichtbar machst, dass und wie Du KI " +
      "nutzt. Trag Deine E-Mail ein, ich schick Dir das Toolkit und einen persönlichen Link, über den Du " +
      "jederzeit zurückkommst.",
    button: "Toolkit anfordern",
    consent:
      "Mit „Toolkit anfordern“ willige ich ein, dass meine E-Mail-Adresse und meine Check-Antworten " +
      "gespeichert und verarbeitet werden, damit ich mein Umsetzungs-Toolkit erhalte, und dass mir Daniel " +
      "Kreuzhofer regelmäßig Tipps und Angebote rund um KI per E-Mail schickt. Die Verarbeitung läuft über " +
      "Dienstleister in der EU (Hosting, E-Mail-Versand, Newsletter) mit Auftragsverarbeitungsvertrag; meine " +
      "Daten werden nicht verkauft. Ich bestätige per Double-Opt-in und kann mich jederzeit abmelden.",
    datenschutzHref: "/datenschutz",
    successHeading: "Fast geschafft, schau in Dein Postfach",
    successBody:
      "Ich habe Dir gerade eine E-Mail geschickt. Ein Klick auf den Bestätigungs-Link, dann hast Du Dein " +
      "Umsetzungs-Toolkit. (Falls nichts ankommt: kurz im Spam-Ordner schauen.)",
    errorBody:
      "Da ist gerade etwas schiefgelaufen. Dein Ergebnis siehst Du oben weiterhin, bitte versuch es in " +
      "einem Moment noch einmal.",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "dein.name@firma.de",
  },
  video: {
    intro:
      "Das ganze Denkmodell, warum AI-first beim Chef anfängt und wie der erste Move konkret aussieht, " +
      "steckt im Video:",
    title: "Du musst selbst ran",
    label: "Video #06",
    url: "",
  },
};
