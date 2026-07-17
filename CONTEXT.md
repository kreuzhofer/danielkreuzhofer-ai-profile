# Scorecard-Funnels (danielkreuzhofer.de)

Lead-Magnet-Scorecards (Engpass-, KI-Führungs-, DSGVO-, Copilot-Rollout-Check) auf der generischen Scorecard-Engine. Dieses Glossar hält die Fachsprache fest, die in Specs (Vault), Content und Code identisch verwendet wird.

## Language

**Scorecard**:
Ein Frage-Check mit sofort sichtbarem Ergebnis und E-Mail-Gate, der als Micro-Magnet zu einem Video gehört.
_Avoid_: Quiz, Umfrage, Assessment

**Dimension**:
Eine der Score-tragenden Kategorien eines Checks (beim Copilot-Rollout-Check: Anbieter-Schalter, Training und Datennutzung, Berechtigungen, Lizenz und Zahlweise).
_Avoid_: Kategorie, Bereich

**Band / Typ**:
Der Ergebnis-Bereich auf der internen 0-100-Skala mit sprechendem Namen (z. B. Blindflug, Rollout-ready). Der numerische Score bleibt produktweit unsichtbar.
_Avoid_: Level, Stufe (belegt, siehe unten), Score als Anzeigwert

**Auftrag**:
Ein kurzer, kopierbarer Arbeitsauftrag an die IT, den der Lead unverändert weiterleiten kann. Genau einer pro Dimension.
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
Die Gate-Belohnung des Copilot-Rollout-Checks: die vier Aufträge mit Checklisten, die Anbieter-Tabelle und die Quellen, als dauerhaft abrufbarer Report.
_Avoid_: Report (generisch), Whitepaper, Leadmagnet (das ist die Rolle, nicht das Artefakt)

**Anbieter-Tabelle**:
Die Kompaktfassung der Eskalations-Leiter fürs IT-Gespräch: vier Schalter, Rechtsstatus, Datengrenze, Default.
_Avoid_: Matrix, Vergleichstabelle

**qualifiziert**:
Ein Lead, dessen Rolle und Unternehmensgröße ins Beuteraster passen (Führungsrolle, 50 bis 2.000 Mitarbeitende). Rein intern, nie sichtbar.
_Avoid_: hot (das ist enger, siehe unten)

**hot**:
Ein qualifizierter Lead in Zustand A/B (Rollout geplant oder Lizenzen kaum genutzt) mit niedrigem Score. Existiert nur als CleverReach-Tag (`rollout-hot`), nicht in der Engine.
_Avoid_: Programm-Lead, Prio-Lead
