# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AI-powered interactive portfolio for Daniel Kreuzhofer (Senior Solutions Architect, AWS). Built with Next.js 16 + React 19 + TypeScript. Features an OpenAI-powered chatbot, fit analysis module (job description matching), transparency dashboard, and blog. All content is MDX-based in `frontend/content/`.

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
