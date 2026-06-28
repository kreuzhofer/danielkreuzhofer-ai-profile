# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AI-powered interactive portfolio for Daniel Kreuzhofer (Senior Solutions Architect, AWS). Built with Next.js 16 + React 19 + TypeScript. Features an OpenAI-powered chatbot, fit analysis module (job description matching), transparency dashboard, and blog. All content is MDX-based in `frontend/content/`. The site is evolving toward a coaching business + YouTube channel (see "Brand & Content" below and the funnel/scorecard modules).

## Brand, Positioning & Content — Source of Truth

**Daniel's Obsidian vault is the single source of truth for brand, positioning, target audience, voice, and the offer.** It lives **locally at `~/Documents/vault`** (NOT in this repo). Before writing or changing any user-facing copy, positioning, brand visuals, or audience framing, **consult these files** — do not invent brand/voice/audience from scratch:

- `05-knowledge/video-brand-kit.md` — brand claim ("KI-Coaching mit Kante"), palette (orange `#E89244` / cyan `#4DBED4`), fonts (Anton + Inter), anti-Hype doctrine, buyer/reach split (70% Führungskräfte buyers / 30% Wissensarbeiter reach).
- `05-knowledge/ICP - Vertriebsleiter Mittelstand.md` — buyer persona (beach-head **Vertriebsleiter im Mittelstand mit KI-Mandat**; Ring-0 use cases: Angebote, CRM, Lead-Scoring, Forecast; personal stakes: Quartalsziele/Bonus-KPI).
- `05-knowledge/Positionierung - Tiefeninterview.md` — positioning / messaging source.
- `05-knowledge/Content-Leitfaden Anders mit klarer Kante.md` — **voice/tone** (Klartext, anti-Hype, "mit Kante", *Sie*, no English-jargon/funnel-guru aesthetic, take a position).
- `05-knowledge/90 Day AI Win - Offer - Deutsch.md` — the coaching offer (90-Tage AI Win, 5.900 € netto, Done-With-You, Smart-AI-Wins method, Erstgespräch CTA → Calendly).
- `06-assets/branding/` — logo SVGs (wordmark + k-bug, light/dark/mono).

Lead-magnet funnels/scorecards and the coaching landing copy must stay consistent with the above. When the vault and the code disagree, the vault wins (then update the code).

## Commands

All frontend commands run from the repo root using `--prefix frontend`, or from `frontend/` directly. Tests run locally, **not** inside Docker.

```bash
# Development (uses ../.env for OPENAI_API_KEY)
npm run dev:local --prefix frontend

# Build
npm run build:local --prefix frontend

# Lint
npm run lint --prefix frontend

# Tests
npm test --prefix frontend                                    # all tests
npm test --prefix frontend -- path/to/test.ts                 # specific file
npm test --prefix frontend -- --testPathPattern="Navigation"  # pattern match
npm test --prefix frontend -- --coverage                      # with coverage

# Docker (always use V2 syntax: `docker compose`, never `docker-compose`)
docker compose --profile development up -d      # dev with hot reload
docker compose --profile production up -d       # production
docker compose up -d --build                    # rebuild after code changes
```

## Architecture

### Content pipeline
`frontend/content/*.mdx` (frontmatter + markdown) → loaded by `src/lib/content.ts` → rendered in React components. Experience, projects, skills, blog articles all follow this pattern.

### Knowledge system for AI
Private `/knowledge/` git submodule (or `/knowledge-examples/` fallback) → parsed by `src/lib/knowledge-loader.ts` (gray-matter for frontmatter) → compiled into system prompts for the LLM. Supports both MDX with depth data and raw `.md` files.

### Chat flow
User message → `src/components/chat/` UI → `POST /api/chat` → guardrails check (`src/lib/guardrails/`) → `src/lib/llm-client.ts` (OpenAI streaming) → SSE response → `src/lib/stream-handler.ts` parses chunks → ChatContext updates UI.

### Fit analysis flow
Job description → `POST /api/analyze` → guardrails → `src/lib/fit-analysis-prompt.ts` builds prompt → LLM streams JSON → `src/lib/fit-analysis-parser.ts` extracts structured result → FitAnalysisContext renders assessment.

### Key single-source-of-truth files
- `src/lib/portfolio-owner.ts` — owner identity (name, role, employer), used everywhere
- `src/lib/guardrails/guardrails-service.ts` — two configs: `CHAT_GUARDRAIL_CONFIG` (with off-topic check) and `FIT_ANALYSIS_GUARDRAIL_CONFIG` (without)

### State management
React Context + useReducer for chat, fit analysis, and transparency dashboard. Chat state persists to sessionStorage.

### Path aliases (tsconfig)
`@/*` → `./src/*`, also `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/types/*`, `@/content/*` → `./content/*`

## Conventions

- **Property-based tests**: Use `fast-check` with `{ numRuns: 3 }` by default. Only use property tests for parsers, transformations, and mathematical invariants — not for CRUD or authorization. Prefer example-based tests when a few scenarios cover all branches.
- **Modals**: Use `createPortal(modal, document.body)` for modals in nested components to avoid stacking context issues.
- **Streaming**: All LLM responses use Server-Sent Events (SSE). Never expose API keys or internal errors to the client.
- **Logging**: Use structured loggers from `src/lib/logger.ts` with context-based child loggers. LOG_LEVEL defaults to `info` (dev) / `warn` (prod).
- **Docker**: Always use `docker compose` (V2), never `docker-compose`. Rebuild with `--build` flag after code changes.

## Environment

Required: `OPENAI_API_KEY`. Optional: `OPENAI_MODEL` (default: gpt-4o-mini), `PORT` (default: 8087), `LOG_LEVEL`, `KNOWLEDGE_REPO` + `GITHUB_TOKEN` (for private knowledge in Docker builds). See `.env.example`.

## Specs

Feature specifications with requirements, design, and task breakdowns live in `.kiro/specs/001-007/`. Steering docs (guidelines) in `.kiro/steering/`.

## Development Principles

1. **Test-Driven Development**: Write or update tests first. Do not claim completion unless tests run and pass, or explicitly state why they could not be run.

2. **Small, Reversible, Observable Changes**: Prefer small diffs and scoped changes. Implement user-testable and visible changes before backend changes wherever feasible. Keep changes reversible where possible. Maintain separation of concerns; avoid mixing orchestration, domain logic, and IO unless trivial.

3. **Fail Fast, No Silent Fallbacks**: Validate inputs at boundaries. Surface errors early and explicitly. Assume dependencies may fail. No silent fallbacks or hidden degradation. Any fallback must be explicit, tested, and observable.

4. **Minimize Complexity (YAGNI, No Premature Optimization)**: Implement the simplest solution that meets current requirements and tests. Do not design for speculative future use cases. Optimize only with evidence.

5. **Deliberate Trade-offs: Reusability vs. Fit (DRY with Restraint)**: Apply DRY only to real, stable duplication. Avoid abstractions that increase cognitive load without clear benefit. Prefer fit-for-purpose code unless a second use case is concrete.

6. **Don't Assume—Ask for Clarification**: If requirements are ambiguous or multiple interpretations exist, ask. If proceeding is necessary, state assumptions explicitly and keep changes localized and reversible.

7. **Confidence-Gated Autonomy**: Proceed end-to-end only when confidence is high. Narrow scope and increase checks when confidence is medium. Stop and ask when confidence is low.

8. **Security-by-Default**: Treat all external input as untrusted. Use safe defaults and least privilege. Do not weaken auth, authz, crypto, or injection defenses without explicit instruction. Never introduce secrets into code. **NEVER modify user credentials, password hashes, auth tokens, or security-sensitive database rows unless the user explicitly instructs you to do so.** When testing requires authentication, check `scripts/` and documentation for test credentials first, then ask the user.

9. **Don't Break Contracts**: Preserve existing public APIs, schemas, and behavioral contracts unless explicitly instructed otherwise. If breaking changes are required, provide migration steps and compatibility tests.

10. **Risk-Scaled Rigor**: Scale rigor with impact: (1) Low risk — unit tests, lint/format. (2) Medium risk — integration tests, edge cases, rollback awareness. (3) High risk (security, auth, money, data loss, core flows) — explicit approval before destructive actions, targeted tests, minimal refactoring.