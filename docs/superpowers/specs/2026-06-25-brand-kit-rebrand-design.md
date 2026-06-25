# Design: Brand-Kit-Rebrand der Hauptseite (Stufe 1)

**Datum:** 2026-06-25
**Status:** Entwurf – wartet auf Abnahme
**Repo:** `danielkreuzhofer-ai-profile` (Portfolio + Funnels)
**Topic:** Stufe 1 von „Profil → Coaching-Brand" — rein visueller Rebrand, IA/Inhalte unverändert

## Problem / Kontext

Die Website soll sich von einem **persönlichen Profil** (Recruiter-/Job-orientiert) zur
**Coaching-Brand + YouTube-Kanal** entwickeln. Daniel hat das in zwei Stufen zerlegt:

1. **Stufe 1 (dieses Dok):** das **Video-Brand-Kit** (`vault 05-knowledge/video-brand-kit.md`)
   auf die **bestehende** Seite anwenden — Palette, Typografie, Logo, anti-Hype-Look.
   **IA und Inhalte bleiben gleich.**
2. **Stufe 2 (späterer Zyklus):** eine **neue, coaching-fokussierte Startseite**, die die
   heutige Profil-/„About"-Landing ersetzt. Eigener Spec → Plan → Bau.

Heute divergiert die Hauptseite vom Brand-Kit: `globals.css` definiert eine eigene
„Cinematic Tech"-Palette (blau-violetter Grund `#1a1a2e`, Teal-Primary `#14b8a6`,
Orange-Secondary) mit Partikel-Constellation-Hero und Neon-Glows. Die **Scorecard-Funnels**
(Engpass/KFC/DSGVO) nutzen dagegen bereits die echte Brand-Palette. Stufe 1 **vereinheitlicht
die Hauptseite mit den Funnels und Videos**.

## Entscheidungen (aus dem Brainstorming, 2026-06-25)

1. **Richtung B — brand-treu, anti-Hype** (statt „nur umfärben"): Partikel/Cyber-Effekte
   raus (Brand-Kit §9), Studio-Mixed-Light-Verlauf (warm-orange + kühl-cyan auf Near-Black)
   statt Glows. Substanz-plakativ, kein Cyber-Tech/Roboter/3D-Glow.
2. **Typografie:** **Anton** nur für Hero-/Display-Momente (seltener Wow-Moment); **Inter
   Bold** für Abschnitts-Überschriften; **Inter** für Body. (Inter ist bereits die Body-Font.)
3. **Akzent-Rollen wie in den Scorecards:** **Orange `#E89244` = Aktion/CTA**, **Cyan
   `#4DBED4` = sekundär (Eyebrows, Links, Focus)**.
4. **Logo:** `kreuzhofer.`-Wordmark in der Nav (ersetzt die heutige Text-Marke); `k.`-Bug im
   Footer + als Favicon. SVGs liegen in `vault 06-assets/branding/`.
5. **Scope:** alle Hauptseiten-Oberflächen. Scorecards bleiben unangetastet (schon on-brand).
   **Inhalte/IA/Copy unverändert** — Repositionierung ist Stufe 2.

## Implementierungs-Ansatz

**Value-Remap, keine Token-Umbenennung.** Die Seite hat bereits ein Token-System; Komponenten
referenzieren semantische Tokens (`--background`, `--primary-*`, `--secondary-*`,
`--foreground`). Wir tauschen die **Werte** dieser Tokens in `globals.css` `:root` gegen die
Brand-Palette und behalten die **Namen** — so erbt der Großteil der Komponenten den neuen Look
**ohne Code-Änderung**. Nur Komponenten mit **hardcodeten Farben** oder **Cyber-Effekten**
(Hero-Partikel, Glow-Shadows) werden angefasst.

Verworfen: (a) reiner Umfärb auf den Cyber-Effekten — wäre halb-gepivotet (B verworfen A);
(b) komplette Token-Neubenennung — unnötiger Blast-Radius über alle Komponenten.

## Design

### 1. Brand-Token-System (`globals.css` `:root`)

| Token (Rolle) | Heute | Brand (Stufe 1) |
|---|---|---|
| `--background` | `#1a1a2e` | **`#0A0A0A`** |
| `--surface` / `--surface-elevated` | `#16213e` / `#1f2b47` | **`#161616`** / **`#1e1e1e`** |
| `--surface-overlay` | `#0f0f1a` | **`#0A0A0A`** |
| `--foreground` / `-muted` / `-subtle` | `#eaf0f6` / `#94a3b8` / `#64748b` | **`#ffffff`** / **`#b4b4b4`** / **`#8a8a8a`** |
| `--border` / `--border-muted` | `#2a3a5c` / `#1f2b47` | **`#3A3A3A`** / **`#2a2a2a`** |
| `--primary-*` (Aktion/CTA) | Teal-Ramp (`#14b8a6` …) | **Orange-Ramp um `#E89244`** |
| `--secondary-*` (sekundär/Links/Eyebrow/Focus) | Orange-Ramp (`#f97316` …) | **Cyan-Ramp um `#4DBED4`** |
| `--success` / `--error` | `#10b981` / `#ef4444` | **Solution-Grün `#58D68D`** / **Pain-Rot `#E63946`** |
| `--warning` / `--info` | `#f59e0b` / `#06b6d4` | **`#E89244`** / **`#4DBED4`** (auf Brand mappen) |
| `--gradient-hero` / `--gradient-section` | blau-violette Verläufe | Near-Black-Verlauf (leichter Gradient nach oben heller) |
| `--gradient-glow-teal` / `-orange` | Teal/Orange-Neon-Glows | **Mixed-Light:** `radial-gradient` warm-orange unten-links + kühl-cyan oben-rechts, dezent |
| `--shadow-glow-teal` / `-orange` | Neon-Glow-Shadows | entfernen / auf neutrale Schatten reduzieren |

Die `--primary-*` / `--secondary-*`-**Ramps** (50…950) werden als Orange- bzw. Cyan-Tonleiter
neu erzeugt, Namen bleiben — Komponenten, die `var(--primary-500)` o.ä. nutzen, erben automatisch.
Der `@theme inline`-Block (Tailwind v4) mappt weiter auf dieselben Tokens; ggf. fehlende
`--color-primary-*` / `--color-secondary-*`-Aliase ergänzen, damit Tailwind-Utility-Klassen den
Brand-Wert ziehen.

### 2. Typografie & Logo

- **Anton** zusätzlich via `next/font/google` in `layout.tsx` laden (`variable: "--font-anton"`,
  wie in den Scorecards). Einsatz: Hero-Display / seltene Title-Moment-Headlines, ALLCAPS
  condensed. **Nicht** für jede Überschrift.
- **Inter** (bereits geladen, `--font-inter`) bleibt Body **und** wird die Font für
  Abschnitts-Überschriften (Inter Bold/700, Groß-/Kleinschreibung). Heading-Styles in
  `globals.css` entsprechend auf Inter Bold setzen (heute teils anders).
- **Geist_Mono** bleibt für Code/Mono (unverändert), falls genutzt; sonst optional entfernen.
- **Logo:** SVGs aus `vault 06-assets/branding/` nach `frontend/public/brand/` kopieren
  (`kreuzhofer-wordmark-{light,dark}.svg`, `k-bug-{light,dark}.svg`). Nav rendert die Wordmark
  (dark-Variante auf Near-Black) statt der heutigen Text-Marke; Footer + Favicon nutzen den
  `k.`-Bug. Wordmark als `next/image` oder inline-SVG-Komponente.

### 3. Oberflächen-Scope

**Rebrandet (erben Tokens automatisch, plus gezielte Eingriffe):**
- **Global:** `Navigation` (Wordmark + orange CTA, Active-State cyan), `Layout`, Footer.
- **Home-Sektionen:** `HeroSection` (Partikel raus → Mixed-Light-Gradient, Anton-Display,
  „mit Kante"-Eyebrow in Cyan), `AboutSection`, `ExperienceSection`, `ProjectsSection`,
  `SkillsSection`, `RecruiterCTASection`, `ContactSection`.
- **Weitere Routen:** `/blog` + `/blog/[slug]`, `/transparency`, `/fit-analysis`, Legal
  (`/impressum`, `/datenschutz`).

**Gezielte Eingriffe (nicht nur Token-Erbe):**
- `ParticleConstellation.tsx` aus `HeroSection` entfernen; Hero-Hintergrund = Mixed-Light-
  Gradient (neue Token). Komponente bleibt im Repo (evtl. später nutzbar) oder wird entfernt,
  wenn nirgends sonst referenziert.
- Komponenten mit **hardcodeten** Farben (Teal/Blau/Glow) auf Tokens umstellen — beim Bau pro
  Komponente per Grep finden (`#14b8a6`, `#1a1a2e`, `teal`, `glow`, etc.).
- Heading-Typo-Regeln in `globals.css` (Inter Bold).

**Unangetastet:**
- Scorecards (`/[scorecardSlug]`, Engpass-Check) + deren `sc.css`/`BrandTokens` — schon on-brand.
- **Sämtliche Inhalte, IA, Copy, Routen** — Stufe 1 ist rein visuell.

## Fehlerbehandlung / Edge Cases

- **Kontrast/Lesbarkeit:** Cyan `#4DBED4` auf Near-Black für Links/Eyebrows muss WCAG-AA für
  Text erfüllen; wo Cyan als reiner Akzent (nicht Fließtext) dient, ist es unkritisch. Orange
  `#E89244` als CTA-Background braucht dunklen Text (`accentInk #1a1206`).
- **Bestehende Tests:** Visuelle/Snapshot- oder klassenbasierte Tests, die alte Farbwerte/Token
  prüfen, anpassen (test-only).
- **Kein Light-Mode** (Seite ist dark-first) — bleibt so.

## Tests

- **Risiko-skaliert (niedrig — visuell):** Build + Lint grün; bestehende Unit-/Property-Tests
  bleiben grün (Token-Werte sind kein Test-Gegenstand außer wo explizit geprüft → anpassen).
- **Visuelle Abnahme:** `npm run dev:local`, jede Hauptroute durchklicken; Brand-Konsistenz
  gegen die Scorecards (gleiche Orange/Cyan/Near-Black). Mixed-Light-Hero statt Partikel
  verifizieren. Mobile-Check (Hero-Lesbarkeit).
- **Visual-QA-Gotcha (Repo):** Playwright-Screenshots crashen reproduzierbar auf langen
  *dunklen* Seiten (große Blur-Schatten) — `navigate`/DOM-Snapshot gehen; für visuelle Checks
  ggf. throwaway-Preview oder gezielte Sektion-Screenshots.

## Bewusst NICHT im Scope (Stufe 2)

- Neue coaching-fokussierte Startseite; Repositionierung der Copy in „mit Kante"-Voice.
- Entscheidung über Recruiter-Features (Fit-Analysis, Recruiter-CTA, Transparenz) — in Stufe 1
  bleiben sie, nur rebrandet; ihr Verbleib/Umbau ist Stufe 2.
- YouTube-/Content-Hub, Lead-Magnet-Prominenz, Booking-Funnel-IA.
- Neue Inhalte, neue Routen.

## Offene Punkte / Daniels Aufgaben

- Logo-SVGs final freigeben (Wordmark-Variante für dunklen Grund).
- Optional: echte Hex-Werte der Brand-Palette gegen reale Video-Renders verifizieren
  (Brand-Kit §4 markiert sie als „approximativ, TODO verifizieren").
