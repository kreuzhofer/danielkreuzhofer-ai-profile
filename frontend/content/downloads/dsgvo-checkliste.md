---
title: "DSGVO & KI-Tools: Einordnung & Checkliste für Unternehmen"
description: "Einordnung und Compliance-Checkliste zur DSGVO-konformen Nutzung von KI-Tools im Unternehmen (Stand April 2026)."
version: "2.0"
date: "2026-04-16"
---

# DSGVO & KI-Tools: Einordnung & Checkliste für Unternehmen

*Stand: April 2026 | Erstellt von Daniel Kreuzhofer*

Immer mehr Unternehmen setzen auf KI-Tools wie ChatGPT, Claude oder Gemini. Doch viele sind unsicher: **Dürfen wir diese Tools überhaupt rechtssicher nutzen?** Und wenn ja: **unter welchen Bedingungen?**

Dieses Dokument hilft Dir, die wichtigsten Anforderungen der DSGVO und des neuen EU AI Acts zu verstehen und die Risiken im Umgang mit KI-Systemen realistisch einzuschätzen.

---

## 1. Was die DSGVO zur Nutzung von KI sagt

Die DSGVO **verbietet** die Nutzung von KI-Tools **nicht**. Sie verlangt aber:

- **Rechtsgrundlage** (Art. 6 DSGVO): Jede Verarbeitung personenbezogener Daten braucht eine rechtliche Basis (z.B. Einwilligung, Vertrag, berechtigtes Interesse).
- **Zweckbindung**: Daten dürfen nur für festgelegte Zwecke verarbeitet werden.
- **Transparenz**: Nutzer und Betroffene müssen über Art, Zweck und Umfang der Verarbeitung informiert werden.
- **Datensicherheit** (Art. 32): Technische und organisatorische Schutzmaßnahmen sind Pflicht.
- **Auftragsverarbeitung** (Art. 28): Externe KI-Dienste gelten als Auftragsverarbeiter. Du brauchst einen **Auftragsverarbeitungsvertrag (AVV / DPA)** mit klarer Regelung der Datenverarbeitung.

Die **DSK (Datenschutzkonferenz)** hat dazu drei Orientierungshilfen veröffentlicht:
- **KI und Datenschutz** (Mai 2024): Checkliste für Auswahl, Implementierung und Nutzung von KI/LLMs
- **TOM bei KI-Systemen** (Juni 2025): Technische und organisatorische Maßnahmen über 4 Lebenszyklus-Phasen
- **RAG-spezifisch** (Oktober 2025): Datenschutz bei Retrieval-Augmented Generation (eigene Dokumente in KI einbinden)

---

## 2. EU AI Act: Was seit 2025 zusätzlich gilt

Der EU AI Act ist am 01.08.2024 in Kraft getreten und wird schrittweise anwendbar:

### Bereits aktiv (seit Februar 2025)

- **Verbotene KI-Praktiken** (Art. 5): Social Scoring, manipulative Systeme, biometrische Echtzeit-Überwachung im öffentlichen Raum
- **AI-Literacy-Pflicht** (Art. 4): Unternehmen müssen sicherstellen, dass **alle Mitarbeitenden, die KI nutzen, ausreichend geschult sind**. Das gilt für jedes Unternehmen, egal ob Du KI selbst entwickelst oder nur einsetzt. Strafe bei Verstoß: bis 7,5 Mio. EUR oder 1,5% des Jahresumsatzes.

### Seit August 2025

- **GPAI-Pflichten**: Regeln für General-Purpose AI Modelle (betrifft die Anbieter wie OpenAI, Anthropic, Google, nicht Dich als Nutzer)

### Ab August 2026 (teilweise verschoben)

- **Hochrisiko-KI-Systeme**: Strenge Pflichten für KI in Bereichen wie HR-Screening, Kreditvergabe, Strafverfolgung. **Achtung:** Durch den Digital Omnibus Act (März 2026) werden diese Fristen voraussichtlich auf Dezember 2027 bzw. August 2028 verschoben. Trilog-Verhandlungen laufen.
- **Transparenzpflicht** (Art. 50): Nutzer und Kunden müssen informiert werden, wenn sie mit KI interagieren.

### Was bedeutet das für Dich als Unternehmen?

| Risikokategorie | Beispiele | Pflichten |
|---|---|---|
| **Minimales Risiko** | Chatbots für interne Recherche, Textgenerierung, Zusammenfassungen | Keine spezifischen Pflichten (aber DSGVO gilt) |
| **Begrenztes Risiko** | Kundenservice-Chatbots | Transparenzpflicht: Kunden informieren, dass sie mit KI sprechen |
| **Hochrisiko** | HR-Screening, automatisierte Bewerberbewertung, Kreditscoring | Strenge Pflichten: Risikomanagement, Dokumentation, Human Oversight, Logs min. 6 Monate |

Die meisten typischen KI-Einsätze im Mittelstand (E-Mails, Texte, Recherche, Dokumentenanalyse) fallen in die Kategorie "minimales Risiko". **Aber: wenn Du KI im HR-Bereich für Bewerberauswahl einsetzt, bist Du im Hochrisiko-Bereich.**

---

## 3. Datenübermittlung ins Ausland: EU-US Data Privacy Framework

Sobald personenbezogene Daten in ein **Drittland außerhalb der EU/EWR** übertragen werden (z.B. USA), musst Du sicherstellen, dass eine rechtliche Grundlage besteht:

- **Angemessenheitsbeschluss**: z.B. für USA (EU-US Data Privacy Framework, seit Juli 2023), UK, Schweiz
- **Standardvertragsklauseln (SCCs)**: vertragliche Absicherung mit dem Anbieter
- **Einwilligung** der Betroffenen (im Unternehmenskontext selten praktikabel)

### Achtung: Das DPF wackelt (Stand April 2026)

Das EU-US Data Privacy Framework ist formal noch gültig. Das EuG hat im September 2025 eine Nichtigkeitsklage abgewiesen. **Aber:** Im Januar 2025 wurden drei Mitglieder des US-amerikanischen Privacy and Civil Liberties Oversight Board (PCLOB) entlassen. Das PCLOB ist damit nicht mehr beschlussfähig, obwohl es eine zentrale Säule des DPF-Schutzmechanismus ist.

**Praktische Empfehlung:** Verlasse Dich nicht ausschließlich auf das DPF. Vereinbare zusätzlich SCCs mit US-Anbietern und bevorzuge EU-Datenverarbeitung, wo möglich.

---

## 4. DSGVO-Check: KI-Anbieter im Vergleich (April 2026)

| Anbieter / Modell | EU-Datenverarbeitung | Training deaktivierbar | AVV / DPA | DSGVO-konform nutzbar? |
|---|---|---|---|---|
| **ChatGPT Free/Plus** (openai.com) | Nein (USA) | Aktiver Opt-out nötig | Nicht verfügbar | Für Unternehmen nicht geeignet |
| **ChatGPT Enterprise/Edu/API** (openai.com) | Ja (EU Data Residency seit Feb. 2025, EU-Inferenz seit Jan. 2026) | Ja (kein Training) | Ja (DPA) | Ja |
| **ChatGPT via Azure OpenAI** | Ja (EU-Region wählbar) | Ja (kein Training) | Ja (Microsoft DPA) | Ja |
| **Claude** (anthropic.com, API direkt) | Nur US/Global Inferenz | Ja (Commercial: kein Training) | Ja (DPA seit Jan. 2026) | Nur mit SCCs und Risikoabwägung |
| **Claude via AWS Bedrock** | Ja (Frankfurt eu-central-1 und 5 weitere EU-Regionen) | Ja (kein Training) | Ja (AWS DPA) | Ja |
| **Claude via Google Vertex AI** | Ja (10 EU-Regionen) | Ja (kein Training) | Ja (Google DPA) | Ja |
| **Gemini via Google Vertex AI** | Ja (EU-Region wählbar) | Ja (kein Training) | Ja (Google DPA, umfangreiche Zertifizierungen) | Ja |
| **Mistral** (mistral.ai) | Ja (Sitz Paris, EU-nativ) | Ja (Le Chat Pro: kein Training) | Ja (DPA) | Ja (GCP-Erweiterung prüfen: US-Routing aktiv vermeiden) |
| **Aleph Alpha / PhariaAI** (Deutschland) | Ja (Deutschland) | Ja (kein Training) | Ja | Ja (strategischer Pivot zu souveräner KI-Plattform, Fokus Public Sector) |
| **Lokale Modelle** (Ollama, vLLM, llama.cpp) | Vollständig lokal | Vollständig steuerbar | Nicht erforderlich | Ja (maximale Datensouveränität, hoher technischer Aufwand) |

**Wichtig:** DeepSeek (China) ist für regulierte EU-Unternehmen **nicht empfohlen** (Datentransfer nach China, kein Angemessenheitsbeschluss).

---

## 5. Warum kostenlose KI-Tools für Unternehmen problematisch sind

Viele KI-Tools in der kostenlosen Nutzung (z.B. ChatGPT Free, Claude Free) speichern Eingaben und nutzen sie zur **Modellverbesserung**. Das ist im Unternehmenskontext **nicht zulässig**, wenn dabei personenbezogene oder vertrauliche Daten verarbeitet werden.

Nutze daher **Business- oder Enterprise-Versionen** mit:
- AVV/DPA
- EU-Datenverarbeitung
- Deaktiviertem Training
- Dokumentierter Compliance

---

## 6. Drei Wege zur DSGVO-konformen KI-Nutzung

**1. Managed Cloud-Services mit EU-Region**

z.B. ChatGPT Enterprise, Claude via AWS Bedrock (Frankfurt), Gemini via Vertex AI

Mit: EU-Datenverarbeitung, DPA, kein Training, umfangreiche Compliance-Dokumentation

**2. Europäische Anbieter**

z.B. Mistral (Paris), PhariaAI/Aleph Alpha (Deutschland), LightOn (Frankreich)

Keine Drittlandverarbeitung, transparente Datenschutzrichtlinien

**3. Eigene KI-Systeme hosten (On-Premises)**

z.B. Ollama, vLLM, llama.cpp mit Open-Source-Modellen (LLaMA, Mistral, Mixtral)

Maximale Kontrolle und Datensouveränität, aber deutlich mehr technischer Aufwand und eigene Hardware

---

## 7. Deine Compliance-Checkliste (zum Ausfüllen)

### DSGVO-Grundlagen

- [ ] **KI-Inventar erstellt:** Alle genutzten KI-Systeme erfasst und dokumentiert
- [ ] **Rechtsgrundlage geprüft** (Art. 6 DSGVO): Für jeden KI-Use-Case festgelegt (berechtigtes Interesse, Vertrag, Einwilligung)
- [ ] **DSFA durchgeführt** (Art. 35 DSGVO): Datenschutz-Folgenabschätzung für KI-Systeme, die personenbezogene Daten verarbeiten
- [ ] **AVV/DPA abgeschlossen** (Art. 28 DSGVO): Mit jedem KI-Anbieter
- [ ] **EU-Datenverarbeitung aktiviert:** EU-Regionen gewählt, wo möglich
- [ ] **Training-Opt-out sichergestellt:** Vertraglich und technisch geprüft
- [ ] **DPF nicht als einzige Grundlage:** Zusätzlich SCCs für US-Anbieter vereinbart

### EU AI Act (neu)

- [ ] **AI-Literacy-Schulung durchgeführt:** Alle Mitarbeitenden, die KI nutzen, sind geschult (Art. 4, seit Feb. 2025 Pflicht)
- [ ] **Risikokategorie bestimmt:** Für jeden KI-Einsatz die Risikokategorie zugeordnet (minimal, begrenzt, hoch)
- [ ] **Transparenzpflicht vorbereitet:** Plan, wie Kunden/Nutzer informiert werden, wenn sie mit KI interagieren (Art. 50, ab Aug. 2026)
- [ ] **HR-KI geprüft:** Falls KI im Bewerbungsprozess eingesetzt wird: Hochrisiko-Pflichten beachten

### Organisatorisch

- [ ] **KI-Nutzungsrichtlinie erstellt:** Interne Policy: welche Tools erlaubt sind, welche Daten eingegeben werden dürfen, wer verantwortlich ist
- [ ] **Mitarbeitende sensibilisiert:** Schulung zu Datenschutz im Umgang mit KI
- [ ] **Logging eingerichtet:** Für Hochrisiko-Systeme: Logs mind. 6 Monate aufbewahren, Human Oversight sicherstellen

---

## 8. Quellen und weiterführende Links

- **EU AI Act Volltext und Timeline:** [artificialintelligenceact.eu](https://artificialintelligenceact.eu)
- **DSK Orientierungshilfe KI und Datenschutz (Mai 2024):** [datenschutzkonferenz-online.de](https://datenschutzkonferenz-online.de)
- **DSK Orientierungshilfe TOM bei KI (Juni 2025):** [datenschutzkonferenz-online.de](https://datenschutzkonferenz-online.de)
- **DSK Orientierungshilfe RAG (Oktober 2025):** [datenschutzkonferenz-online.de](https://datenschutzkonferenz-online.de)
- **EU-US Data Privacy Framework:** [data-privacy-framework.com](https://data-privacy-framework.com)
- **OpenAI EU Data Residency:** [openai.com/index/introducing-data-residency-in-europe](https://openai.com/index/introducing-data-residency-in-europe)
- **Anthropic DPA / Commercial Terms:** [anthropic.com](https://anthropic.com) (automatisch Teil der Commercial Terms seit 01.01.2026)

---

## 9. Noch Fragen?

Wenn Du Klarheit willst, wie Du KI-Tools rechtssicher und sinnvoll einsetzt, schau Dir meine weiteren Videos auf meinem YouTube-Kanal an: [youtube.com/@DanielKreuzhofer](https://www.youtube.com/@DanielKreuzhofer)

Oder schreib mir einen Kommentar unter dem Video.

---

**Version 2.0** | Stand: April 2026

**Erstellt von:** Daniel Kreuzhofer | KI-Coaching mit Kante

*Dieses Dokument ersetzt die Version vom Dezember 2025. Wesentliche Änderungen: EU AI Act (Art. 4 AI-Literacy, Risikokategorien, Deployer-Pflichten), aktualisierte Anbieter-Tabelle (OpenAI EU Residency, Claude Bedrock/Vertex, Mistral Update, Aleph Alpha Pivot), DPF-Risikowarnung (PCLOB-Krise), DSK-Orientierungshilfen 2025, erweiterte Checkliste.*
