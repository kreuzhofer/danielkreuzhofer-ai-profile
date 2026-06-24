# Design: DSGVO-Check — dynamische Scorecard (Tool-Empfehlungs-Matrix)

**Datum:** 2026-06-24
**Status:** Entwurf – wartet auf Abnahme
**Repo:** `danielkreuzhofer-ai-profile` (Portfolio + Funnels)
**Slug:** `dsgvo-check`

## Problem / Kontext

Der statische Lead-Magnet „DSGVO & KI-Tools: Einordnung & Checkliste" (Vault
`05-knowledge/✅ DSGVO & KI-Tools …`, v2.0, Stand April 2026) ist inhaltlich stark,
aber **statisch**: ein PDF mit Anbieter-Tabelle, EU-AI-Act-Timeline und einer
14-Punkte-Checkliste, das jeder Empfänger identisch bekommt. Er beantwortet die
Kernfrage des Nutzers — **„darf und wie darf ich welches KI-Tool DSGVO-konform
einsetzen?"** — nur generisch.

Wir bauen daraus eine **dynamische Scorecard**: Mit ein paar Fragen bekommt der
Nutzer eine **klare, auf seine Lage zugeschnittene Empfehlung** — pro Tool eine
Ampel, eine Risikoeinordnung nach EU AI Act und einen priorisierten
Maßnahmenplan, „was er konkret tun muss".

Anders als der Engpass-Check und der KI-Führungs-Check (beide liefern **einen**
typologischen Outcome über eine Band-/Argmax-Regel) ist der DSGVO-Check eine
**Empfehlungs-Matrix**: Output ist nicht *ein* Typ, sondern eine pro-Tool-Bewertung
plus personalisierter Plan. Das ist der Punkt, an dem die Scorecard „etwas weniger
statisch und mehr dynamisch mit Custom-Code" wird — bewusst und isoliert.

## Leitprinzip

**Alles wiederverwenden, was die generische Scorecard-Engine hergibt
(Infrastruktur), Custom-Code nur dort, wo die Domäne es zwingend verlangt (Logik +
Rendering) — und dort sauber isoliert im Scorecard-eigenen Ordner.**

## Entscheidungen (aus dem Brainstorming, 2026-06-24)

1. **Ergebnis-Form: Hybrid** — Headline-Readiness-**Ampel** (Rot/Gelb/Grün) +
   pro-Tool-**Matrix** (Ampel + Bedingung + Upgrade-Pfad) + personalisierter
   **Maßnahmenplan**. Höchster Wert, am meisten Custom-Code.
2. **Tool-Erfassung: Tools (Mehrfachauswahl) + 1 globale Tier-Frage**
   (Free/privat · bezahlte Business/Enterprise · über Cloud Azure/AWS/Google ·
   gemischt/weiß nicht). Wenige Fragen, trotzdem personalisiert.
3. **Architektur: Approach A** — Custom-Resolver im Scorecard-Layer, Engine für die
   Infrastruktur. Engine bekommt nur kleine, additive, rückwärtskompatible Nähte.
4. **Value-Adds (alle vier):** (a) AVV/DPA-Direktlinks + Upgrade-Pfade;
   (b) AI-Act-Risiko-Ampel inkl. HR-Hochrisiko-Warnung; (c) Gated Reward:
   Muster-KI-Nutzungsrichtlinie + AVV-Checkliste + AI-Literacy-Schulungsplan;
   (d) Schatten-KI-Aufdecker + Tool-Update-Nurture **über den Newsletter** (kein
   individuelles Update-Versprechen pro Nutzer). Plus **Aktualitäts-/Rechtsstand-
   Badge** als Default.
5. **Fact-Check:** Daniel führt **Perplexity Deep Research** aus (Brief unten),
   liefert das Ergebnis; Claude verdrahtet es in `facts.ts` und reconciled den Plan
   gegen das Ergebnis. Architektur ist faktenunabhängig → läuft parallel zum Bau.
6. **Engpass-Check & KFC bleiben unangetastet.** Die neuen Engine-Nähte sind
   optional; bestehende Scorecards laufen unverändert.

## Funnel-Fragen (~8)

| # | Frage | Typ | Treibt |
|---|---|---|---|
| **C1** | Was beschreibt Deine Rolle? (GF/Inhaber · IT-Leitung · Datenschutz/Legal · Bereichsleitung · Team-Mitglied · Berater/Sonstiges) | single, **qualify** | Qualifizierung + Ansprache |
| **C2** | Unternehmensgröße (<10 · 10–49 · 50–250 · 250–1.000 · >1.000) | single | Personalisierung |
| **Q_TOOLS** | Welche KI-Tools nutzt oder plant ihr? (ChatGPT · MS Copilot · Claude · Gemini · Mistral/Le Chat · Aleph Alpha/Pharia · lokale Modelle · DeepSeek · andere · noch keine) | **multi** | Welche Zeilen in der Matrix |
| **Q_TIER** | In welcher Form überwiegend? (Free/privat · bezahlte Business/Enterprise · über Cloud Azure/AWS/Google · gemischt/weiß nicht) | single | Verdikt-Stufe je Tool |
| **Q_DATA** | Welche Daten gebt ihr ein? (keine personenbez. · interne, keine personenbez. · personenbez. von Kunden/MA · besondere Kategorien Art. 9) | single | Verschärft Verdikt + Pflichten |
| **Q_USECASE** | Wofür setzt ihr KI ein? (Produktivität/Texte · Doku-/Datenanalyse · Kundenservice-Bot · **HR/Bewerber/Scoring** · automatisierte Entscheidungen über Personen) | **multi** | AI-Act-Risikoklasse + HR-Flag |
| **Q_SHADOW** | Überblick, welche Tools eure Mitarbeitenden tatsächlich nutzen? (Ja, Richtlinie+Überblick · teilweise · nein, vermutlich privat · keine Ahnung) | single | Schatten-KI-Hook + Maßnahme |
| **Q_COMPLIANCE** | Was habt ihr schon umgesetzt? (AVV/DPA · AI-Literacy-Schulung · KI-Nutzungsrichtlinie · EU-Region/Opt-out · DSFA wo nötig · nichts davon) | **multi** | Maßnahmenplan = die *nicht* angekreuzten Punkte |

Elegant: **Q_COMPLIANCE invertiert = der priorisierte Maßnahmenplan**;
**Q_USECASE treibt die AI-Act-Risikoklasse** (HR-Falle feuert auch, wenn HR nur
Nebennutzung ist). Qualifizierung über C1 (Rolle), analog `requireQualifies` der
Engine.

## Architektur

### Neue Dateien — `frontend/src/scorecards/dsgvo-check/`

```
definition.ts   Engine-Definition (Fragen, Qualifizierung, attributePrefix "dsgvo_").
                Scoring/Outcome der Engine treiben die Ampel NICHT (die kommt aus
                recommend.ts). Da der Typ `ScorecardDefinition` `scoring`/`outcome`
                aber als Pflichtfelder führt, trägt die Definition ein triviales,
                gültiges Outcome (z.B. eine Single-Band 0–100) nur zur Typ-
                Erfüllung; die `resolve`-Naht supersedet es zur Laufzeit.
                (Optional-machen von scoring/outcome bei gesetztem resolve = späteres
                Aufräumen, nicht in diesem Scope.)
facts.ts        Single Source of Truth für volatile Daten. NUR diese Datei ändert
                der Fact-Check. Struktur s.u. Trägt RECHTSSTAND (Badge-Datum).
recommend.ts    Reine Funktion recommend(answers) -> DsgvoResult. Die Regel-Strecke.
                Kein IO, keine Zufälligkeit. Voll unit-testbar.
content.ts      Statische Copy (Überschriften, Ampel-Texte, Risikoklassen-Texte,
                Disclaimer „keine Rechtsberatung", Reward-Templates-Inhalte).
branding.ts     Brand-Tokens (Video-Brand-Kit-Palette, wie Engpass/KFC).
index.ts        ScorecardRegistration: definition + content + branding + meta +
                resolve + ResultView + ReportDoc + E-Mail-Subjects + cleverreachSource.
DsgvoResultView.tsx   Freie Ergebnisanzeige (Matrix-Teaser) — im ScorecardApp-Shell.
DsgvoReportDoc.tsx    Gated /report-Dokument (voller Plan + Links + Reward + Badge).
```

### `facts.ts` — Datenmodell (faktenunabhängig strukturiert)

```ts
// tiers ist eine OFFENE Map keyed by tier-id (free | business | cloud | …),
// damit ein vom Research aufgedeckter neuer Tier nur Daten + eine Antwortoption
// kostet, keinen Logik-Umbau.
export const TOOLS = {
  chatgpt: {
    label: "ChatGPT (OpenAI)", vendor: "OpenAI", country: "USA", isEU: false,
    tiers: {
      free:     { verdict: "rot",   reason, upgradePath, dpaUrl? },
      business: { verdict: "gruen", reason, dpaUrl },
      cloud:    { verdict: "gruen", reason: "Azure OpenAI EU-Region", dpaUrl },
    },
    source: { url, asOf: "2026-06" },
  },
  claude:   { /* api: "gelb" (SCCs) · cloud: "gruen" (Bedrock/Vertex) */ },
  deepseek: { override: { verdict: "rot", note: "China, kein Angemessenheitsbeschluss" } },
  local:    { override: { verdict: "gruen", note: "keine AVV nötig, hoher Aufwand" } },
  // …
} as const;

export const AI_ACT_TIMELINE = [ { date, item, status } /* Art.4, Art.5, GPAI, Hochrisiko III/I, Art.50 */ ];
export const DPF_STATUS = { valid: boolean, stable: boolean, note: string, asOf: "2026-06" };
// valid=true & stable=false (Juni 2026): DPF gilt, ist aber instabil (PCLOB ohne Quorum,
// FISA-702 auf 45-Tage-Verlängerung, Latombe-Berufung am CJEU). → bei !stable feuert die
// SCCs+TIA-Maßnahme für jedes US-Direkt-Tool, ohne die Verdikte hart auf rot zu zwingen.
export const RECHTSSTAND = "2026-06"; // treibt das Badge
```

### `recommend.ts` — Regel-Strecke

```ts
export interface ToolVerdict { toolId; label; verdict: "gruen"|"gelb"|"rot";
  reason; upgradePath?; dpaUrl?; caveat?; }  // caveat: zeitkritische Note, z.B. Aleph-Alpha/Cohere-Merger
export interface DsgvoResult {
  ampel: "rot"|"gelb"|"gruen";       // Headline-Readiness
  toolMatrix: ToolVerdict[];
  riskClass: "minimal"|"begrenzt"|"hoch";
  riskObligations: string[];
  actionPlan: { priority: number; title: string; detail: string }[];
  shadowAiFlag: boolean;
  usTransferFlag: boolean;            // mind. ein US-Tool ohne Cloud-EU-Region
  rechtsstand: string;
  qualified: boolean;
}

export function recommend(answers: Answers): DsgvoResult
```

Regeln:
- **toolMatrix** — je gewähltem Tool `facts.TOOLS[tool]`. Tier aus `Q_TIER`
  (gemischt/weiß nicht → Free→konform-Spanne mit Upgrade-Pfad zeigen; Tool ohne
  passenden Tier → bestes verfügbares Tier + Hinweis). **Overlays:**
  `Q_DATA ∈ {personenbez., Art.9}` + `tier=free` → erzwingt **rot**;
  `DPF_STATUS.valid=false` → US-Direkt-Tool min. **gelb**; `DPF_STATUS.stable=false`
  (aktueller Stand) → SCCs+TIA-Maßnahme bei US-Direkt-Tool, Verdikt bleibt;
  per-Tool-`override` (DeepSeek rot, local grün) schlägt alles.
- **riskClass** — aus `Q_USECASE`: HR/Scoring/automat. Entscheidungen → **hoch** +
  `riskObligations` (Risikomanagement, Doku, Human Oversight, Logs ≥6 Monate);
  Kundenservice-Bot → **begrenzt** (Transparenzpflicht Art. 50); sonst **minimal**.
- **actionPlan** — priorisiert: (1) harte Pflichtlücken aus invertiertem
  `Q_COMPLIANCE`, **AI-Literacy zuerst** (Pflicht seit 02/2025); (2) Upgrade-Schritte
  je rotem/gelbem Tool; (3) SCCs-/DPF-Hinweis bei `usTransferFlag`; (4) Schatten-KI-
  Maßnahme bei negativem `Q_SHADOW`.
- **ampel** — aus Tier-Fit, Datensensibilität, Schatten-KI-Überblick, Anzahl
  erledigter Compliance-Punkte → Rot/Gelb/Grün.

### Engine-Nähte (klein, additiv, rückwärtskompatibel)

Alle optional; Engpass/KFC laufen unverändert.

- **(a) Mehrfachauswahl:** `Question.kind: "multi"`; `Answers[id]: string | string[]`;
  Multi-Select-Rendering im Quiz-Schritt des `ScorecardApp`.
- **(b) Custom-Resolver:** `ScorecardRegistration.resolve?(answers) => unknown`.
  Wenn gesetzt, nutzen `ScorecardApp` **und** der Submit-Route diesen statt
  `buildResult`. Ergebnis wandert ins generische `result jsonb` — **keine
  Migration**.
- **(c) Custom-Views:** `ScorecardRegistration.ResultView?` + `ReportDoc?`. Wenn
  gesetzt, rendert `ScorecardApp` `ResultView` statt `ScorecardReportView`; die
  `/report`-Route rendert `ReportDoc` statt des generischen `ScorecardReportDoc`.
  Intro/Quiz-Shell, Fortschritt, sessionStorage, DOI-Funnel und der `/report`-
  Token-Gate bleiben wiederverwendet.

### Wiederverwendete Infrastruktur (unverändert)

DOI-Funnel · `scorecard_submissions`-Tabelle (`result jsonb`) · nodemailer/
Handlebars-Mails · CleverReach-Tags (`addConfirmedNewsletterLead({tags[], source})`)
· Rate-Limiter · Purge-Cron · Branding-Tokens · dynamische `[scorecardSlug]`-Route
· Quiz-State-Machine · Token-gated `/report`.

## Datenfluss

1. Nutzer beantwortet ~8 Fragen im `ScorecardApp` (multi-fähig). Antworten bleiben
   im Browser (keine Daten verlassen ihn bis zum Opt-in — DSGVO, wie Engpass/KFC).
2. `resolve = recommend(answers)` → `DsgvoResult`. **Freie Anzeige** über
   `DsgvoResultView`: Ampel-Headline + Tool-Matrix (Verdikt + Ein-Zeilen-Upgrade-
   Hinweis) + Risikoklasse + Top-3-Maßnahmen + Schatten-KI-Callout. Genug Wert zum
   Teilen, erzeugt Sog auf den vollen Plan.
3. **Opt-in** → `POST /api/scorecard/dsgvo-check/submit` rechnet `recommend()`
   server-seitig neu, persistiert `DsgvoResult` in `result jsonb`, startet DOI.
4. **DOI-Bestätigung** → Delivery-Mail mit Link auf den personalisierten
   `/dsgvo-check/report?token=`. CleverReach-Push mit Tags:
   `["dsgvo-check", "tool:chatgpt", …, "ampel:gelb", "risk:hoch"]` (Tool-Update-
   Nurture-Segment + Analytics).
5. **Gated `/report`** (`DsgvoReportDoc`, hell, print-optimiert): voller priorisierter
   Maßnahmenplan **mit AVV/DPA-Direktlinks + Upgrade-Pfaden**, AI-Act-Risikoklasse
   ausführlich, **Reward-Templates** (Muster-Richtlinie, AVV-Checkliste, Literacy-
   Plan), **Rechtsstand-Badge**, Quellen mit Datum, Disclaimer „keine
   Rechtsberatung", Booking-CTA für qualifizierte Leads, Hinweis „wir halten das
   aktuell — Neuerungen über den Newsletter".

**Frei vs. gated:** Matrix-*Verdikt* + Ein-Zeilen-Upgrade-Hinweis sind frei (Hook);
die umsetzbaren **DPA-Links, Schritt-für-Schritt-Upgrades und Templates** sind die
Opt-in-Belohnung.

## Fehlerbehandlung / Edge Cases

- **„noch keine Tools"** gewählt → Matrix leer, Fokus auf Readiness + Plan
  (AI-Literacy/Richtlinie zuerst); kein Crash.
- **Tool ohne Fakten-Eintrag** („andere") → generischer Hinweis „individuell prüfen",
  kein Verdikt erfunden (Fail-fast: `recommend` referenziert nur existierende Fakten;
  Invariante getestet).
- **CleverReach nicht konfiguriert** → freundlicher Fehler, Scorecard funktioniert
  voll (wie Engpass).
- **Ungültiger/fehlender Report-Token** → 404 (bestehender Gate).
- **Disclaimer** „ersetzt keine Rechtsberatung" in freier Anzeige **und** Report.

## Tests (TDD)

- `recommend.test.ts` (Kern): jede Tool×Tier-Kombi liefert valides Verdikt; HR-Use
  → immer `hoch`; Free + personenbez./Art.9 → rot; `DPF_STATUS.valid=false` → US-
  Direkt-Tools nicht grün; actionPlan = invertiertes Q_COMPLIANCE; DeepSeek immer rot;
  „noch keine Tools" ohne Crash. Invariante: jedes Verdikt referenziert einen
  existierenden Fakt; jede Maßnahme bildet eine reale Lücke ab.
- `facts.test.ts`: Datenintegrität — jeder Tool-Tier hat verdict+reason; jeder
  Eintrag hat Quelle+`asOf`; URLs wohlgeformt; `RECHTSSTAND` gesetzt.
- Engine: Multi-Select + `resolve`-Naht + Custom-View-Naht; Rückwärtskompat
  (Engpass/KFC-Tests bleiben grün).
- Submit/Confirm/E-Mail: bestehende Muster wiederverwenden (Slug `dsgvo-check`).
- `fast-check` nur für `recommend`/Invarianten (numRuns: 3); sonst beispielbasiert.

## Perplexity Deep Research Brief (Daniels Schritt)

Der folgende Prompt ist so geschrieben, dass er **direkt in Perplexity Deep
Research kopiert** werden kann. Alles zwischen den Markierungen ist der Prompt.

--- BEGINN PROMPT ---

Du bist Rechercheur für Datenschutz- und KI-Compliance. Erstelle eine aktuelle,
belastbare Bestandsaufnahme zur DSGVO- und EU-AI-Act-Konformität gängiger KI-Tools
bei der Nutzung in deutschen bzw. EU-Unternehmen.

**Rahmenbedingungen für die gesamte Recherche:**

- Beziehe dich auf den Rechts- und Produktstand im **Juni 2026**.
- Belege jede zentrale Aussage mit einer **Quelle (URL)** und dem
  **Veröffentlichungs- oder Abrufdatum**.
- Bevorzuge **Primärquellen**: offizielle Anbieterdokumentation (Trust Center,
  DPA-/Datenschutzseiten), EUR-Lex, Europäische Kommission, Europäischer
  Datenschutzausschuss (EDPB), deutsche Datenschutzkonferenz (DSK) und
  Aufsichtsbehörden. Fachartikel oder Kanzlei-Blogs nur ergänzend.
- Hebe **jede Änderung seit April 2026 ausdrücklich hervor**.
- Wenn eine Information unklar, strittig oder nicht belastbar ist, sage das offen,
  statt zu schätzen.

**Teil 1 — Anbieter-Vergleich**

Erstelle eine Tabelle. Bewerte jede der unten genannten Nutzungsstufen in einer
eigenen Zeile. Verwende diese Spalten:

1. Anbieter / Modell
2. Nutzungsstufe
3. EU-Datenverarbeitung (ja / nein / wählbare Region)
4. Training mit den Eingaben deaktivierbar (ja / nein)
5. AVV / DPA verfügbar (ja / nein)
6. Drittlandtransfer (ja / nein — und über welchen Mechanismus, z. B. DPF, SCCs)
7. Verdikt für die Unternehmensnutzung (grün / gelb / rot)
8. Begründung in einem Satz
9. Quelle (URL)
10. Stand (Datum)

Bitte decke diese Anbieter und Stufen ab:

- **OpenAI ChatGPT:** (a) Free / Plus, (b) Team / Enterprise / Edu / API,
  (c) über den Azure OpenAI Service (EU-Region). Prüfe insbesondere den Status der
  EU-Datenresidenz und der EU-Inferenz.
- **Anthropic Claude:** (a) Free / Pro, (b) API direkt, (c) über AWS Bedrock
  (Region Frankfurt, eu-central-1), (d) über Google Vertex AI. Prüfe, ob der DPA
  inzwischen fester Bestandteil der Commercial Terms ist und ob EU-Inferenz
  verfügbar ist.
- **Google Gemini:** (a) Consumer-Version, (b) über Vertex AI (EU-Region),
  (c) innerhalb von Google Workspace.
- **Microsoft Copilot:** (a) Microsoft 365 Copilot (Business), (b) Copilot in der
  kostenlosen / Consumer-Variante. Prüfe die EU Data Boundary.
- **Mistral / Le Chat:** (a) Le Chat Pro, (b) API. Prüfe, ob bei der
  Cloud-Anbindung (z. B. über GCP) ein US-Routing auftreten kann.
- **Aleph Alpha / PhariaAI (Deutschland):** aktueller Stand nach dem Pivot zur
  souveränen KI-Plattform.
- **DeepSeek:** aktueller regulatorischer Status in der EU (Verbote, behördliche
  Maßnahmen, Bedenken).
- **Lokale Modelle (Ollama, vLLM, llama.cpp):** datenschutzrechtliche Einordnung.

**Teil 2 — EU AI Act: Zeitplan und aktueller Stand**

Erstelle eine Tabelle mit den Spalten: Pflicht / Regelung, anwendbar ab,
aktueller Status. Decke mindestens ab:

- Verbotene Praktiken (Art. 5)
- AI-Literacy-Pflicht (Art. 4) — seit Februar 2025
- Pflichten für General-Purpose-AI-Modelle (GPAI) — seit August 2025
- Pflichten für Hochrisiko-KI-Systeme — ursprünglich ab August 2026. Recherchiere
  ausdrücklich, **was der Digital Omnibus Act (März 2026) daran geändert hat**:
  Wie ist der Stand der Trilog-Verhandlungen? Wurden die Fristen verschoben
  (z. B. auf Dezember 2027 bzw. August 2028)?
- Transparenzpflicht (Art. 50)

**Teil 3 — EU-US Data Privacy Framework**

Ist das EU-US Data Privacy Framework im Juni 2026 noch in Kraft? Recherchiere
insbesondere:

- Den aktuellen Status des US-amerikanischen Privacy and Civil Liberties Oversight
  Board (PCLOB). Anfang 2025 wurden drei Mitglieder entlassen — ist die
  Beschlussfähigkeit inzwischen wiederhergestellt?
- Neue Klagen oder Urteile (etwa eine Berufung im Verfahren Latombe).
- Aktuelle Stellungnahmen von EDPB oder Europäischer Kommission.

Leite daraus eine praktische Empfehlung ab, ob sich Unternehmen allein auf das DPF
verlassen können oder zusätzlich Standardvertragsklauseln (SCCs) vereinbaren
sollten.

**Teil 4 — Orientierungshilfen der Datenschutzkonferenz (DSK)**

Gibt es seit Oktober 2025 neue oder aktualisierte Versionen der DSK-
Orientierungshilfen (KI und Datenschutz, technische und organisatorische Maßnahmen
bei KI, RAG)? Gibt es weitere relevante DSK-Veröffentlichungen aus 2026?

**Ausgabeformat**

- Teil 1 und Teil 2 als Markdown-Tabellen.
- Teil 3 und Teil 4 als kurze, klar gegliederte Absätze mit Quellenangaben.
- Schließe mit einer Liste **„Was hat sich seit April 2026 geändert?"**, die die
  wichtigsten Veränderungen zusammenfasst.

--- ENDE PROMPT ---

**Reconcile nach Lieferung (Claudes Schritt):** Nach Erhalt des Ergebnisses prüft
Claude, dass jedes `toolMatrix`-Verdikt einen noch existierenden Fakt referenziert,
der `DPF_STATUS`-Toggle korrekt gesetzt ist, die AI-Act-Daten stimmen, kein Tool
einen Tier außerhalb der offenen Map benötigt, und überträgt die „Was hat sich
geändert"-Liste in Verdikt-Anpassungen und das Rechtsstand-Badge.

## Reconciliation mit dem Fact-Check (2026-06-24)

Perplexity Deep Research geliefert; Quelle: `vault/04-content/video/07-5-hebel-mit-
denen-du-ki-fuehrst/DSGVO- und EU-AI-Act-Konformität gängiger KI-Tools – Bestands-
aufnahme Juni 2026.md` (zitiert mit Primärquellen + Datum). **Ergebnis: Architektur
unverändert** — jeder Fund landet in `facts.ts`-Daten oder einer kleinen Logik-
Verfeinerung. Kein struktureller Umbau.

**Bestätigt:** 3-Farben-Verdikt; per-Tool-per-Tier-Modell (gleicher globaler Tier →
unterschiedliche Verdikte je Tool: ChatGPT Enterprise 🟢, Claude API-direkt 🟡,
Gemini Workspace 🟢, **Copilot Business 🟡**); HR = Annex-III-Hochrisiko;
DeepSeek 🔴 / lokal 🟢 als Overrides; offene Tier-Map (Claude hat zwei grüne
Cloud-Tiers: Bedrock + Vertex).

**Verfeinerungen (nur Daten/Logik):**
- **DPF „gültig aber instabil"** → `DPF_STATUS.stable=false`; SCCs+TIA-Maßnahme feuert
  bei jedem US-Direkt-Tool (PCLOB ohne Quorum, FISA-702 45-Tage-Verlängerung,
  Latombe-Berufung C-703/25 P am CJEU ohne Termin).
- **MS Copilot „Flex Routing"** (Default-on seit 17.04.2026) → Business-Tier 🟡,
  Upgrade-Pfad „Flex Routing im M365 Admin Center deaktivieren" + Hinweis Anthropic-
  Subprozessor außerhalb der EU Data Boundary. Starker Aha-Moment für den
  Mittelstand → eigener Callout im Report.
- **Aleph Alpha 🟢 mit Cohere-Übernahme-Caveat** (24.04.2026, unter Genehmigungs-
  vorbehalt) → `ToolVerdict.caveat`. Untermauert das „wir halten das aktuell"-
  Newsletter-Versprechen.
- **AI-Act-Timeline** (Digital Omnibus, Parlament 16.06.2026, Ratifikation ~Juli
  2026 ausstehend): Annex III → 2.12.2027, Annex I → 2.8.2028, Art. 50 Basis bleibt
  2.8.2026 / Wasserzeichen → 2.12.2026, Sandkästen → 2.8.2027. `status`-Feld trägt
  „verschoben, noch nicht rechtsverbindlich".
- **Anthropic Consumer Training-Opt-in** (seit 08.10.2025) → verschärft den
  Schatten-KI-Hook (private Claude-Accounts = Training-Opt-in).

**Für Daniels Sign-off markiert:** Art.-4-Bußgeld — Research nennt **15 Mio. €/3%**,
die alte statische Checkliste nannte 7,5 Mio. €/1,5%. Die Zuordnung zur Bußgeldstufe
ist juristisch strittig; im Tool 15M/3% mit Quelle, finale Formulierung bei Daniel.

## Bewusst NICHT im Scope (YAGNI)

- Keine generische Rules-DSL in der Engine (Approach B verworfen). `recommend.ts`
  bleibt Scorecard-spezifisch, bis eine zweite Rules-Scorecard konkret ansteht.
- Keine Engpass-Migration. Keine DB-Schema-Änderung (jsonb reicht).
- Kein per-Nutzer-Update-Versprechen (Aktualität läuft über den Newsletter).
- Keine Rechtsberatung — Disclaimer statt verbindlicher Aussagen.

## Offene Punkte / Daniels Aufgaben

- ✅ Perplexity-Research geliefert + reconciled (2026-06-24, s. Abschnitt
  „Reconciliation"). Verdrahtung in `facts.ts` erfolgt in der Implementierung.
- Reward-Templates (Muster-Richtlinie, AVV-Checkliste, Literacy-Plan) inhaltlich
  freigeben (Content-Arbeit).
- Go-live wie KFC: Migration ist schon da; CleverReach-Segment `dsgvo-check` +
  Tool-Tags anlegen; Datenschutz-Hinweis-Parität; Video-/Booking-URLs setzen.
- Rechts-Sign-off (Disclaimer, Verdikt-Formulierungen).
