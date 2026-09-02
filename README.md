<div align="center">
  <img src="public/images/pardehno-mark.png" alt="Pardeh No logo" width="112" />

  <h1>پرده‌نو <br /> Pardeh No</h1>

  <p><strong>A cinematic, RTL-first Persian discovery experience for movies and TV.</strong></p>

  <p>
    <a href="#technology"><img src="https://img.shields.io/badge/Next.js-16.3-111827?logo=nextdotjs&logoColor=white" alt="Next.js 16.3" /></a>
    <a href="#technology"><img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" alt="React 19" /></a>
    <a href="#technology"><img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript strict" /></a>
    <a href="#development-and-validation"><img src="https://img.shields.io/badge/tests-Vitest_%2B_Playwright-6e56cf?logo=vitest&logoColor=white" alt="Vitest and Playwright" /></a>
  </p>

  <p>
    <a href="#installation">Get started</a> ·
    <a href="#features">Explore features</a> ·
    <a href="#documentation">Read the docs</a>
  </p>
</div>

<p dir="rtl" align="center">پرده‌نو یک تجربهٔ سینمایی، واکنش‌گرا و راست‌به‌چپ برای کشف فیلم و سریال است.</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/amirrezabagherzadeh/pardehno/aa426ae852a54456a6a0e6d39db4fb1727632631/public/images/home-page.png" alt="Full Pardeh No home page from header to footer, with Persian RTL film discovery hero and catalog rails" width="100%" />
</p>

Pardeh No (`پرده‌نو`) is a responsive Persian web application for discovering movies, TV shows, seasons, episodes, and people. It combines localized TMDB data with a dark, RTL-first interface and browser-local personal features.

> Pardeh No is not a video streaming or download service. “Watch Trailer” embeds only YouTube videos returned by TMDB, and availability information links to external legal providers.

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎬 Discover</h3>
      <p>Browse trending, popular, current, upcoming, top-rated, and genre collections. Fine-tune results by media type, sort, language, country, genre, year, family suitability, and artwork availability.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🔎 Explore deeply</h3>
      <p>Open rich title pages for metadata, cast and crew, galleries, seasons, episodes, recommendations, providers, and TMDB-listed trailers.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🇮🇷 Persian by design</h3>
      <p>RTL navigation, Persian canonical slugs, localized catalog data, dynamic metadata, Open Graph previews, and structured data are built in.</p>
    </td>
    <td valign="top">
      <h3>✨ Personal, private, local</h3>
      <p>Keep a watchlist, recently viewed titles, recent searches, and comments in your browser with no account or server-side profile required.</p>
    </td>
  </tr>
</table>

> **Trailer-only experience:** Pardeh No does not stream or download full titles. Trailers are limited to TMDB-listed YouTube videos, and availability links point to external legal providers.

## Technology

- Next.js `16.3.0-canary.93` App Router and React 19
- TypeScript 5 in strict mode
- Tailwind CSS 4 with CSS-variable tokens
- Radix UI/shadcn primitives and Lucide icons
- Self-hosted Vazirmatn variable font
- Vitest, Testing Library, and Playwright
- TMDB, optional OMDb, MyMemory translation, YouTube privacy-enhanced embeds, and provider data supplied through TMDB

## Prerequisites

- Node.js 20.9.0 or later (the installed Next.js package declares `>=20.9.0`)
- npm
- One TMDB credential: a read access token or a v3 API key

## Installation

```bash
npm ci
```

Create `.env.local` manually at the repository root. Do not commit real values:

```dotenv
# Provide one of these server-only credentials.
TMDB_READ_ACCESS_TOKEN=
TMDB_API_KEY=

# Optional integrations and overrides.
OMDB_API_KEY=
TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OUTBOUND_PROXY_URL=
PERSIAN_TRANSLATION_ENABLED=true
PERSIAN_TRANSLATION_EMAIL=
```

`TMDB_READ_ACCESS_TOKEN`, `TMDB_API_KEY`, `OMDB_API_KEY`, `OUTBOUND_PROXY_URL`, and `PERSIAN_TRANSLATION_EMAIL` are read only by server modules. `NEXT_PUBLIC_SITE_URL` is intentionally public and is used as the metadata base URL.

The working tree currently has no `.env.example`, although Git history contains one. **Needs confirmation:** whether its deletion is intentional. Restore or recreate it before instructing contributors to copy it.

## Development and validation

```bash
npm run dev             # Development server
npm run lint            # ESLint over the repository
npm run typecheck       # Generate Next route types, then run tsc --noEmit
npm test                # Vitest unit suite
npm run test:watch      # Vitest watch mode
npm run test:e2e        # Deterministic desktop and mobile Playwright suite
npm run test:e2e:states # Focused interaction/state suite
npm run test:e2e:live   # Core flow against live upstream services
npm run screenshots     # Capture key route screenshots
npm run build           # Optimized production build
npm run start           # Serve the completed production build
```

The default Playwright configuration starts both a local TMDB-compatible fixture on port `4010` and Next.js on port `3000`. The live configuration requires valid credentials and upstream network access.

## Data behavior

TMDB requests are made in `fa-IR` and `en-US`, then merged so missing Persian fields can fall back to English data. Missing English text is translated server-side through MyMemory unless `PERSIAN_TRANSLATION_ENABLED=false`; translation failures return the original text. List, detail, genre, video, OMDb, and translation calls use different revalidation periods, while search and the client-facing discovery API opt out of response caching.

The optional `OUTBOUND_PROXY_URL` is used by TMDB and MyMemory requests. The OMDb client currently uses the standard server `fetch` path.

## Project structure

```text
src/
├── app/                 # Routes, metadata, error/loading states, API handlers
├── components/
│   ├── browse/          # Filters and infinite discovery grid
│   ├── details/         # Movie/TV detail composition
│   ├── layout/          # Header, footer, and legal layout
│   ├── media/           # Cards, carousels, trailers, watchlist, sharing
│   ├── search/          # Instant search dialog
│   ├── storage/         # Browser-local collection pages
│   └── ui/              # Shared Radix/shadcn primitives
└── lib/
    ├── storage/         # localStorage-backed external stores
    └── tmdb/            # Upstream client, queries, transforms, and types
tests/
├── unit/
├── e2e/
└── fixtures/
```

## Documentation

- [Architecture](docs/architecture.md)
- [Product use cases](docs/use-cases.md)
- [Design guidelines](docs/design-guidelines.md)
- [Engineering rules](docs/engineering-rules.md)
- [Changelog](CHANGELOG.md)
- [AI agent guide](AGENTS.md)

## Build and deployment

`npm run build` produces the production application and `npm run start` serves it as a Node.js process. `next.config.ts` allows TMDB images and conditionally disables image optimization in fixture/proxy modes. No Dockerfile or committed CI/CD workflow is present. Local Vercel project metadata is ignored.

**Needs confirmation:** the intended production hosting target, environment-variable provisioning process, and CI release checks.

## Current limitations

- No authentication, database, backend user profile, or cross-device synchronization
- Browser data is lost when site storage is cleared
- Comments are local only; seeded sample comments are displayed when no saved list exists
- “HD” filtering checks for both poster and backdrop paths, not source resolution
- Movie quality labels and TV episode chips in the availability panel are explicitly presentational; full playback/download is unavailable
- Search has no visible pagination controls, even though the page parameter is parsed
- No structured logging, analytics, or monitoring integration is implemented
- Upstream content, translations, image quality, and availability vary by provider data

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Posters, images, metadata, credits, and videos belong to their respective rights holders. Watch-provider information exposed by TMDB includes JustWatch attribution and external links.
