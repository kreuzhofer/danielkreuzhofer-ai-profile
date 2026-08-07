# Funnels (danielkreuzhofer.de)

Zwei Funnel-Typen: Lead-Magnet-Scorecards (gratis, Ergebnis-Gate) und der Workshop (bezahlte Anmeldung). Dieses Glossar hält die Fachsprache fest, die in Specs (Vault), Content und Code identisch verwendet wird.

## Workshop (KI-Souveränität)

**Workshop-Termin**:
Ein konkreter Durchführungstermin eines Workshops mit definiertem Datum, Kapazität (Slots), Preis und Metadaten. Mehrere Termine können denselben Workshop-Inhalt haben. In der DB das Entity, an dem Anmeldungen hängen. `termin` ist `timestamptz NULL`: NULL = Termin offen, Workshop ist nicht buchbar (Formular deaktiviert oder ausgeblendet).
_Avoid_: Durchführung, Session, Event

**Warteliste**:
v2-Konzept. Sammlung von Interessenten, wenn der Workshop-Termin NULL ist (noch kein Termin) oder ausgebucht ist (alle Slots belegt). Im Pilot nicht gebaut; v2 muss entscheiden, ob beide Fälle denselben Mechanismus nutzen.
_Avoid_: Reserve, Interessenten-Liste

**Slot**:
Eine der definierten Kapazitäten eines Workshop-Termins (Pilot: 5). Slots pro Unternehmen, nicht pro Person. Freie Slots = Kapazität minus nicht-stornierte Anmeldungen.
_Avoid_: Platz (mehrdeutig — Platz ist das Ticket, Slot die Kapazität), Sitz

**Anmeldende Person**:
Die Person, die das Formular ausfüllt (Name + E-Mail). Erhält die Reservierungs-Bestätigung und später die Termin/Pre-Work-Mail. Muss nicht der Rechnungsempfänger sein.
_Avoid_: Teilnehmer (mehrdeutig — kann die 2. Person sein), Buchender

**Rechnungsempfänger**:
Die Firma/Person, an die die Rechnung geht. Kann von der Anmeldenden Person abweichen. Alle rechnungsstellungspflichtigen Daten werden für diesen erfasst. Im Formular vorausgefüllt mit Name/E-Mail der Anmeldenden Person, editierbar. Immer Pflicht.
_Avoid_: Kunde (zu allgemein), Teilnehmer

**Rechnungs-Kontakt**:
Name und E-Mail aus dem Formular, der an denselben Empfänger kopiert wird (Default = Anmeldende Person). Editierbar im Rechnungsempfänger-Block. Pflichtfeld.
_Avoid_: Rechnungsempfänger (das ist die vollständige Adresse)

**Zweit-Person**:
Die optionale zweite Person eines Firmatickets (bis 2 Personen pro Unternehmen). Name + E-Mail, erfasst im Formular der Anmeldenden Person. Wird von der Anmeldenden Person angemeldet (implizite Zustimmung zum Mail-Empfang). Erhält keine eigenen Mails, sondern wird in Reservierungs- und Buchungs-Bestätigung als CC gesetzt. Mail-Text muss explizit machen, dass die Anmeldende Person für die Zweit-Person anmeldet.
_Avoid_: Begleitperson, +1

**Zahlungspräferenz**:
Vom Anmeldenden gewählte Methode: Überweisung oder Zahlung-Link. Daniel entscheidet pro Fall, wie tatsächlich abgerechnet wird. Keine Zahlungsabwicklung im Repo.
_Avoid_: Zahlungsmethode (impliziert Abwicklung im System)

**Kleinunternehmer-Flag**:
Angabe zur Rechtsform/Steuerstatus des Rechnungsempfängers, die bestimmt, ob USt-IdNr. erfasst wird. Bei Kleinunternehmer §19 entfällt USt-IdNr.; bei B2B-USt-erfassbaren Firmen Pflicht (Format `DE\d{9}`). 99 € netto, USt-Status je nach Empfänger.
_Avoid_: USt-Status (zu technisch), Steuerklasse

**Admin-Notification-Mail**:
Mail an Daniel bei jeder neuen Reservierung. Enthält alle Anmeldungs- und Rechnungsdaten plus drei Magic-Links: Zahlung-bestätigt, Stornieren, Übersicht (ADR-0001).
_Avoid_: Admin-Mail (mehrdeutig), Benachrichtigung

**Action-Token**:
Single-use-Token pro Anmeldung, das eine Admin-Aktion auslöst (`confirm_payment`, `cancel`). Kryptographisch zufällig, gehasht in DB (ADR-0002). Klartext nur im Mail-Link.
_Avoid_: Admin-Token (das ist der Übersichts-Token), Magic-Link (Oberbegriff)

**Übersichts-Token**:
Pro-Workshop, wiederverwendbarer Token für die Admin-Übersichts-Seite (`/workshop/admin?token=…`). Gehasht in DB (ADR-0002). Höherwertig als Action-Tokens, daher nicht in denselben Mails wie Action-Tokens oder klar als „Daniel only" markiert.
_Avoid_: Admin-Token (zu unspezifisch), Session-Token

**Lead-Konversion**:
TrackMySales-Konversion bei Reservierung (Status `reserved`). Zeigt, welche Quelle Anmeldungen bringt. Reuse des scorecard-trackmysales-Clients.
_Avoid_: Signup, Opt-in

**Revenue-Konversion**:
TrackMySales-Konversion bei Buchung (Status `booked`, ausgelöst durch Action-Token-Klick). Inkludiert `amount` (99). Zeigt, welche Quelle Umsatz bringt.
_Avoid_: Sale, Purchase

**Pre-Work-Link**:
Public Download-Link auf das 30-Min-Worksheet, in der Buchungs-Bestätigung (Mail 4). Worksheet noch nicht gebaut (Vault: bis 2 Wochen vor Termin); Mail hat Platzhalter.
_Avoid_: Vorbereitungs-Material, Worksheet-Attachment

**Platz**:
Ein Ticket pro Unternehmen (bis 2 Personen: Entscheider + IT-Verantwortlicher). Kapazität Pilot = 5 Unternehmen. Nicht pro Person.
_Avoid_: Sitz, Ticket (generisch)

**Reservierung**:
Zustand nach DOI-Bestätigung. Der Platz ist angefragt, noch nicht gebucht.
_Avoid_: Anmeldung (mehrdeutig), Buchung

**Buchung**:
Zustand nach Zahlungseingang. Erst dann gilt der Platz als fix. TrackMySales-Konversion (Anmeldung + Revenue) feuert erst hier, nicht bei Reservierung.
_Avoid_: Bestätigung (mehrdeutig), Anmeldung

**Pre-Work**:
Das verpflichtende 30-Min-Arbeitsblatt, das mit der Buchungsbestätigung verschickt wird. Ohne Pre-Work keine eigene Rechnung im Termin. Zweiter Ernsthaftigkeits-Filter neben dem Preis.
_Avoid_: Vorbereitung (zu schwach), Hausaufgabe

**Aufzeichnung**:
Die Workshop-Aufnahme, ausschließlich zahlenden Teilnehmern zugänglich. Wird NUR auf der Landingpage erwähnt (nicht im Video, nicht im Newsletter), um den Live-Anreiz zu erhalten. Räumt auf der Landingpage den Terminkonflikt-Einwand aus.
_Avoid_: Recording, Mitschnitt

**Souveränitäts-Rechnung**:
Workshop-Artefakt 1: der wichtigste KI-Workload des Teilnehmers, durchgerechnet in Euro über die drei Wege (gehostete Open-Weights / Premium-Cloud / eigene Hardware). Eine Seite, vorstandstauglich.
_Avoid_: Kalkulation, Kostenrechnung

**Souveränitäts-Roadmap**:
Workshop-Artefakt 2: 90-Tage-Roadmap, pro Workload die Entscheidung (bleibt / wechselt / wird gemessen) plus drei Maßnahmen mit Verantwortlichem und Messpunkt.
_Avoid_: Aktionsplan, Maßnahmenplan

## Scorecard-Funnels

Lead-Magnet-Scorecards (Engpass-, KI-Führungs-, DSGVO-, Copilot-Rollout-Check) auf der generischen Scorecard-Engine.

## Language

**Scorecard**:
Ein Frage-Check mit sofort sichtbarem Ergebnis und E-Mail-Gate, der als Micro-Magnet zu einem Video gehört.
_Avoid_: Quiz, Umfrage, Assessment

**Dimension**:
Eine der Score-tragenden Kategorien eines Checks. Beim Copilot-Rollout-Check acht: vier im Block Einführung (Anbieter-Schalter, Training und Datennutzung, Berechtigungen, Lizenz und Zahlweise) und vier im Block Nutzung (Use-Case, Basislinie und Wert-Hypothese, Befähigung, Daten-Entscheid).
_Avoid_: Kategorie, Bereich

**Block**:
Die Gruppierung der Dimensionen im Copilot-Rollout-Check: Einführung (IT-Aufträge, aus Video #09) und Nutzung (Entscheider-Aufträge, aus Video #10).
_Avoid_: Teil, Sektion, Phase

**Band / Typ**:
Der Ergebnis-Bereich auf der internen 0-100-Skala mit sprechendem Namen (z. B. Blindflug, Rollout-ready). Der numerische Score bleibt produktweit unsichtbar.
_Avoid_: Level, Stufe (belegt, siehe unten), Score als Anzeigwert

**Auftrag**:
Ein kurzer, kopierbarer Arbeitsauftrag, genau einer pro Dimension. Im Block Einführung adressiert er die IT (weiterleitbar), im Block Nutzung den Entscheider selbst (Entscheider-Auftrag, nicht delegierbar).
_Avoid_: Maßnahme, To-do, Empfehlung

**Checkliste**:
Die Fundorte und Prüfpunkte unter einem Auftrag (exakte Klickpfade, Report-Namen, Beleg-Quellen). Lebt nur im gegateten Report.
_Avoid_: Anleitung, Tutorial

**Stufe**:
Eine der vier Modell-Stufen der Anbieter-Eskalations-Leiter in M365 Copilot: Microsoft-gehostete Modelle, Subprozessoren (Anthropic, OpenAI), Fremd-Anbieter (Mistral), Vorschau-Modelle mit Data Retention.
_Avoid_: Ebene, Tier, Anbieter (eine Stufe kann mehrere Anbieter enthalten)

**Beleg-Dokument**:
Das Ergebnis von Auftrag 2: pro aktivierter Stufe ein Absatz mit wörtlichem Zitat, Link, Doc-Stand und Prüfdatum.
_Avoid_: Bestätigung, Erklärung, Zertifikat

**Auftrags-Paket**:
Die Gate-Belohnung des Copilot-Rollout-Checks: die acht Aufträge mit Checklisten (vier IT, vier Entscheider), die Anbieter-Tabelle und die Quellen, als dauerhaft abrufbarer Report.
_Avoid_: Report (generisch), Whitepaper, Leadmagnet (das ist die Rolle, nicht das Artefakt)

**Anbieter-Tabelle**:
Die Kompaktfassung der Eskalations-Leiter fürs IT-Gespräch: vier Schalter, Rechtsstatus, Datengrenze, Default.
_Avoid_: Matrix, Vergleichstabelle

**qualifiziert**:
Ein Lead, dessen Rolle und Unternehmensgröße ins Beuteraster passen (Führungsrolle, 50 bis 2.000 Mitarbeitende). Rein intern, nie sichtbar.
_Avoid_: hot (das ist enger, siehe unten)

**hot**:
Ein qualifizierter Lead mit Programm-Potenzial, markiert nur als CleverReach-Tag, nie in der Engine. Zwei Ausprägungen: `rollout-hot` (Zustand A/B, Gesamt-Score maximal 50, der #09-Lead) und `nutzung-hot` (gekauft-kaum-genutzt und Nutzungs-Block maximal 6 von 12, der #10-Lead). Ein Lead kann beide tragen.
_Avoid_: Programm-Lead, Prio-Lead
