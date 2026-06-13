/**
 * Engpass-Check — ausführlicher Report: Content-Baukasten.
 *
 * WÖRTLICH übernommen aus `06-quiz-spec.md` → Sektion „Report-Inhalte
 * (ausführlich)" (A–G). Texte sind in Daniels Stimme — nicht umformulieren.
 * Die doc-seitigen Hard-Wraps wurden zu fließenden Absätzen geglättet
 * (Absatz-Grenze = `\n\n`); Wortlaut unverändert. Strings sind Template-Literals
 * (Backticks), damit die deutschen Anführungszeichen „…" nicht kollidieren.
 *
 * Zwei Stellen sind im Spec NUR als Tonangabe (kein Volltext) hinterlegt und
 * hier konservativ ausformuliert — markiert mit ADAPTIERT. Beide ohne Zahl.
 */

import type { Band, Dimension } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// A) Score-Band-Absätze (Punkt 1) — {score} wird zur Laufzeit ersetzt.
// ─────────────────────────────────────────────────────────────────────────────

export const SCORE_BAND_PARAGRAPH: Record<Band, string> = {
  feintuning:
    `{score} von 100 — Feintuning.\n\n` +
    `Dein Vertriebsprozess läuft im Kern. Du hast keine akute Engstelle, die Dir Durchsatz ` +
    `wegfrisst — eher einzelne Stellen, an denen sich noch was herausholen lässt. Die gute ` +
    `Nachricht: Du gehörst zu der Minderheit, die nicht erst aufräumen muss, bevor sie an KI ` +
    `denken kann. Die ehrliche Nachricht: Genau hier ist die Versuchung am größten, KI als ` +
    `Lösung zu suchen, wo es kein echtes Problem gibt. Heb Dir das Budget für die eine Stelle ` +
    `auf, die wirklich klemmt — und prüf zweimal, ob sie es wert ist.`,
  spuerbar:
    `{score} von 100 — spürbarer Engpass.\n\n` +
    `Bei euch klemmt es an einer klar benennbaren Stelle. Noch ist es kein Dauerfeuer, aber der ` +
    `Hebel ist da — und er ist groß genug, dass sich eine saubere Diagnose sofort lohnt. Wichtig: ` +
    `Dein Score sagt Dir, DASS es klemmt. Wo genau, sagt Dir Dein Engpass-Typ weiter unten. Beides ` +
    `zusammen ist Deine Landkarte: erst die Engstelle benennen, dann das Werkzeug wählen — nicht ` +
    `umgekehrt.`,
  akut:
    `{score} von 100 — akuter Engpass.\n\n` +
    `Hier liegt richtig Durchsatz brach. Bei euch staut sich der Vertrieb an einer Stelle, die Tag ` +
    `für Tag Zeit, Angebote und am Ende Aufträge kostet. Das ist unangenehm — aber es ist auch die ` +
    `beste Ausgangslage für einen sichtbaren Erfolg: Wer einen akuten Engpass löst, sieht die ` +
    `Wirkung sofort in den Zahlen. Eine Warnung dazu: In genau dieser Lage ist die Gefahr am ` +
    `größten, das Geld am falschen Schritt zu verbrennen. Eine KI-Investition irgendwo im Prozess ` +
    `bewegt Deine Zahlen nicht — nur die an Deiner Engstelle tut es. Welche das ist, steht jetzt unten.`,
};

/** Kontext-Zeile (alle Bänder, direkt unter dem Score-Absatz). */
export const KONTEXT_ZEILE =
  `Zur Einordnung, egal wo Dein Engpass sitzt: In Deutschland fließen nur 27 Prozent der ` +
  `Vertriebszeit in die direkte Arbeit mit Kunden — fast unverändert seit 2022 (Salesforce State ` +
  `of Sales, 2024). Die anderen drei Viertel frisst der Prozess. Dein Engpass ist die Stelle, an ` +
  `der er am meisten frisst.`;

// ─────────────────────────────────────────────────────────────────────────────
// B) Typ-Bausteine (Punkt 2 Voll-Diagnose, Punkt 4 Schritte, Punkt 7 Anti-Pattern)
//    Die Überschrift „Dein Engpass-Typ: {Name}." wird separat gerendert.
// ─────────────────────────────────────────────────────────────────────────────

export const TYP_DIAGNOSE: Record<Dimension, string> = {
  "mess-blindflug":
    `Du steuerst Deinen Vertrieb, ohne die Instrumente abzulesen. Durchlaufzeit, Win-Rate, Umsatz ` +
    `pro Funnel-Stufe — die Zahlen, an denen Du Erfolg festmachen könntest, erhebt ihr heute kaum ` +
    `oder gar nicht. Das ist kein Vorwurf. In den meisten Mittelständlern ist das so gewachsen: ` +
    `Das Geschäft lief, also hat keiner gemessen.\n\n` +
    `Das Problem dabei ist nicht das Bauchgefühl an sich — Du hast Erfahrung, und die trägt weit. ` +
    `Das Problem ist, dass Du ohne Zahlen jede KI-Investition blind tätigst. Du kannst vorher nicht ` +
    `sagen, wo es am meisten klemmt. Und Du kannst hinterher nicht beweisen, dass sich was ` +
    `verbessert hat. Genau daran sterben die meisten Piloten: Gartner hat gezeigt, dass mindestens ` +
    `30 Prozent aller KI-Projekte nach dem Proof of Concept eingestellt werden — Hauptgrund ist ` +
    `nicht die Technik, sondern dass niemand den Wert belegen konnte.\n\n` +
    `Für Dich heißt das: Bevor Du über Bauen, Kaufen oder Automatisieren auch nur nachdenkst, ` +
    `brauchst Du eine Baseline. Ein paar Wochen Zahlen, sauber erhoben. Das klingt nach einem ` +
    `Umweg. Es ist die Abkürzung — denn alles, was Du ohne Baseline startest, kannst Du nie als ` +
    `Erfolg verteidigen.`,
  "wissens-monopol":
    `Bei euch hängen entscheidende Prozessschritte an einzelnen Köpfen. Was genau passieren muss, ` +
    `damit aus einer Anfrage ein gutes Angebot wird — das weiß Dein erfahrenster Mann. Aber es ` +
    `steht nirgends. Kein Handbuch, keine Regeln, keine Dokumentation. Es ist in seinem Kopf.\n\n` +
    `Das funktioniert, solange er da ist. Es wird zum Risiko, sobald er ausfällt, kündigt oder in ` +
    `Rente geht — dann geht das Wissen mit ihm. Und Du bist damit nicht allein: In einer ` +
    `Statista-Erhebung für den deutschen Mittelstand gaben 38 Prozent der Unternehmen an, dass ` +
    `Wissen sofort verloren oder nur mühsam auffindbar wäre, wenn der Falsche ausfällt. Nur 27 ` +
    `Prozent hatten es so dokumentiert, dass ein Kollege sofort weiterarbeiten könnte. Bei zwei ` +
    `von drei Firmen hängt also genau das, was Dich gerade bremst.\n\n` +
    `Es ist die eigentliche Bremse für jede Automatisierung: Eine Maschine kann nur übernehmen, ` +
    `was sich beschreiben lässt. Was nur in einem Kopf existiert, kann keine Software abbilden — ` +
    `egal wie gut die KI ist.\n\n` +
    `Das ist die unbequeme Wahrheit hinter „bei uns ist alles zu individuell": Oft ist es gar ` +
    `nicht zu individuell. Es ist nur nicht aufgeschrieben. Wenn ein Mensch das Angebot nach ` +
    `gewissen Regeln erstellen kann, dann gibt es diese Regeln — sie sind nur nie aus dem Kopf aufs ` +
    `Papier gewandert. Und genau da liegt Deine größte Chance: Der Schritt vom Kopf-Wissen zum ` +
    `beschriebenen Prozess ist der, der Dich am weitesten bringt. Mit oder ohne KI.`,
  "uebergabe-stau":
    `Dein Vertriebsprozess hängt nicht im Vertrieb — er hängt zwischen den Abteilungen. Ein ` +
    `Angebot wartet auf die Konstruktion, die prüfen muss, ob das technisch geht. Oder auf die ` +
    `Preisfreigabe. Oder auf eine Rückfrage, die per Mail hin und her geht. Jede dieser Übergaben ` +
    `kostet Tage, in denen nichts passiert — das Angebot liegt einfach.\n\n` +
    `Das Tückische am Übergabe-Stau: Dein Vertrieb kann noch so schnell sein, es nützt nichts. ` +
    `Wenn das Angebot drei Tage bei der Konstruktion liegt, sind drei Tage weg — egal wie flink ` +
    `der Vertriebler war. Genau das meint die Engpass-Theorie: Die Geschwindigkeit des ` +
    `Gesamtprozesses wird allein an der Engstelle entschieden. Alles davor staut sich nur davor ` +
    `auf, alles danach wartet.\n\n` +
    `Und das ist die gute Nachricht: Der Übergabe-Stau ist der Engpass-Typ mit den stärksten ` +
    `dokumentierten Erfolgen im deutschen Mittelstand. Schulte Elektrotechnik hatte genau Dein ` +
    `Problem — jede Angebots-Konfiguration brauchte eine Rückfrage bei der Konstruktion. Mit einem ` +
    `regelbasierten Konfigurator, der die technische Prüfung automatisch macht, wurden ihre ` +
    `Angebote 70 Prozent schneller, und die Konstruktion war raus aus der Schleife. RSP ` +
    `Spezialsaugtechnik brachte ihr Standardangebot von zwei Stunden auf zehn Minuten. Beides ohne ` +
    `KI — reine Regel-Strecke an genau der Übergabe, die geklemmt hat.`,
  "schnittstellen-luecke":
    `Eure Systeme reden nicht miteinander — und die Lücke füllen Menschen. Daten werden von Hand ` +
    `aus einem System ins andere kopiert, über Excel geschleust, neu eingetippt. Jeder dieser ` +
    `Schritte kostet Zeit, und jeder ist eine Fehlerquelle: Ein Zahlendreher beim Übertragen, eine ` +
    `veraltete Version, ein vergessenes Feld.\n\n` +
    `Das ist der Engpass-Typ, den niemand auf der Rechnung hat, weil er sich so normal anfühlt. ` +
    `„Das haben wir immer so gemacht." Aber Copy-Paste zwischen Systemen ist einer der teuersten ` +
    `Prozessschritte überhaupt — nicht, weil ein einzelner Vorgang viel kostet, sondern weil er ` +
    `sich tausendfach wiederholt und nie jemand draufschaut. Du bist damit nicht allein: ` +
    `Vertriebsteams jonglieren laut Salesforce im Schnitt acht einzelne Tools, und 42 Prozent der ` +
    `Vertriebler fühlen sich von der Tool-Flut überfordert. Das Datenproblem, das daraus ganz oben ` +
    `auf der Liste steht — noch vor doppelten oder unvollständigen Daten — sind manuelle Fehler. ` +
    `Und 46 Prozent sagen, dass schlechte Datenqualität ihnen direkt Umsatz kostet (Salesforce ` +
    `State of Sales, 2025). Das ist die Quittung für die manuelle Schnittstelle: falsche Daten, ` +
    `falsche Entscheidungen, verlorene Abschlüsse.\n\n` +
    `Oft steckt eine Lizenz-Entscheidung dahinter: Das eine System hat keine offene Schnittstelle, ` +
    `weil der Hersteller sie nicht vorgesehen hat — oder sie extra kostet. Dann arbeiten Menschen ` +
    `über die Oberfläche, weil es maschinell nicht geht. Das ist lösbar, aber es ist eine eigene ` +
    `Frage: Manchmal ist die billigste Automatisierung schlicht, die fehlende Schnittstelle ` +
    `freizuschalten oder ein verbindendes Tool davorzusetzen.`,
};

export const TYP_SCHRITTE: Record<Dimension, [string, string, string]> = {
  "mess-blindflug": [
    `Leg drei Zahlen fest, die Deinen Vertrieb beschreiben. Für die meisten reicht: Durchlaufzeit ` +
      `eines Angebots (Anfrage bis Versand), Win-Rate (Angebote zu Aufträgen), und Umsatz pro ` +
      `Funnel-Stufe. Mehr nicht — drei genügen für den Anfang.`,
    `Erheb sie vier Wochen lang, auch wenn es erstmal von Hand ist. Ein Mitarbeiter, eine ` +
      `Excel-Tabelle, jeden Freitag fünf Minuten. Du brauchst keine Software dafür — Du brauchst ` +
      `die Gewohnheit.`,
    `Setz Dir VORHER ein Ziel: „Wenn wir mit KI an Stelle X arbeiten, wollen wir Zahl Y um Z ` +
      `Prozent bewegen." Erst wenn Du diesen Satz ausfüllen kannst, lohnt sich der nächste Schritt.`,
  ],
  "wissens-monopol": [
    `Setz Dich eine Stunde mit der Person zusammen, an der das meiste hängt. Lass sie EINEN ` +
      `typischen Angebotsfall laut durchdenken — Schritt für Schritt, jede Entscheidung, jede ` +
      `Regel. Schreib mit. Das ist Dein erster Prozess-Entwurf.`,
    `Mach den Absatz-Test: Kannst Du den Kern dieses Prozesses in einem Absatz beschreiben? Wenn ` +
      `ja, hast Du die halbe Automatisierung schon geschafft. Wenn nein, weißt Du genau, wo noch ` +
      `Kopf-Wissen fehlt.`,
    `Bevor Du an Tools denkst: Lass die wichtigsten zwei, drei Prozesse so beschreiben, dass ein ` +
      `neuer Mitarbeiter sie lesen und anwenden könnte. Was ein Neuer aus der Doku machen kann, ` +
      `kann später auch eine Maschine.`,
  ],
  "uebergabe-stau": [
    `Zeichne Deinen Angebotsprozess einmal auf — von der Anfrage bis zum Versand, jeder Schritt, ` +
      `jede Abteilung. Markier die Stellen, an denen ein Angebot von einer Hand in die nächste ` +
      `geht. Da sitzt Dein Stau.`,
    `Miss an der schlimmsten Übergabe: Wie viele Tage liegt ein Angebot dort durchschnittlich? ` +
      `Diese eine Zahl ist Dein Vorher-Wert — und Dein stärkstes Argument für ein Projekt.`,
    `Frag bei der Engstelle: Was prüft die Abteilung hier eigentlich? Wenn es eine Regel ist ` +
      `(„geht das technisch zusammen?", „ist der Preis freigegeben?"), dann lässt sie sich ` +
      `beschreiben — und damit automatisieren. Genau das haben Schulte und RSP gemacht.`,
  ],
  "schnittstellen-luecke": [
    `Mach eine Liste: An welchen Stellen kopieren bei euch Menschen Daten von einem System ins ` +
      `andere? Schreib jede Stelle auf, auch die kleinen. Du wirst überrascht sein, wie viele es sind.`,
    `Schätz pro Stelle grob: Wie oft am Tag, wie viele Minuten? Multiplizier das hoch auf die ` +
      `Woche. Diese Summe ist die Zeit, die ihr aktuell als menschliche Schnittstelle verbrennt.`,
    `Prüf bei der teuersten Stelle: Hat das System eine Schnittstelle, die ihr nur nicht nutzt? ` +
      `Oft liegt die Lösung näher, als man denkt — ein freigeschalteter Export, ein ` +
      `Verbindungs-Tool. Das ist klassische Automatisierung, kein KI-Projekt.`,
  ],
};

export const TYP_ANTIPATTERN: Record<Dimension, string> = {
  "mess-blindflug":
    `Vermeide jetzt eines: Dir von einem Tool-Anbieter ein Dashboard verkaufen zu lassen, bevor Du ` +
    `weißt, welche drei Zahlen Du überhaupt brauchst. Ein Dashboard, das die falschen Dinge misst, ` +
    `ist teurer Blindflug mit besserer Grafik.`,
  "wissens-monopol":
    `Vermeide den Reflex, sofort einen KI-Agenten auf das Problem zu werfen, „der sich das schon ` +
    `selbst beibringt". Tut er nicht. Wenn der Prozess nicht beschrieben ist, baust Du eine ` +
    `Blackbox auf eine Blackbox — und verstehst am Ende noch weniger als vorher. Erst beschreiben, ` +
    `dann automatisieren.`,
  "uebergabe-stau":
    `Vermeide es, den Vertrieb selbst schneller machen zu wollen, solange die Übergabe klemmt. ` +
    `Mehr Tempo vor der Engstelle macht den Stau nur länger. Repariere die Übergabe zuerst — dann ` +
    `lohnt sich Tempo davor.`,
  "schnittstellen-luecke":
    `Vermeide es, die Copy-Paste-Arbeit durch eine KI „intelligent" machen zu wollen, solange eine ` +
    `simple Schnittstelle das Problem an der Wurzel löst. Eine KI, die Daten zwischen Systemen ` +
    `abtippt, ist die teuerste Lösung für ein Problem, das oft zwei IF-Statements wären.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// C) Personalisierungs-Regeln (Punkt 3 — „Was das für Dich bedeutet")
// ─────────────────────────────────────────────────────────────────────────────

export const PERSONALISIERUNG = {
  // S6 = „im PoC hängengeblieben"
  poc:
    `Und Du hast es schon gespürt: Euer letztes KI-Projekt ist im Proof of Concept steckengeblieben. ` +
    `Das ist kein Zufall und kein Versagen — es ist das exakte Muster aus der Gartner-Zahl. Der ` +
    `Pilot hat technisch funktioniert, aber er saß nicht an Deiner Engstelle, oder ihr konntet den ` +
    `Wert nicht messen. Dieses Mal drehst Du die Reihenfolge um.`,
  // S6 = „wieder eingestellt" — ADAPTIERT (Spec gab nur Tonangabe, keinen Volltext). Keine Zahl.
  eingestellt:
    `Und Du hast es schon erlebt: Euer letztes KI- oder Automatisierungs-Projekt wurde wieder ` +
    `eingestellt. In den meisten Fällen liegt das nicht an der Technik, sondern daran, dass sich ` +
    `der Wert nie sauber belegen ließ — und was niemand beweisen kann, wird beim nächsten ` +
    `Budget-Review gestrichen. Das lässt sich diesmal vermeiden: erst die Engstelle und die ` +
    `Messung, dann das Projekt.`,
  // S1 = „Zwei Wochen oder länger" UND Typ ∈ {Übergabe-Stau, Schnittstellen-Lücke}
  zweiWochen:
    `Zwei Wochen oder mehr von der Anfrage bis zum Angebot — in einem kompetitiven Markt ist das ` +
    `die Stelle, an der Dir Aufträge wegbrechen, bevor der Kunde überhaupt mit Dir spricht. Genau ` +
    `hier zahlt sich Tempo am direktesten aus.`,
  // K4 = „Reine Infrastruktur" ODER „keine eigene IT"
  itInfrastruktur:
    `Eine Sache vorweg, weil sie Deine Optionen beeinflusst: Deine IT kümmert sich um ` +
    `Infrastruktur, nicht um Software-Entwicklung. Das ist völlig in Ordnung — aber es heißt, dass ` +
    `„bauen wir intern" für Dich realistisch keine Option ist. Dein Weg führt eher über Kaufen ` +
    `oder über einen Partner, der für Dich baut. Gut zu wissen, bevor jemand „machen wir selbst" ` +
    `in den Raum wirft.`,
  // K2 = „über 2.000" ODER „unter 50" — ADAPTIERT (Spec gab nur Tonangabe). Keine externe Zahl.
  groesseRand:
    `Ein Hinweis zur Einordnung: Dieser Check ist auf den Mittelstand zwischen 50 und 2.000 ` +
    `Mitarbeitenden zugeschnitten. Euer Unternehmen liegt außerhalb dieser Spanne — die konkreten ` +
    `Zahlen treffen vielleicht nicht eins zu eins, aber das Prinzip trägt: erst die Engstelle ` +
    `finden, dann das Werkzeug wählen.`,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// D) Weg-Tendenz-Volltexte (Punkt 5)
// ─────────────────────────────────────────────────────────────────────────────

export type WegVariant = "stufe-0" | "weg-a" | "weg-b" | "weg-c";

export const WEG_VOLLTEXT: Record<WegVariant, string> = {
  "stufe-0":
    `Dein wahrscheinlicher Weg: noch keiner — und das ist die richtige Antwort. Bevor Du baust, ` +
    `kaufst oder automatisierst, fehlt Dir die Messung. Ohne Vorher-Zahl kannst Du keinen Erfolg ` +
    `beweisen, und ein Projekt, dessen Erfolg Du nicht beweisen kannst, wird beim nächsten ` +
    `Budget-Review gestrichen. Erst die Baseline, dann der Weg. Das ist keine Verzögerung, das ist ` +
    `die Versicherung für alles, was danach kommt.`,
  "weg-a":
    `Deine Weg-Tendenz: Automatisieren — und zwar wahrscheinlich ganz ohne KI. Das überrascht ` +
    `viele. Aber wenn Dein Engpass eine regelbasierte Übergabe oder eine fehlende Schnittstelle ` +
    `ist, dann ist die Lösung eine Regel-Strecke, kein Sprachmodell. Schulte (70 Prozent schnellere ` +
    `Angebote) und RSP (von zwei Stunden auf zehn Minuten) haben genau das gemacht — klassische ` +
    `Automatisierung an der richtigen Stelle. Kein LLM, keine Halluzinationen, keine ` +
    `Datenschutz-Diskussion. Prüf zuerst diesen Weg, bevor Du an etwas Komplizierteres denkst.`,
  "weg-b":
    `Deine Weg-Tendenz: Kaufen. Dein Engpass klingt nach einem Problem, das nicht nur ihr habt — ` +
    `saubere Kontaktdaten, Dokumenten-Versand, Standard-Auswertungen. Solche Probleme haben ` +
    `tausende Firmen, und was tausende Firmen haben, hat längst jemand gelöst, wahrscheinlich ` +
    `besser, als Du es selbst bauen würdest. Schau Dich auf dem Markt um, bevor Du irgendwas ` +
    `baust. Der Preis dafür: weniger Flexibilität. Eine gekaufte Lösung ist, wie sie ist — Du ` +
    `passt Deine Prozesse an, nicht umgekehrt.`,
  "weg-c":
    `Deine Weg-Tendenz: Bauen — aber nur, wenn drei Dinge zusammenkommen. Erstens: Der Prozess ist ` +
    `Dein Wettbewerbsvorteil, etwas, das es so nicht zu kaufen gibt und das Du nicht aus der Hand ` +
    `geben willst. Zweitens: Du hast das Know-how — eigene Leute oder einen Partner, dem Du ` +
    `vertraust. Drittens: Das Ziel ist klar. Fehlt eine der drei Bedingungen, ist Bauen der ` +
    `riskanteste Weg. Wenn alle drei stimmen, ist es der mit dem höchsten Hebel — eine Lösung, ` +
    `gebaut für genau eure Prozesse, die kein Wettbewerber kaufen kann.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// E) GF-Satz (Punkt 6) — typ-abhängig
// ─────────────────────────────────────────────────────────────────────────────

export const GF_SATZ: Record<Dimension, string> = {
  "mess-blindflug":
    `„Wir starten, sobald die Baseline steht — sonst können wir den Erfolg nie beweisen." Das ist ` +
    `keine Verzögerungstaktik. Das ist die Bedingung dafür, dass wir am Ende zeigen können, dass es ` +
    `sich gelohnt hat.`,
  "wissens-monopol":
    `„Bevor wir ein Tool kaufen, schreiben wir den Prozess auf. Was wir nicht in einem Absatz ` +
    `beschreiben können, kann auch keine Software übernehmen."`,
  "uebergabe-stau":
    `„Unser Engpass sitzt nicht im Vertrieb, sondern an der Übergabe zur [Konstruktion/Freigabe]. ` +
    `Da setzen wir an — und wir messen die Durchlaufzeit vorher und nachher, damit der Erfolg ` +
    `belegt ist."`,
  "schnittstellen-luecke":
    `„Wir verlieren Zeit, weil unsere Systeme nicht miteinander reden. Bevor wir über KI sprechen, ` +
    `prüfen wir die günstigste Lösung: die fehlende Schnittstelle schließen."`,
};

// ─────────────────────────────────────────────────────────────────────────────
// E2) Quellen-Bausteine (Punkt 8) — nur tatsächlich vorkommende Belege rendern.
//     URLs verbatim aus der Spec-Tabelle (am 2026-06-13 verifiziert).
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportSource {
  id: string;
  /** Render-Text der Belegzeile. */
  text: string;
  url: string;
}

export const SOURCES = {
  salesforce2024: {
    id: "salesforce2024",
    text: `Vertriebszeit (27 %): Salesforce, „State of Sales Report" (6. Ausgabe, 2024)`,
    url: "https://www.salesforce.com/de/company/news-press/press-releases/2024/07/310724/",
  },
  kyocera2018: {
    id: "kyocera2018",
    text: `Wissensverlust-Zahlen (38 % / 27 %): Statista im Auftrag von Kyocera, „Wissensmanagement in deutschen Unternehmen" (2018)`,
    url: "https://kyocera.blog/wissensverlust-wenn-unternehmenwissen-mit-dem-mitarbeiter-geht/",
  },
  salesforce2025: {
    id: "salesforce2025",
    text: `Tool-Flut & Datenqualität (8 Tools, 42 %, 46 %): Salesforce, „State of Sales" (7. Ausgabe, 2025)`,
    url: "https://www.salesforce.com/sales/state-of-sales/",
  },
  encowaySchulte: {
    id: "encowaySchulte",
    text: `Schulte Elektrotechnik, 70 % schnellere Angebote: encoway-Referenz`,
    url: "https://www.encoway.de/referenzen/schulte-evoline/",
  },
  camosRsp: {
    id: "camosRsp",
    text: `RSP Spezialsaugtechnik, 2 Stunden → 10 Minuten: immittelstand.de / camos (2026)`,
    url: "https://www.immittelstand.de/2026/06/09/angebote-in-minuten-statt-stunden-rsp-digitalisiert-den-vertrieb-komplexer-saugbagger-mit-camos-cpq/",
  },
  gartner2024: {
    id: "gartner2024",
    text: `KI-Projekte nach Proof of Concept eingestellt (30 %): Gartner (2024)`,
    url: "https://www.gartner.com/en/newsroom/press-releases/2024-07-29-gartner-predicts-30-percent-of-generative-ai-projects-will-be-abandoned-after-proof-of-concept-by-end-of-2025",
  },
} as const satisfies Record<string, ReportSource>;

export type SourceId = keyof typeof SOURCES;

// ─────────────────────────────────────────────────────────────────────────────
// F) Opt-in-Block (Punkt 9) · G) Video-Verweis (Punkt 10)
// ─────────────────────────────────────────────────────────────────────────────

export const OPTIN_TEXT =
  `Du hast Dein Ergebnis. Wenn Du es schwarz auf weiß willst — zum Abspeichern, zum Weiterleiten ` +
  `an Deine Geschäftsführung, zum Abarbeiten im nächsten Termin — schick ich Dir den ausführlichen ` +
  `Report als PDF. Da drin ist zusätzlich das ausfüllbare Engpass-Raster, mit dem Du Deinen Prozess ` +
  `Schritt für Schritt durchgehst, und der Entscheidungsbaum für die drei Wege. Trag Deine E-Mail ` +
  `ein, ich schick ihn Dir sofort.`;

export const VIDEO_INTRO =
  `Das ganze Denkmodell — warum Software 2026 nicht mehr Dein Engpass ist und wie Du die ` +
  `Bauen-oder-Kaufen-Frage in der richtigen Reihenfolge beantwortest — steckt im Video:`;
export const VIDEO_TITLE = "Software ist nicht mehr Dein Engpass";
export const VIDEO_LABEL = "Video #05";
/** Echte URL noch offen (Funnel-TODO) — leer ⇒ nicht-klickbar gerendert. */
export const VIDEO_URL = "";

// ─────────────────────────────────────────────────────────────────────────────
// Section-Labels (Render-Reihenfolge 1–10)
// ─────────────────────────────────────────────────────────────────────────────

export const REPORT_LABELS = {
  typPrefix: "Dein Engpass-Typ:",
  bedeutung: "Was das konkret für Dich bedeutet",
  schritte: "Deine drei nächsten Schritte",
  weg: "Dein wahrscheinlicher Weg",
  gf: "Der Satz für Deine Geschäftsführung",
  antiPattern: "Was Du jetzt vermeiden solltest",
  quellen: "Quellen & Belege",
} as const;
