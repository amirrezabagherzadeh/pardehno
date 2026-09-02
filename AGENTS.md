# Pardeh No agent guide

Pardeh No (`pardehno`) is a Persian, RTL-first movie and TV discovery application. It reads catalog data from TMDB, optionally enriches ratings with OMDb, and stores personal features in the browser. It does not stream full titles and has no user accounts or database.

## Repository map

- `src/app/` — Next.js App Router pages, layouts, states, and API Route Handlers
- `src/components/` — product components plus shared primitives in `ui/`
- `src/lib/tmdb/` — TMDB client, queries, localization, transforms, types, and errors
- `src/lib/storage/` — browser-only watchlist and recent-history stores
- `tests/unit/` — Vitest tests
- `tests/e2e/` — Playwright flows and screenshot coverage
- `tests/fixtures/` — deterministic local TMDB-compatible server
- `public/` — committed static assets
- `docs/` — detailed project documentation

## Stack and commands

Next.js 16.3 canary App Router, React 19, strict TypeScript, Tailwind CSS 4, Radix/shadcn primitives, Vitest, and Playwright. Use Node.js 20.9 or later and npm.

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run start
```

Use `npm run test:e2e:live` only when live TMDB credentials and network access are available. See `package.json` for the screenshot and focused E2E commands.

## Non-negotiable rules

- Always follow [`docs/engineering-rules.md`](docs/engineering-rules.md).
- Read [`docs/architecture.md`](docs/architecture.md) before architecture, backend, data, caching, database, or integration changes.
- Read [`docs/use-cases.md`](docs/use-cases.md) before changing product behavior or business rules.
- Read [`docs/design-guidelines.md`](docs/design-guidelines.md) before UI, UX, component, accessibility, or styling changes.
- Inspect the existing route, component, query, and test patterns before adding an implementation.
- Keep changes focused; do not reformat, regenerate, or modify unrelated files.
- Preserve the Server Component default. Add `"use client"` only for browser APIs, state, effects, or interactive boundaries.
- Keep TMDB, OMDb, proxy, and translation credentials server-only. Never expose secrets through `NEXT_PUBLIC_*` variables or documentation.
- Do not describe Pardeh No as a streaming/download service. Trailer playback is limited to TMDB-listed YouTube videos.
- Update the relevant documentation after meaningful behavior or architecture changes.
- Run validation proportional to the change, and report commands that fail or cannot run.

## Documentation routing

Start with [`README.md`](README.md), then use the document matching the change. Record user-visible changes under `CHANGELOG.md` → `Unreleased`; keep detailed rules in `docs/` rather than duplicating them here.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
