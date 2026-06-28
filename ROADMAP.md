# Roadmap

*Last updated: 2026-06-28*

Feature progress and planned work for the AI-powered portfolio (evolving toward a coaching business + YouTube channel).

## Completed Specs (001-007)

All foundational specs are complete. Each was built with Kiro spec-driven development (requirements, design, tasks).

| Spec | Feature | Status | Date |
|------|---------|--------|------|
| 001 | **Content Architecture** — Next.js portfolio with MDX content, responsive layout, navigation | Done | 2025 |
| 002 | **AI Chatbot** — "Ask AI About Me" chat with streaming responses, context preservation | Done | 2025 |
| 003 | **Fit Analysis Module** — Job description analyzer with confidence scoring and evidence | Done | 2025 |
| 004 | **Transparency Dashboard** — Three-tier skill visualization (Core / Working / Gaps) | Done | 2025 |
| 005 | **Visual Design Upgrade** — Design tokens, typography, hero section, micro-interactions | Done | 2025 |
| 006 | **Chatbot Guardrails** — Prompt injection, jailbreak, content moderation, off-topic detection | Done | 2026-02 |
| 007 | **Blog Section** — Blog listing, individual posts with MDX, navigation integration | Done | 2026-02 |

## Post-Spec Enhancements (Feb 2026 — present)

Work completed after the core specs, grouped by area.

### Content & Profile Updates
- [x] Update role to Senior AI Solutions Architect across all sources
- [x] Add AI coding tools, ML infrastructure skills, and Nebius project
- [x] Add Chat3D blog post, project, and portfolio entry
- [x] Update knowledge submodule: AI depth, SA journey, Linux infrastructure
- [x] Update skills transparency with new expertise and explicit gaps
- [x] Upload first blog articles (Chat3D, AI coding practices, portfolio philosophy)

### Fit Analysis
- [x] File upload support (PDF, DOCX, TXT, MD, PPTX) with text extraction
- [x] PDF and Markdown download buttons for analysis results
- [x] AI-generated job title in results and download filenames
- [x] Bridgeable gaps — prompt recognizes transferable skills as minor gaps, not hard gaps
- [x] Fix PDF text extraction (externalize pdf-parse from Turbopack bundle)

### AI Chatbot
- [x] Widen guardrail allowed topics (leadership, AI, entrepreneurship, industry)
- [x] Raise off-topic block threshold to reduce false positives on legitimate questions
- [x] Third-person voice — chatbot speaks about Daniel, not as Daniel
- [x] Specific answers grounded in knowledge, not generic industry advice
- [x] Revise starter questions to match actual knowledge base content
- [x] AI-generated follow-up suggestions via /api/suggestions (replaces static keyword matching)

### Visual & UX
- [x] Particle constellation animated background for hero section
- [x] Cinematic hero banner for blog posts
- [x] Blog page redesign with full nav, animations, smooth transitions
- [x] Mobile responsiveness fixes (touch events, particle performance, hero aspect ratio)
- [x] Shared page layout for fit-analysis and transparency pages
- [x] Replace phone number with Calendly booking link

### Infrastructure
- [x] Claude Code build-and-deploy skill
- [x] Fix Dockerfile BuildKit compatibility

### Lead-Magnet Funnels & Scorecard Engine
- [x] **Engpass-Check** — interactive rule-based scorecard funnel (quiz → typed result + report), own Postgres/Drizzle persistence, double-opt-in, hybrid CleverReach (tags only), branded transactional emails, DSGVO retention purge
- [x] **trackmysales attribution** — leads attributed to their source video via the sibling `track-my-sales` repo (cross-repo, live)
- [x] **Generic scorecard engine** — productized the funnel as config + content (definition / content / branding as data): pure scoring (bands / argmax / qualification / next-lever), generic `scorecard_submissions` table, dynamic `/[slug]` routing, registry
- [x] **KI-Führungs-Check (#06) — LIVE** — first scorecard on the engine: Engpass-matched styling, 28-tip gated light PDF report (weakest lever highlighted first, 📊/✅-sourced), branded DOI + delivery emails, opt-in Datenschutz-Hinweis, DSGVO video linked in the personalisation; numeric score dropped product-wide
- [x] **Engine seams for *complex* scorecards** — four small, optional, backward-compatible seams so a scorecard can go beyond data-config: multi-select questions (`kind: "multi"`, `Answers` value `string | string[]`), a `resolve` hook (custom result computation, stored in the generic `result jsonb`, no migration), custom `ResultView` / `ReportDoc` components, and a `cleverreachTags` hook. RSC boundary handled via a `"use client"` wrapper that resolves function-bearing registrations client-side. Multi-select questions show a "Mehrfachauswahl möglich" hint. Engpass/KFC unaffected
- [x] **DSGVO-Check — code-complete (4th funnel)** — dynamic tool-recommendation scorecard: 8 questions → readiness Ampel + per-tool DSGVO traffic-light matrix + personalized action plan. Provider/legal data fact-checked (Juni 2026 — Copilot Flex-Routing, DPF instability, Digital-Omnibus dates), AI-Act risk class incl. HR-Hochrisiko trap, gated print report with **full inline templates** (KI-Nutzungsrichtlinie, AVV-Checkliste, AI-Literacy-Plan) + **official IHK/GDD/Bitkom/BIHK reference links** + Rechtsstand badge; per-tool CleverReach tags for newsletter-based update nurture. Builds as SSG (`/dsgvo-check`), rendering verified. Spec + plan in `docs/superpowers/`

### Brand & Positioning — Profil → Coaching-Brand
- [x] **Brand-Kit-Rebrand (Stufe 1) — LIVE** — applied the Video-Brand-Kit (`vault video-brand-kit.md`) to the existing main site, visual only (IA/content unchanged): `globals.css` token value-remap (near-black `#0A0A0A`, orange `#E89244` primary / cyan `#4DBED4` secondary, pain-red/solution-green, studio mixed-light gradient; **neon glows + particle-constellation hero removed** per §9 anti-Hype), Anton display + Inter-Bold headings, `kreuzhofer.` wordmark + `k.` bug + favicon, WCAG-AA-fixed buttons/nav. Main site now matches the scorecards. 1991 tests green, SSG build clean. Spec + plan in `docs/superpowers/`
- [x] **Coaching sales-landing (Stufe 2) — LIVE at `/coaching`** — the 90-Tage AI Win offer page: 10 sections (Hero → Beweis → Für-wen → Problem → Methode → Ergebnis → Investition 5.900 € → FAQ → Lead-Magnets → Final-CTA), `src/components/coaching/` module (one `content.ts` for all copy + 9 section components), Erstgespräch → Calendly. Profile re-homed to `/about` with the **recruiter features resolved**: Transparency-Dashboard + Fit-Analysis kept, recast as "Was ich gebaut habe" demos, out of the main nav. Spec+plan in `docs/superpowers/`, built subagent-driven
- [x] **Copy re-steered to the Vertriebsleiter ICP + anti-Hype voice** — grounded in the vault (ICP / Positionierung / Content-Leitfaden): lead with the Vertrieb beach-head + Ring-0 reality (Angebote/CRM/Forecast), de-Englished throughout (Done-With-You, Co-Creation, Impact Review, Shadow-AI, Friction-Point…), methodology → "Das 90-Tage-Pilot-System", fixed 20+→25+ Jahre, replaced the signing-authority line with a benefit, added the "keine Zeit" FAQ, fixed the final-CTA Calendly logic
- [x] **Funnel re-architecture — `/` is now the top-of-funnel CONTENT entry** — per the Taki-Moore model (**Content → Micro-Magnet → Erstgespräch → Offer**): homepage promotes content (latest-videos thumbnail cards via channel RSS, click-to-play/privacy-friendly) + the Engpass-Check micro-magnet as the primary CTA (**no sales call** at top-of-funnel); offer moved to `/coaching`; nav content-first (Start · Coaching · Über mich · Blog) with the micro-magnet as the global CTA. Hero polish: compact (no 80vh void), one-line headline, fixed `.brand-display` leading (0.95→1.05, wrapped lines were overlapping), lifted hero gradient. 157 suites / 2025 tests green
- [x] **Vault anchored as source of truth** — `CLAUDE.md` + auto-memory now point at `~/Documents/vault` (brand-kit, ICP, Positionierung, Content-Leitfaden, offer) as canonical for all brand / copy / audience work
- [x] **Homepage videos auto-fetch from the channel RSS** — the "Neueste Videos" cards load via `getLatestVideos()` (build-time fetch of `youtube.com/feeds/videos.xml`, 6h ISR), resilient with a seeded `FEATURED_VIDEOS` fallback on network/parse failure; `/` is now an async server component, `VideosSection` is prop-driven

## Planned / In Progress

### Fit Analysis
- [ ] Evaluate Option B/C for bridgeable gaps (visual distinction in UI) if prompt-only approach isn't clear enough
- [ ] Consider weighting system for gap severity based on job description emphasis (must-have vs. nice-to-have)

### AI Chatbot
- [ ] Verify AI-generated follow-up suggestions appear correctly after responses
- [ ] Monitor and tune off-topic threshold based on real usage

### Content
- [ ] Ongoing knowledge base updates as experience evolves
- [ ] New blog posts

### Lead-Magnet Funnels
- [ ] **In-app self-scheduling retention purge** (S) — the DSGVO purge (deletes unconfirmed opt-ins older than 7 days, both funnel tables) lives at `GET /api/cron/purge` and currently needs an *external* trigger (server crontab / cron-job.org / GitHub Actions, `CRON_SECRET`-gated). Move the schedule *into* the app — in-process scheduler in a server singleton or `instrumentation.ts`; viable because prod runs a persistent Docker container (`npm run start`)
- [ ] New scorecards are now "data not code" — register via `src/scorecards/<slug>/` (definition + content + branding) when the next one is ready
- [ ] **DSGVO-Check go-live (Daniel ops)** (M) — legal sign-off on the *authored* content (disclaimer, verdict wording, Art. 4 fine figure: research says 15 Mio €/3% vs the old doc's 7,5 Mio €/1,5%) and the three template drafts; quick click-verify of the 6 external reference links (two IHK pages returned 403 to the fetcher); CleverReach segment `dsgvo-check` + per-tool tags; prod env; real video/booking URLs. No DB migration (reuses `scorecard_submissions`)
- [ ] **Keep DSGVO facts current** (S, recurring) — `facts.ts` (provider × tier verdicts, AI-Act timeline, DPF status) + the Rechtsstand badge need periodic refresh via Perplexity deep research; this space moves fast (DPF/PCLOB, Digital Omnibus, EU-residency rollouts, new DPAs). Refresh = edit one data file + bump `RECHTSSTAND`

*(Content/video ideas — like a "5 Hebel" video that re-promotes the KFC lead magnet — live in the vault video backlog, not here.)*

### Brand & Positioning
- [ ] **`/coaching`: real cases / testimonials** (Daniel) — the Beweis section is authority-only (AWS, 25+ J.); add concrete cases/testimonials when available
- [ ] **Final sales copy polish** (Daniel) — the re-steered copy is a strong first draft; Daniel finalizes wording in `coaching/content.ts` (one file). Sanity-check the hero headline + the insight-led Beweis framing (AWS title dropped for "ich sehe täglich, warum KI-Piloten liefern…")
- [ ] **German blog content for the content-home** (Daniel) — the homepage blog teaser surfaces the existing English posts (recruiter-era), which clash on the German page; write German posts or hide the teaser until then
- [ ] **About-page portrait** (S) — `/about` + the home About-teaser are text-only; add a portrait (review once the channel thumbnails are settled)

### Infrastructure
- [x] **Test suite fully green** (133 suites / 1955 tests) — fixed all pre-existing failures: a real Navigation `usePathname()` null-deref, ESM/next-navigation jest-config gaps, and ~70 stale test assertions/fixtures lagging the dark-theme migration + SSE flow (test-only changes)
- [x] Dependency security — cleared **all 7 prod high** + **4 moderate** Dependabot vulns (next, ws, form-data, hono, nodemailer, fast-uri, @xmldom/xmldom, qs, ip-address, express-rate-limit, dompurify) via surgical npm `overrides` + targeted bumps (NOT `npm audit fix` — it re-resolves the whole tree and breaks the jest/babel test tooling). Prod now **0 high / 5 moderate**.
- [ ] Remaining 5 prod **moderate** vulns — all need risky majors / low real risk: @hono/node-server 1→2 (tooling, not run as a server), js-yaml↔gray-matter (frontmatter parsing, like the xmldom-0.9 break), postcss↔next (build-time CSS XSS, no runtime untrusted input)
- [x] **Flaky property tests fixed** — root cause: fast-check's *random per-run seed* occasionally drew whitespace-only-differing strings that collide under the accessibility-name / `toHaveTextContent` normalizer, making list queries ambiguous → intermittent full-suite failures that passed in isolation (union-bound heisenbug across ~50 property files; the tests already used `numRuns: 3`). Fixed via a pinned global seed in `jest.setup` (`fc.configureGlobal`) + hardened the two arbitraries the seed surfaced (normalize-then-filter). 3× full-suite runs now identical (138 suites / 1991 tests)
- [x] **Dev preview over LAN (mobile) fixed** — Next 16 blocked the cross-origin HMR websocket when `next dev` was reached via the LAN IP (phone preview) → SSR HTML rendered but the client never hydrated (menu/chat dead, looked "broken"; localhost + prod build were always fine). Root-caused by testing the *exact* network URL, not localhost. Added `allowedDevOrigins` (env-overridable via `DEV_ORIGINS`) to `next.config.ts`. Dev-only
- [ ] **tsc/eslint debt in test files** (S) — ~39 eslint errors + a few `tsc --noEmit` errors live in test files (not caught by ts-jest's `isolatedModules`, not failing `next build` which skips test typecheck). Clean up for a green `tsc`/lint baseline so real regressions stand out
