# Design: Coaching-Startseite (Stufe 2 — Profil → Coaching-Brand)

**Datum:** 2026-06-27
**Status:** Entwurf – wartet auf Abnahme
**Repo:** `danielkreuzhofer-ai-profile` (Portfolio + Funnels)
**Topic:** Stufe 2 — neue coaching-fokussierte Startseite ersetzt die Profil-/About-Home

## Problem / Kontext

Stufe 1 (`docs/superpowers/specs/2026-06-25-brand-kit-rebrand-design.md`, LIVE) hat das
Brand-Kit visuell auf die bestehende Seite angewandt — IA/Inhalte blieben gleich (ein
persönliches Profil mit Recruiter-Schlagseite). **Stufe 2** vollzieht die inhaltliche
Wende: Die Startseite wird zur **Sales-Landing für das Coaching-Offer „90-Tage AI Win™"**
(Vault `05-knowledge/90 Day AI Win - Offer - Deutsch.md`, 5.900 € netto, Done-With-You,
Smart AI Wins System™). Die heutigen Profil-Inhalte ziehen unter **/about** um. Die
Navigation bleibt.

Käufer-Zielgruppe (Brand-Kit): **Bereichsleiter im Mittelstand mit KI-Mandat** (Beach-Head
Vertriebsleiter), P&L, Budget bis 10k. Conversion = **Erstgespräch buchen** (Calendly).

## Entscheidungen (aus dem Brainstorming, 2026-06-27)

1. **Home-Form: Sales-Landing fürs Offer.** `/` ist die Long-Form-Verkaufsseite fürs
   90-Tage AI Win (nicht Brand-Hub, nicht Hybrid).
2. **Profil zieht unter /about um.** Die heutigen Home-Inhalte (Hero/About/Experience/
   Projects/Skills/Contact) leben künftig unter `/about`. **Navigation bleibt.**
3. **Recruiter-Features als /about-Extras.** Fit-Analysis und Transparenz-Dashboard
   bleiben — umgedeutet als „Was ich gebaut habe"-Demos, **unter /about verlinkt, nicht in
   der Haupt-Nav**. (Routen `/fit-analysis`, `/transparency` bleiben bestehen.)
4. **Abschnitts-Reihenfolge** der Landing (s.u.), **Beweis nach oben** (früher Trust-Anker).
5. **Lead-Magnets bleiben** (Engpass-/KFC-/DSGVO-Check) und speisen den Funnel; auf der
   Landing im „Noch nicht bereit?"-Abschnitt + als Hero-Sekundär-CTA.

## Design

### 1. IA / Routen / Navigation

| Route | Inhalt | Status |
|---|---|---|
| `/` | **Coaching Sales-Landing** (90-Tage AI Win → Erstgespräch) | NEU |
| `/about` | „Über mich" / Profil: die heutigen Home-Sektionen (Story/Experience/Projects/Skills/Contact) + Links zu Transparenz & Fit-Analysis als Demos | NEU (Re-Home) |
| `/blog`, `/blog/[slug]` | Blog | unverändert |
| `/engpass-check`, `/ki-fuehrungs-check`, `/dsgvo-check` (+ report/bestätigen) | Lead-Magnet-Funnels | unverändert |
| `/fit-analysis`, `/transparency` | bleiben als Routen; nur aus der Haupt-Nav entfernt, von /about verlinkt | unverändert |
| `/impressum`, `/datenschutz` | Legal | unverändert |

**Navigation (`Navigation.tsx` / `DEFAULT_SECTIONS`):** von Anchor-basiert (Single-Page
`#about` …) auf **Route-basiert** umstellen: `kreuzhofer.`-Wordmark · **Coaching** (`/`) ·
**Über mich** (`/about`) · **Blog** (`/blog`) · CTA **[Erstgespräch buchen]** (Calendly).
Recruiter-/Fit-Analysis-/Transparenz-Einträge raus. Mobile-Menü analog.

### 2. Sales-Landing `/` — Abschnitte (finale Reihenfolge)

Jeder Abschnitt = eigenständige Komponente in `frontend/src/components/coaching/`. Copy-
Quelle = das Offer-Doc + Brand-Voice „mit Kante"; **Daniel finalisiert die Texte**.

1. **Hero** — Versprechen („Zeig, dass KI funktioniert — in 90 Tagen, ohne Chaos"),
   Cyan-Eyebrow „KI-Coaching mit Kante", Sub (Done-With-You für Bereichsleiter mit
   KI-Mandat), Primär-CTA **Erstgespräch buchen** + Sekundär **Engpass-Check (3 Min)**.
   Mixed-Light-Gradient, Anton-Display (Stufe-1-Tokens).
2. **Beweis / Warum ich** — Senior AI Solutions Architect @ AWS, 20+ J. Enterprise; (Cases/
   Testimonials später). Früher Autoritäts-Anker. Verlinkt zu `/about`.
3. **Für wen** — Bereichsleiter/Vertriebsleiter im Mittelstand mit KI-Mandat & P&L;
   „nicht für Startups/Stabsrollen/ohne Mandat" (Qualifizierung aus dem Offer-FAQ).
4. **Das Problem** — Prozess zu manuell/langsam, KI-Druck von oben, „wo starten?" →
   Brücke zum Engpass-Check.
5. **Die Methode — Smart AI Wins System™** — Bremsen lösen → Pilot planen → Impact
   liefern; 12-Wochen-Fahrplan (Woche 1 / 2–3 / 4–10 / 11–12 aus dem Offer-Doc).
6. **Das Ergebnis** — umgesetzter KI-Pilot · messbarer Impact · internes Vertrauen + Basis
   zum Skalieren.
7. **Investition** — 5.900 € netto, einmalig, Done-With-You, was enthalten ist.
8. **FAQ** — Einwände aus dem Offer-FAQ (technisch? Zeit? Tools/Shadow-AI? Done-With-You?).
9. **Noch nicht bereit?** — Lead-Magnets (3 Checks) + neuestes YouTube-Video + Newsletter
   (Nurture für die Reichweiten-Schicht).
10. **Finale CTA** — Erstgespräch (Calendly); „passt es, gibt's noch am selben Tag den
    Kalenderlink".

### 3. Build-Ansatz

- **Neue Landing:** `frontend/src/app/page.tsx` rendert künftig die Coaching-Landing aus
  neuen Sektion-Komponenten in `src/components/coaching/` (`Hero`, `Proof`, `ForWhom`,
  `Problem`, `Method`, `Result`, `Investment`, `Faq`, `LeadMagnets`, `FinalCta`). Inhalte
  als typisierte Content-Konstanten (analog zur bestehenden Content-Pipeline) — Copy aus dem
  Offer-Doc, Daniel-finalisierbar. Brand-Optik über die Stufe-1-Tokens.
- **/about Re-Home:** neue Route `frontend/src/app/about/page.tsx`, die die **bestehenden**
  Home-Sektionen (`AboutSection`, `ExperienceSection`, `ProjectsSection`, `SkillsSection`,
  `ContactSection` — und eine schlanke Profil-Hero) rendert, plus einen „Was ich gebaut
  habe"-Block mit Links auf `/transparency` und `/fit-analysis`. Komponenten wandern
  weitgehend **unverändert** (sind schon rebrandet); ggf. `RecruiterCTASection` entfällt
  oder wird zu einem neutralen „Kontakt/Zusammenarbeit"-Block.
- **Navigation:** Route-basierte Links + Booking-CTA; Anchor-Scroll-Spy (`useActiveSection`)
  wird für die Multi-Page-Nav vereinfacht (aktiver Zustand per `pathname`, wie der in Stufe 1
  gehärtete `isRouteActive`).
- **Booking:** Calendly-URL (bestehend, z. B. `https://calendly.com/danielkreuzhofer/30min`)
  als zentrale Konstante; überall der Primär-CTA.

### 4. Wiederverwendung / Isolation

- Die Profil-Sektionen sind bestehende, fokussierte Komponenten → 1:1 nach `/about`.
- Die Coaching-Sektionen sind neu, je eine Datei mit einer Verantwortung, gespeist aus
  Content-Konstanten (kein verschachtelter State).
- Scorecards/Funnels, Blog, Legal: **unangetastet**.

## Fehlerbehandlung / Edge Cases

- **Interne Anker/Links:** Alles, was heute auf `/#about`, `/#experience` etc. zeigt (Nav,
  Footer, evtl. Chatbot-Antworten), auf `/about` umbiegen. Alte Hash-Links dürfen nicht ins
  Leere laufen.
- **SEO/Metadaten:** `/` bekommt Offer-orientierte `<title>/description`; `/about` erbt die
  bisherige Profil-Metadatenrichtung. `sitemap`/`robots` falls vorhanden anpassen.
- **Chatbot-Kontext:** Der „Ask AI about me"-Chat bleibt (Profil-Wissen); sein Einstieg
  (Floating-Button) bleibt global. Inhaltlich unverändert in Stufe 2.

## Tests

- **Risiko-skaliert (mittel — neue Seiten + IA-Umbau):** neue Coaching-Sektionen rendern
  (Beispiel-Tests: Kern-Copy + CTAs vorhanden, Booking-Link gesetzt); `/about` rendert die
  migrierten Sektionen; Navigation zeigt die neuen Route-Links + Booking-CTA und **nicht**
  mehr die Recruiter-/Fit-/Transparenz-Einträge; aktiver Nav-Zustand per Route.
- Bestehende Tests, die die alte Home-IA / Anchor-Nav prüfen, anpassen (test-only).
- Build grün (neue Routen kompilieren), Lint ohne neue Errors, volle Suite grün
  (deterministisch dank gepinntem fast-check-Seed).
- Visuelle Abnahme: `/` und `/about` durchklicken; Booking-CTA testen; Mobile.

## Bewusst NICHT im Scope

- **Finale Verkaufstexte / echte Cases & Testimonials** = Daniel (Spec liefert Struktur +
  Erst-Entwurf aus dem Offer-Doc).
- Redesign der Profil-Inhalte unter /about (nur Re-Home, kein Neubau).
- Änderungen an Scorecards/Funnels, Blog, Chatbot-Logik.
- Newsletter-/YouTube-Einbettungstiefe über einfache Links/Embeds hinaus.

## Offene Punkte / Daniels Aufgaben

- Verkaufstexte je Abschnitt finalisieren (Ton „mit Kante"); echte Cases/Testimonials
  liefern, sobald vorhanden.
- Calendly-Link/Variante fürs Erstgespräch bestätigen.
- Entscheidung, ob `RecruiterCTASection` unter /about als neutraler Kontakt-Block bleibt
  oder entfällt.
