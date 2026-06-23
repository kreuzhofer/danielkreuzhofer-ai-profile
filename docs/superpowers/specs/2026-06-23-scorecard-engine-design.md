# Design: Generische Scorecard-Engine (config-getrieben, im Portfolio-Repo)

**Datum:** 2026-06-23
**Status:** Entwurf – wartet auf Abnahme
**Repo:** `danielkreuzhofer-ai-profile` (Portfolio + Funnels)

## Problem / Kontext

Der Engpass-Check (#05) ist die erste interaktive Scorecard als Lead-Magnet. Mit
dem KI-Führungs-Check (#06, Spec: vault `funnels/ki-fuehrungs-check/06-quiz-spec.md`)
steht die zweite an, und „mehr in ähnlicher Form" sind absehbar. Jede Scorecard
teilt dieselbe Mechanik: Fragen → client-seitiges Scoring → frei sichtbares
Ergebnis → Opt-in fürs Toolkit → DOI → Zusammenfassungs-Mail → CleverReach-Sync.

Statt jede Scorecard wie den Engpass-Check **bespoke** zu bauen, zentralisieren wir
das Basis-Framework (Persistenz, E-Mail, Registrierung/DOI, Scoring-Form) **einmal**
und bauen neue Scorecards **config-getrieben**: eine Scorecard = Definition + Inhalt
als Code im Repo, Deploy via Git.

## Recherche-Erkenntnis (ScoreApp & Co.)

ScoreApp, Outgrow, Interact, involve.me, Pointerpro teilen alle dasselbe schlanke
Modell: Antworten tragen **Punkte** (optional in **Kategorien**); Summe →
normalisiert; **Outcome** über **eine** simple Regel — Score-**Band** *oder*
**Kategorie-Argmax** (Persönlichkeits-Typ); plus Ergebnisseite, Lead-Capture,
CRM-Integration, Branding. Bespoke-Regelbäume sind die Ausnahme, nicht die Norm.

→ **Unser Engpass-Check war der komplexe Ausreißer** (Dimension-Argmax-Typ *und*
Weg-Baum *und* Tie-Breaks). KFC und die meisten künftigen Scorecards passen ins
schlanke Modell. Die Engine zielt aufs schlanke Modell; der Engpass-Check bleibt
der Sonderfall, der er ist.

## Entscheidungen (aus dem Brainstorming)

1. **Im bestehenden Repo**, vorhandene Infra weiternutzen (gleiche Domain
   `danielkreuzhofer.de`, gleiche DB/Mail/CleverReach/Tests). Kein neues Repo.
2. **Engpass-Check bleibt unangetastet** (bespoke Code-Pfad). Die generische Engine
   bedient nur die schlanken Scorecards, **KFC zuerst**. Engpass-Migration: später,
   wenn überhaupt — *nicht* in diesem Vorhaben.
3. **Code-first, repo-getrieben, Deploy via Git.** Scorecard-Definitionen sind
   typsichere TS-Configs im Repo, **kein** Runtime-Admin-API/Builder-UI in v1.
4. **Scoring schlank (ScoreApp-Modell):** Punkte je Antwort, optionale Kategorien;
   Outcome via **Presets `bands` | `argmax`**. Resolver **pluggable**
   (`outcome.type`), `rules` (Formeln, JSONLogic-Stil) ist eine spätere *Ergänzung
   an derselben Stelle* — **kein** Code-Escape-Hatch, **nicht** in v1.
5. **Persistenz generisch:** neue Tabelle `scorecard_submissions` mit `result jsonb`
   (scorecard-spezifische Ergebnisdaten im JSON), Engpass-`submissions`-Tabelle
   bleibt unberührt.
6. **Routing dynamisch:** `app/[scorecardSlug]/page.tsx` mit `generateStaticParams`
   aus dem Registry — nur registrierte Slugs werden zu Seiten.

## Leitprinzip (gegen Über-Engineering)

Wir bauen **keine spekulative „beliebige Scorecard"-Plattform**, sondern **genau die
Engine, die KFC braucht**, mit sauberen Nähten. KFC ist die Forcing-Function; die
*nächste* Scorecard treibt weitere Generalisierung. (CLAUDE.md §4 YAGNI, §5 DRY mit
Augenmaß.)

## Architektur

```
frontend/src/lib/scorecard/            ← generische Engine (pure, TDD)
  types.ts          ScorecardDefinition, Question, Scoring/Outcome/Content, Result
  scoring.ts        Punkte → Kategorie-Scores → normalisieren            [pure]
  outcome.ts        Resolver: { type: "bands" | "argmax" }, pluggable    [pure]
  qualification.ts  generische qualifies-Logik (AND über Frage-Flags)    [pure]
  next-lever.ts     schwächste/stärkste Kategorie (optional)             [pure]
  result.ts         baut ScorecardResult (→ result jsonb)                [pure]
  registry.ts       lädt Definitionen aus src/scorecards/* (slug-keyed)

frontend/src/scorecards/ki-fuehrungs-check/
  definition.ts     Fragen, Scoring, Outcome, qualification, attributePrefix
  content.ts        Content-Blöcke je Outcome + Personalisierung + Quellen + Toolkit
  branding.ts       Color-Tokens (video-brand-kit §4)
  index.ts          export const definition = { ...definition, content, branding }

frontend/src/components/scorecard/      ← generischer Renderer (config-getrieben)
  ScorecardApp.tsx  Intro → Fragen-UI → Result-Screen → Opt-in
  ResultScreen.tsx  rendert Content-Blöcke des Outcomes
  (Branding via CSS-Variablen aus branding tokens)

frontend/src/app/[scorecardSlug]/page.tsx          generischer Einstieg
frontend/src/app/api/scorecard/[slug]/submit/route.ts   POST: persist + DOI-Mail
frontend/src/app/api/scorecard/confirm/route.ts         GET/POST by token: delivery + CleverReach
```

Engine = reine Domänenlogik (referenziell transparent, wie `engpass-check/scoring.ts`).
Renderer + API-Routen sind dünn und lesen die Definition aus dem Registry.

## Datenmodell

### ScorecardDefinition (TS, typsicher — Skizze)

```ts
interface AnswerOption {
  id: string;                 // stabile id (gespeicherter Antwortwert)
  label: string;
  points?: number;            // nur Score-Fragen
  category?: string;          // Kategorie/Dimension, die diese Antwort speist
  qualifies?: boolean;        // Kontext-Fragen: zählt zur Qualifikation
  attributeValue?: string;    // CRM-Attributwert (Kontext-Fragen)
}

interface Question {
  id: string;                 // "K1", "S1", ...
  kind: "context" | "score";
  prompt: string;
  category?: string;          // Score-Frage → benannte Kategorie
  attributeKey?: string;      // CRM-Attribut, z.B. "kfc_rolle"
  options: AnswerOption[];
}

type OutcomeConfig =
  | { type: "bands"; bands: { key: string; min: number; max: number }[] }
  | { type: "argmax"; over: "category"; pick: "max" | "min";
      outcomes: Record<string, string> };
// später, an derselben Stelle: | { type: "rules"; rules: {...}[] }

interface ScorecardDefinition {
  slug: string;                       // "ki-fuehrungs-check"
  meta: { title: string; intro: string; startLabel: string; metaLine: string };
  questions: Question[];
  scoring: { maxPoints: number; direction: "higher-better" | "higher-worse" };
  outcome: OutcomeConfig;
  nextLever?: { over: "category"; pick: "min" | "max" };  // schwächste Dimension
  qualification: { requireQualifies: string[] };          // ["K1","K2"]
  attributePrefix: string;            // "kfc_"
  content: ScorecardContent;          // s.u.
  branding: BrandTokens;
  cleverreach: { groupId?: string; formId?: string };     // wie Engpass: aus env
}
```

### ScorecardResult (→ `result jsonb`)

```ts
interface ScorecardResult {
  rawSum: number;
  score: number;                       // 0..100
  outcome: string;                     // band/type key, z.B. "vorbild"
  categoryScores?: Record<string, number>;
  nextLever?: string;                  // schwächste Kategorie
  qualified: boolean;
  attributes: Record<string, string>;  // { kfc_rolle: "...", kfc_score: "...", ... }
}
```

### Content-Modell (der „reiche" Teil)

Pro Outcome ein Block-Bündel, plus geteilte Blöcke — generalisiert aus der
Engpass-/KFC-Struktur, als Daten konsumiert von generischen Renderern:

```ts
interface OutcomeContent {
  diagnose: string;            // Voll-Diagnose (Prosa, {score} interpoliert)
  schritte: string[];          // nächste Schritte
  antiPattern: string;
}
interface ScorecardContent {
  byOutcome: Record<string, OutcomeContent>;
  personalisierung?: { questionId: string; byAnswer: Record<string, string> };
  freeTool?: { label: string; body: string };   // z.B. KI-Challenge-Frage
  sources: { id: string; text: string; url: string; shownWhen?: string }[];
  optin: { heading: string; body: string; button: string; consent: string };
  video: { intro: string; title: string; label: string; url: string };
  toolkit: ToolkitContent;     // hinter Opt-in (PDF), Struktur scorecard-spezifisch
}
```

„Keine Zahl ohne Quelle" bleibt eine Engine-Invariante (Quellen nur rendern, wenn
ihr `shownWhen`/Inhalt zutrifft) — als generischer Test, analog Engpass.

## Persistenz: `scorecard_submissions` (neue Tabelle)

```
id            uuid pk default random
scorecard     text notNull                 -- slug (Diskriminator)
email         text notNull
answers       jsonb notNull                 -- { K1: "...", S1: "...", ... }
result        jsonb notNull                 -- ScorecardResult
doi_status    text notNull default 'pending'  -- pending | confirmed | expired
doi_token     text notNull unique
report_token  text notNull unique
created_at    timestamptz notNull default now()
confirmed_at  timestamptz
ip_at_submit  text                          -- DSGVO-Consent-Nachweis
user_agent    text
tid           text                          -- trackmysales-Attribution (optional)
cleverreach_synced boolean notNull default false
indexes: (scorecard), (created_at)
```

Engpass-`submissions` bleibt unverändert. Migration via `drizzle-kit` (additiv,
reversibel). Konsolidierung beider Tabellen ist *später* möglich, kein Muss.

## Flow (wie Engpass, generalisiert)

```
Video/Shortlink → /ki-fuehrungs-check[?tid=…]
  • ScorecardApp: Intro → Fragen → client-seitiges Scoring (Engine) → Result frei
  • Opt-in: POST /api/scorecard/ki-fuehrungs-check/submit { email, answers, tid }
      → Engine rechnet result serverseitig nach (Trust-Boundary), persistiert,
        sendet DOI-Mail (IONOS), Antworten verlassen Browser erst hier (DSGVO)
  • DOI-Mail → /api/scorecard/confirm?token=…
      → doi_status=confirmed, Delivery-Mail (Variante A/B nach qualified),
        persönlicher Report-Link, CleverReach-Push (Gruppe + kfc_*-Attribute)
  • Retention: /api/cron/purge löscht unbestätigte > 7 Tage (um neue Tabelle erweitert)
```

Server-seitige Neuberechnung des Ergebnisses ist Pflicht (Fail-Fast, CLAUDE.md §3/§8):
Client-Antworten sind untrusted; die Engine ist die Quelle der Wahrheit.

## Wiederverwendung (nicht neu bauen)

Drizzle/Postgres-Setup · `src/lib/email` (nodemailer/IONOS + Handlebars `.hbs`) ·
CleverReach-Client (`lib/engpass-check/cleverreach.ts` → generischer ziehen oder
parametrisiert wiederverwenden) · DOI-Token-/Confirm-Muster (`confirm.ts`
generalisiert) · Retention-Purge · trackmysales-`tid`-Erfassung · Branding-Pattern
(CSS-Variablen).

**Neu:** generische Engine + KFC-Config/-Content + generischer Renderer +
Rate-Limiting (KFC-Spec-Anforderung; pro IP/Session).

## Validierung: KFC mappt sauber

- 7 Fragen (K1, K2 Kontext; S1–S4 Score, je `category` = sie selbst; K3 Kontext für
  Personalisierung).
- `scoring.maxPoints = 12`, `direction: "higher-better"`; normalisiert /12.
- `outcome.type: "bands"` mit 4 Bändern (0–25 Einkäufer / 26–50 Verwalter /
  51–75 Mitmacher / 76–100 Vorbild) = Typ.
- `nextLever: { over: "category", pick: "min" }` = schwächste S-Dimension.
- `qualification.requireQualifies: ["K1","K2"]`.
- `attributePrefix: "kfc_"` → `kfc_rolle, kfc_groesse, kfc_score, kfc_typ,
  kfc_schwaeche, kfc_bremse`.
- Kein `weg`, keine Tie-Break-Bäume → kein Sondercode. ✓
- Edge (Spec §Tie): „S4 = eingekauft+delegiert (0) → mindestens Einkäufer-Tendenz".
  Das ist eine *Betonung im Content*, nicht im Scoring — als Personalisierungs-/
  Diagnose-Hinweis lösbar, kein `rules`-Bedarf. (Bei Abnahme bestätigen.)

## Testing (TDD, CLAUDE.md §1)

- Engine pure → Beispiel-Tests für Bänder/Argmax/qualification/normalize +
  Property-Tests (`fast-check`, `numRuns: 3`) für Invarianten (score ∈ [0,100];
  outcome ist gültiger Key; „keine Zahl ohne Quelle" bidirektional).
- API-Routen: Integrationstests für submit/confirm (persist, DOI, idempotente
  Bestätigung) — Muster aus `engpass-check/route.test.ts`/`confirm.test.ts`.
- Renderer: Component-Tests (Intro→Fragen→Result, Opt-in sichtbar, Toolkit nur im
  PDF), Muster aus `EngpassCheck.test.tsx`.

## Phasing

- **v1 (dieses Vorhaben):** Engine (`bands`+`argmax`) · Persistenz-Tabelle +
  Migration · generischer Renderer + dynamische Route · submit/confirm-API · KFC
  Definition+Content+Branding live auf `/ki-fuehrungs-check` · DOI/Mail/CleverReach ·
  Rate-Limiting · Datenschutz-Abschnitt KFC.
- **Später (Nähte da, Code nicht):** `rules`-Resolver (Formeln) · Admin-API/Builder-UI ·
  Engpass-Migration · Tabellen-Konsolidierung.

## Non-Goals

- Kein Runtime-Admin/CRUD, keine Builder-UI (v1).
- Keine Formel-/Regel-Engine (v1).
- Keine Änderung am Engpass-Check (Logik, Inhalt, Tabelle).
- Keine LLM-Laufzeitlogik (reine Regel-Strecke, wie Engpass).

## Offene Punkte

- KFC-Inhalte/Wortlaut sind in der Vault-Spec „draft-v1, Review ausstehend (Daniel)" —
  Content-Freigabe (Fragen, Typ-Namen, Toolkit, Band-Grenzen) erfolgt parallel/vor
  dem Content-Teil der Implementierung.
- Rate-Limiting-Mechanik (in-memory vs. DB/Edge) im Plan konkretisieren.
- CleverReach-Gruppe/Attribute (`kfc_*`) + Delivery-Autoresponder = Daniels Setup-Task
  (analog Engpass-Go-live-Checkliste), kein Code.

## Prinzipien-Alignment (CLAUDE.md)

§1 TDD · §2 kleine reversible Diffs (additive Tabelle/Migration, Engine vor Renderer,
sichtbares Frontend früh) · §3 Fail-Fast (server-seitige Neuberechnung, Input-Validierung
an der Route) · §4 YAGNI (nur was KFC braucht) · §5 DRY mit Augenmaß (Infra
wiederverwenden, Engpass nicht zwangs-generalisieren) · §6 nachgefragt (alle Forks
geklärt) · §9 Contracts (Engpass-Tabelle/-Code unberührt).
