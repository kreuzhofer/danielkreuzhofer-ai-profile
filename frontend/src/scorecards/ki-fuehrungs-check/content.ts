/**
 * KI-Führungs-Check — renderer content. VERBATIM from the approved quiz-spec
 * (A–C). Daniel's voice; keine m-dashes, keine erfundenen Zahlen. The per-typ
 * "Dein Führungs-Score: {score} von 100, Typ X." headline from the spec is
 * omitted here — the score block + outcome heading already show score + typ.
 */

import type { ScorecardContent } from "@/lib/scorecard/content";

export const content: ScorecardContent = {
  intro: {
    eyebrow: "KI-Führungs-Check",
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
      diagnose: `Du hast in KI investiert, Lizenzen, vielleicht eine Schulung, und es läuft ins Leere. Oder bei Dir ist offiziell noch nichts passiert, während einzelne im Team längst privat mit KI arbeiten und Du keinen Überblick hast. Beides ist dasselbe Muster, und kein Technik-Problem. Du behandelst KI wie einen neuen Drucker: angeschafft oder geduldet, dann soll das Team schon damit klarkommen. Aber KI verändert, wie Entscheidungen getroffen werden, und die triffst Du. Solange Du oben nicht sichtbar mitmachst, liest Dein Team genau eine Botschaft heraus: optional. Damit bleibt das Werkzeug liegen oder läuft unkontrolliert an Dir vorbei, egal wie gut es ist.`,
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
      datenschutz: `Berechtigt, und lösbar. Der erste Schritt braucht keine sensiblen Daten, fang mit unkritischen Aufgaben an. Den datenschutzkonformen Zugang zum Postfach klärst Du separat, bevor echte Kundendaten ins Spiel kommen.`,
      skeptisch: `Die Skepsis teilen viele Chefs. Genau deshalb fängst Du an einer Stelle an, wo Du das Ergebnis sofort selbst beurteilen kannst, statt es zu glauben.`,
    },
  },
  freeTool: {
    label: "Deine KI-Challenge-Frage",
    body: `Dein Werkzeug ab Montag, eine einzige Frage: „Warum können wir das nicht mit KI machen?" Nicht als Vorwurf, als Auftrag. Ausgeschrieben: Findet heraus, OB es mit KI geht. Wenn ja, zeigt mir WIE. Wenn nein, will ich WISSEN, WARUM NICHT, und WAS sich ändern müsste, damit es ginge. Was nicht mehr zählt: „Geht bei uns nicht" und „Haben wir immer so gemacht".`,
  },
  tipps: [
    {
      category: "eigennutzung",
      title: "Hebel 1 — Eigennutzung",
      subtitle: `Erste konkrete KI-Moves im Alltag der Führungskraft, unter 10 Min/Tag`,
      tipps: [
        {
          lead: `Wochen-Triage per KI-Brief`,
          evidence: "data",
          body: `Montags früh alle offenen Themen, E-Mails, Termine der Woche als unstrukturierten Text in ein KI-Tool eingeben, mit dem Prompt: „Priorisiere nach Dringlichkeit und Wichtigkeit, zeige blinde Flecken." Box-CEO Aaron Levie spart damit täglich ein bis zwei Stunden. Zeit: 5–7 Min.`,
        },
        {
          lead: `Entscheidungs-One-Pager`,
          evidence: "data",
          body: `Vor jeder wichtigen Entscheidung (Investment, Personalfrage, Strategie) einen KI-generierten One-Pager erstellen lassen: Optionen, Risiken, Gegenargumente, Empfehlung. Das zwingt zu strukturiertem Denken und liefert blinde Flecken, die man intern übersieht. Zeit: 3–5 Min.`,
        },
        {
          lead: `Angebots- und Kommunikationsrohfassung`,
          evidence: "practice",
          body: `Angebote, Boardberichte oder schwierige E-Mails als Stichpunkte diktieren und von KI ausformulieren lassen, dann nur noch redigieren statt von der leeren Seite anfangen. Best-Practice etablierter CEOs (u. a. Microsoft, Box). Zeit: 2–4 Min.`,
        },
        {
          lead: `Markt-Monitoring in einem Prompt`,
          evidence: "practice",
          body: `Täglich einen Prompt mit Wettbewerber, Branchenthema oder Kundensegment als Briefing-Anfrage laufen lassen. Statt selbst zu recherchieren: KI fasst Trends zusammen und markiert, was neu ist. Ergebnis direkt in die Meetingagenda ziehen.`,
        },
        {
          lead: `30-Tage-Experiment statt Strategie`,
          evidence: "data",
          body: `Kein Rollout, kein Projektplan, stattdessen: ein einziges KI-Tool 30 Tage täglich für eine Führungsaufgabe nutzen. Atlassian-Forschung empfiehlt genau dieses „try small, then scale"-Muster, bevor Prozesse umgestellt werden.`,
        },
      ],
    },
    {
      category: "sichtbarkeit",
      title: "Hebel 2 — Sichtbarkeit / Vorbild",
      subtitle: `Wie ein Chef seine KI-Nutzung sichtbar macht, sodass Nutzung „erlaubt statt ertappt" wird`,
      tipps: [
        {
          lead: `KI-Nutzung explizit benennen`,
          evidence: "data",
          body: `In Meetings, E-Mails oder Updates aktiv erwähnen: „Den Entwurf hat mir KI vorstrukturiert" oder „Die Zusammenfassung stammt aus einem KI-Briefing." Das senkt die Hemmschwelle im Team nachweisbar; aus dem Unsichtbaren wird ein kulturell sanktioniertes Verhalten.`,
        },
        {
          lead: `KI-Fail öffentlich machen`,
          evidence: "practice",
          body: `In der nächsten Teamrunde ein Beispiel erzählen, wo das KI-Ergebnis falsch oder irreführend war, und wie man es korrigiert hat. Das normalisiert kritisches Denken gegenüber KI-Output und signalisiert: Man darf ausprobieren und auch scheitern.`,
        },
        {
          lead: `„KI-Minute" in Jour-fixes`,
          evidence: "practice",
          body: `Feste zwei Minuten am Ende jedes Teambriefings: Wer hat diese Woche KI verwendet, für was, mit welchem Ergebnis? Rotation: jede Woche jemand anderes. Keine Bewertung, nur Austausch. So entsteht organisches Peer-Learning ohne Trainingsbudget.`,
        },
        {
          lead: `Freigegebene Spielwiese benennen`,
          evidence: "practice",
          body: `Kommunizieren, welche ein bis zwei KI-Tools offiziell erlaubt sind, einfach, konkret, ohne langen Policy-Text. Das schafft Orientierung und signalisiert: Es ist gewollt, nicht nur geduldet.`,
        },
        {
          lead: `Erste eigene KI-Routine teilen`,
          evidence: "data",
          body: `Den eigenen Wochen-Triage-Prompt (Hebel 1) mit einem direkten Mitarbeitenden teilen: „Versuch das mal eine Woche." Persönliche Empfehlungen der eigenen Führungskraft sind nachweislich wirksamer als externe Schulungen.`,
        },
      ],
    },
    {
      title: "Hebel 3 — Schatten-KI / Governance",
      subtitle: `Was tun, wenn Mitarbeitende längst privat ChatGPT & Co. nutzen`,
      tipps: [
        {
          lead: `Bestandsaufnahme ohne Schuldzuweisung`,
          evidence: "data",
          body: `Statt Verbot eine offene Frage in die Teams schicken: „Welche KI-Tools nutzt ihr heute, wofür, mit welchen Daten?" Eine anonyme Umfrage liefert ehrlichere Ergebnisse als formale Abfragen. Ziel: Realität verstehen, nicht „erwischen". Zwei Wochen bis zur belastbaren Inventarliste.`,
        },
        {
          lead: `Die KI-Ampel einführen`,
          evidence: "practice",
          body: `Statt langer Richtlinie eine dreistufige Ampel kommunizieren. Grün: freigegebene Tools (z. B. interne Microsoft-Copilot-Umgebung, geprüfte Übersetzer). Gelb: erlaubt mit Einschränkungen (nur anonymisierte Daten, kein Kundenbezug). Rot: verboten (Upload sensibler Kunden- oder Vertragsdaten in Public-Tools). Format aus der deutschen KI-Governance-Praxis im Mittelstand.`,
        },
        {
          lead: `Zweiseitige KI-Nutzungsrichtlinie statt Handbuch`,
          evidence: "data",
          body: `Drei Dinge müssen drinstehen: (1) Positiv-Liste freigegebener Tools, (2) Verbots-Liste verbotener Dateneingaben, (3) Eskalationsweg für neue Tools. Sie muss von der Geschäftsleitung unterschrieben sein, nicht nur von der IT, sonst greift sie bei NIS2-Audits nicht als Nachweis. Aufwand: 14 Tage.`,
        },
        {
          lead: `Sichere Alternativen bereitstellen`,
          evidence: "data",
          body: `38 % der Mitarbeitenden geben zu, vertrauliche Informationen ohne Erlaubnis in KI-Tools eingegeben zu haben. Der einzig wirksame Gegenzug: freigegebene, sicherheitskonforme Alternativen anbieten (z. B. Microsoft 365 Copilot, Azure OpenAI mit eigenen Datengrenzen). Wer keinen sicheren Weg anbietet, drängt Mitarbeitende in unsichere.`,
        },
        {
          lead: `Quartals-Review als Pflichttermin`,
          evidence: "practice",
          body: `KI-Governance veraltet schnell, neue Tools entstehen wöchentlich. Einen wiederkehrenden 60-minütigen Review-Termin im Kalender anlegen, in dem Ampel-Liste und Nutzungsrichtlinie aktualisiert werden.`,
        },
      ],
    },
    {
      category: "bounds",
      title: "Hebel 4 — Urteilsfähigkeit / Bounds",
      subtitle: `Wie ein Chef KI-Ergebnisse beurteilt, ohne Prompt-Engineer zu werden`,
      tipps: [
        {
          lead: `Die „Drei-Quellen-Probe"`,
          evidence: "practice",
          body: `Bei jedem strategischen KI-Output mindestens eine Gegenfrage stellen: „Welche Annahme hast du über meine Situation gemacht, die wahrscheinlich falsch ist?" Diese eine Folgefrage legt die versteckte Prämisse offen, auf der die Gesamtantwort gebaut ist. Dafür braucht es kein Prompt-Know-how.`,
        },
        {
          lead: `Konsequenz-Check vor dem Handeln`,
          evidence: "data",
          body: `Vor jeder Entscheidung auf Basis eines KI-Outputs zwei Fragen stellen: (1) „Was wäre der irreversible Schaden, wenn das falsch ist?" (2) „Was weiß ich über meinen Kontext, das das Modell unmöglich wissen kann?" Dieses „Stakes Calibration"-Muster reduziert Urteilsfehler systematisch.`,
        },
        {
          lead: `Domänenexperten als Korrektiv einbinden`,
          evidence: "practice",
          body: `Bei spezialisierten Outputs (Recht, Finanzen, Technik) immer einen Fachmann das KI-Ergebnis gegenlesen lassen, nicht zum Prüfen der Grammatik, sondern der fachlichen Plausibilität. Der Aufwand ist gering; das Risiko eines ungeprüften KI-Outputs in Fachfragen ist hoch.`,
        },
        {
          lead: `Fluenz ist nicht Richtigkeit`,
          evidence: "data",
          body: `Intern kommunizieren: „Ein gut formulierter Satz ist kein Beweis für einen korrekten Sachverhalt." Diese Faustregel aus der KI-Sicherheitsforschung verändert, wie Teams mit KI-Outputs umgehen; sie werden skeptisch aus guten Gründen, nicht aus Technikfeindlichkeit.`,
        },
        {
          lead: `KI-Literacy durch Ausprobieren, nicht durch E-Learning`,
          evidence: "data",
          body: `HSLU Leadership-Forschung (2025): AI Literacy entsteht nicht durch E-Learnings, sondern durch gemeinsames Erproben, Reflexion und Peer-Learning. Eine monatliche interne „AI-Sandbox"-Runde (60 Min, konkrete Use Cases aus dem eigenen Business) baut Urteilsfähigkeit schneller auf als jeder externe Kurs.`,
        },
      ],
    },
    {
      category: "fuehrung",
      title: "Hebel 5 — AI-first-Reflex",
      subtitle: `Wie „Geht das mit KI?" zur Standardfrage in Entscheidungen wird`,
      tipps: [
        {
          lead: `„KI-Gate" in Meetings einführen`,
          evidence: "practice",
          body: `Zu Beginn jeder Diskussion über eine neue Aufgabe oder Entscheidung als Pflichtfrage: „Könnte KI hier 20 % der Zeit sparen oder 20 % bessere Ergebnisse liefern?" Nicht „Können wir das mit KI machen?", sondern die konkrete Effizienz-Frage. Das verankert den Reflex, ohne Aktionismus auszulösen.`,
        },
        {
          lead: `KI-Reflexion in Projektabschlüsse integrieren`,
          evidence: "practice",
          body: `Am Ende jedes Projekts oder Quartals eine Frage im Retro-Format: „Wo hätten wir KI einsetzen können und haben es nicht?" Kein Druck, nur Bewusstsein. Diese Rückwärtsperspektive baut den Reflex für künftige Entscheidungen auf.`,
        },
        {
          lead: `KI-Ziel in Jahresgespräche aufnehmen`,
          evidence: "data",
          body: `In Zielvereinbarungen für Führungskräfte und Bereichsleiter ein konkretes KI-Ziel festlegen: „Im nächsten Jahr identifiziert und implementiert dieser Bereich mindestens zwei KI-gestützte Prozesse." Organisationen mit aktivem Executive Sponsorship skalieren KI deutlich häufiger erfolgreich.`,
        },
        {
          lead: `KI als Standard-Benchmark für Neubeschaffungen`,
          evidence: "practice",
          body: `Bei jeder Software-Neuanschaffung oder Vergabe externer Aufgaben als Standardfrage: „Gibt es eine KI-native Alternative, die diesen Prozess 30 % günstiger oder schneller macht?" Nicht als Blockade, sondern als bewusster Vergleichspunkt im Einkauf.`,
        },
        {
          lead: `Den ersten „KI-Win" intern erzählen`,
          evidence: "data",
          body: `Sobald ein Bereich messbaren Nutzen erzielt (Zeit, Qualität, Kosten), diesen intern sichtbar machen, in einem kurzen All-Hands-Update, im Intranet oder per Führungs-E-Mail. Erfolgsgeschichten beschleunigen die kulturelle Diffusion stärker als jede Kampagne.`,
        },
      ],
    },
    {
      title: "Bonus — Drei KI-Führungs-Rituale",
      subtitle: `Zusammen unter 15 Min/Woche; die Wirkung liegt in der Konsistenz, nicht im Aufwand`,
      tipps: [
        {
          lead: `Ritual 1: Der öffentliche KI-Move (wöchentlich, 2 Min)`,
          evidence: "practice",
          body: `In jeder Teambesprechung kurz sagen, was Du diese Woche selbst mit KI gemacht hast, inklusive was nicht funktioniert hat. Z. B.: „Das Angebot für Kunde X hab ich als Rohfassung von KI schreiben lassen, hat 40 Minuten gespart, aber die Tonalität musste ich komplett überarbeiten." Vorleben durch persönliches Beispiel ist der stärkste Kulturhebel einer Führungskraft.`,
        },
        {
          lead: `Ritual 2: Die KI-Frage als Meeting-Opener (wöchentlich, 2 Min)`,
          evidence: "practice",
          body: `Jede Woche in einem Meeting dieselbe Frage stellen: „Gibt es hier etwas, das wir diese Woche mit KI schneller oder besser hinkriegen?" Keine Antwort erzwingen, nur fragen, immer wieder. Die Frage selbst trainiert den AI-first-Reflex im Team, nicht durch Anordnung, sondern durch Vorleben.`,
        },
        {
          lead: `Ritual 3: Der monatliche „KI-Win"-Slot (10 Min/Monat)`,
          evidence: "practice",
          body: `Einmal im Monat eine Person einladen, einen konkreten KI-Erfolg zu teilen: was sie ausprobiert hat, was es gebracht hat, was sie nächstes Mal anders macht. Erfolgsgeschichten von Peers beschleunigen die kulturelle Diffusion stärker als Top-down-Kommunikation, und es entsteht ein Anerkennungsmechanismus.`,
        },
      ],
    },
  ],
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
    heading: "Dein Ergebnis steht. Den vollständigen Report bekommst Du per E-Mail.",
    body:
      "Du kennst jetzt Deinen Führungs-Typ und Deinen nächsten Schritt. Den vollständigen Report schick ich " +
      "Dir per E-Mail: Deine Diagnose, Deine konkreten nächsten Schritte und eine Reihe sofort umsetzbarer " +
      "Tipps, dazu ein dauerhafter Link, über den Du jederzeit zurückkommst. Trag einfach Deine E-Mail ein.",
    button: "Report anfordern",
    consent:
      "Mit „Report anfordern“ willige ich ein, dass meine E-Mail-Adresse und meine Check-Antworten " +
      "gespeichert und verarbeitet werden, damit ich meinen Report erhalte, und dass mir Daniel " +
      "Kreuzhofer regelmäßig Tipps und Angebote rund um KI per E-Mail schickt. Die Verarbeitung läuft über " +
      "Dienstleister in der EU (Hosting, E-Mail-Versand, Newsletter) mit Auftragsverarbeitungsvertrag; meine " +
      "Daten werden nicht verkauft. Ich bestätige per Double-Opt-in und kann mich jederzeit abmelden.",
    datenschutzHref: "/datenschutz",
    datenschutzHinweis:
      "Deine Antworten bleiben bis zum Klick auf „Report anfordern“ nur in Deinem Browser. Erst dann " +
      "werden E-Mail und Antworten gespeichert (Hosting: Hostinger, Frankfurt) und der Bestätigungs-Link " +
      "per E-Mail verschickt (IONOS); nach Bestätigung läuft der Newsletter über CleverReach. Alle " +
      "Verarbeiter in der EU, AVV vorhanden. Kein Tracking, keine Cookies außer technisch notwendig.",
    successHeading: "Fast geschafft, schau in Dein Postfach",
    successBody:
      "Ich habe Dir gerade eine E-Mail geschickt. Ein Klick auf den Bestätigungs-Link, dann hast Du Deinen " +
      "Report. (Falls nichts ankommt: kurz im Spam-Ordner schauen.)",
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
    url: "https://youtu.be/OPuHZxOnkJw",
  },
};
