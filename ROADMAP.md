# Roadmap

Feature progress and planned work for the AI-powered portfolio.

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

*(Content/video ideas — like a "5 Hebel" video that re-promotes the KFC lead magnet — live in the vault video backlog, not here.)*

### Infrastructure
- [x] Address GitHub Dependabot security vulnerabilities
