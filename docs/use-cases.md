# Product use cases

The application has one product role: an unauthenticated guest. External catalog providers are supporting systems, not users. All personal actions remain in the current browser.

## Discover content from the home page

- **Actor:** Guest
- **Goal:** Find a movie or TV show from featured and categorized content.
- **Preconditions:** A valid TMDB credential and usable upstream response.
- **Main flow:** Open `/`; view rotating hero items, featured titles, catalog rails, and an optional recently viewed rail; follow a card or hero action to a canonical detail URL.
- **Alternative flows:** Individual home sections may be omitted when an upstream request fails; the page continues if hero data exists.
- **Failure cases:** If no hero data can be produced, the route error boundary displays a safe recovery state.
- **Rules:** Hero titles require a backdrop and a release/air date not later than today. Full playback is not offered.
- **Code:** `src/app/page.tsx`, `src/lib/tmdb/queries.ts`, `src/components/home/`, `src/components/media/`
- **Acceptance:** The page is RTL, has a visible level-one title in the hero, and links cards to media detail routes.

## Browse and filter movies or TV

- **Actor:** Guest
- **Goal:** Narrow the TMDB catalog and load more matching titles.
- **Preconditions:** `/movies`, `/tv`, or a movie genre route is available.
- **Main flow:** Choose media type, sort, language, country, genre, year, family mode, and/or “HD”; submit; receive URL-backed results; scroll to load additional pages through `/api/discover`.
- **Alternative flows:** Switching media type redirects to the matching top-level route while preserving applicable filters. Mobile users edit filters in a right-side Sheet.
- **Failure cases:** No matches produce an empty state. Later-page failures expose a retry control.
- **Rules:** Invalid sort values fall back to popularity. Top-rating browse requires at least 1,000 votes. TMDB pagination is capped at 500. Family movies use US certification up to PG-13; family TV adds genre `10762`. “HD” only requires poster and backdrop paths.
- **Code:** `src/components/browse/`, `src/app/api/discover/route.ts`, `src/lib/tmdb/queries.ts`
- **Acceptance:** Filters are represented in the URL, media-type-specific sorting is enforced, duplicate infinite-scroll items are ignored, and mobile submission closes the Sheet.

## Search the catalog

- **Actor:** Guest
- **Goal:** Find media or people by name.
- **Preconditions:** A query of at least two trimmed characters.
- **Main flow:** Open the header dialog by button or Ctrl/Cmd+K; enter a query; after a 300 ms debounce, view grouped media/people results; open a result or the full `/search` page.
- **Alternative flows:** The full page filters the current response by all/movie/TV/person. Up to ten recent query strings can be reopened or cleared.
- **Failure cases:** Short queries return no request results; no match, loading, and safe upstream error states are displayed.
- **Rules:** Search uses TMDB multi-search with adult content excluded and `no-store` caching.
- **Code:** `src/components/search/search-dialog.tsx`, `src/app/search/page.tsx`, `src/app/api/search/route.ts`
- **Acceptance:** The dialog is keyboard-accessible, announces loading/result counts, and recent searches persist only in this browser.

## View movie or TV details

- **Actor:** Guest
- **Goal:** Review localized information and related content.
- **Preconditions:** Positive numeric ID and a TMDB record.
- **Main flow:** Load the detail; receive a permanent redirect if the slug is not canonical; review overview, rating, genres, cast/crew, gallery, availability, and recommendations; optionally open a trailer, save, share, or navigate to people/seasons.
- **Alternative flows:** OMDb rating data replaces the displayed TMDB rating when a valid optional response exists. Missing optional sections are omitted.
- **Failure cases:** Invalid or missing IDs render 404; other TMDB failures reach the route error boundary.
- **Rules:** Trailer ranking accepts YouTube only, prioritizing official trailers and Persian-language records. Availability and quality UI does not provide full playback/download.
- **Code:** `src/app/movie/[id]/[slug]/page.tsx`, `src/app/tv/[id]/[slug]/page.tsx`, `src/components/details/media-detail-page.tsx`
- **Acceptance:** Canonical metadata and JSON-LD are emitted, the title is localized, and no upstream credential reaches the client.

## Inspect a TV season

- **Actor:** Guest
- **Goal:** Review season and episode metadata.
- **Preconditions:** Positive TV ID, non-negative integer season number, and matching records.
- **Main flow:** Follow a season link from TV details; view season metadata and episode cards with date, runtime, rating, overview, and guest stars when present.
- **Failure cases:** Invalid/missing TV or season records render 404.
- **Code:** `src/app/tv/[id]/season/[seasonNumber]/page.tsx`, `src/lib/tmdb/queries.ts`
- **Acceptance:** The page links back to the TV detail route and lists the localized episode response.

## Inspect a person and credits

- **Actor:** Guest
- **Goal:** Review biography and filter known credits.
- **Preconditions:** Positive person ID and a TMDB person record.
- **Main flow:** Open a person route; view profile, biography, birth information, and deduplicated credits; filter by media type, department, and year.
- **Alternative flows:** Clear filters or view an empty result.
- **Rules:** Credits are deduplicated by media type and ID, sorted by popularity, and limited to 60.
- **Code:** `src/app/person/[id]/[slug]/page.tsx`
- **Acceptance:** Non-canonical slugs redirect and filter values remain URL-backed.

## Manage a watchlist

- **Actor:** Guest
- **Goal:** Save or remove titles for later.
- **Preconditions:** Browser storage is available.
- **Main flow:** Toggle the bookmark on a card/detail page; view saved media at `/watchlist`; toggle again to remove.
- **Alternative flows:** Cross-tab storage events refresh open tabs.
- **Failure cases:** Malformed stored data is discarded. Browser storage denial/quota errors are not surfaced by the current implementation.
- **Rules:** The newest saved item is first; the collection is capped at 250 summaries.
- **Code:** `src/lib/storage/media-store.ts`, `src/components/media/watchlist-button.tsx`, `src/components/storage/stored-media-page.tsx`
- **Acceptance:** Saved media persists across reloads in the same browser and the header count reflects the collection.

## Track recently viewed titles

- **Actor:** Guest
- **Goal:** Return to recently opened media.
- **Main flow:** Opening a movie/TV detail pushes its summary; `/recently-viewed` and the home rail show recent items.
- **Rules:** Duplicate media moves to the front; at most 30 items are kept.
- **Code:** `src/components/media/recent-view-tracker.tsx`, `src/components/media/recently-viewed-rail.tsx`, `src/lib/storage/media-store.ts`
- **Acceptance:** Detail navigation updates browser-local history without a server write.

## Create and manage a local comment

- **Actor:** Guest
- **Goal:** Record a personal reaction to a title.
- **Preconditions:** A movie/TV detail page and browser storage.
- **Main flow:** Enter a 2–40 character name, 10–1,000 character body, integer rating 1–5, and spoiler choice; save; optionally mark helpful, edit, reveal/hide a spoiler, or confirm deletion.
- **Alternative flows:** Field errors block invalid submission.
- **Rules:** Comments are stored per media key and never sent to other users. Three hard-coded sample comments appear when no non-empty saved list exists.
- **Code:** `src/components/comments/comments-section.tsx`, `src/lib/comments.ts`
- **Acceptance:** Validation matches the stated limits, spoiler text starts hidden, and destructive deletion requires confirmation.

**Needs confirmation:** whether seeded sample comments are intended in production or should be labeled more explicitly as examples.

## Share a detail page

- **Actor:** Guest
- **Goal:** Share the current canonical page.
- **Main flow:** Use the native Web Share API when available; otherwise copy the current URL to the clipboard and show short confirmation.
- **Failure cases:** Dismissing or failing the share action is intentionally silent.
- **Code:** `src/components/media/share-button.tsx`

## View legal and informational pages

- **Actor:** Guest
- **Goal:** Read product, privacy, terms, and copyright statements.
- **Routes:** `/about`, `/privacy`, `/terms`, `/copyright`
- **Code:** `src/app/*/page.tsx`, `src/components/layout/legal-page.tsx`
