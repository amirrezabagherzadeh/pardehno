# Design QA — Filimo-style browse filters

## Source and implementation

- Source visual truth: `C:\Users\amirr\AppData\Local\Temp\codex-clipboard-ca9365d2-6f91-4d43-9b0d-d6dd970a94c3.png`
- Implementation route: `http://127.0.0.1:3000/tv?country=IR`
- Browser-rendered implementation: `H:\Website\Movie Stream\artifacts\filimo-filter-implementation-2287x392.png`
- Source pixels: 2287 × 392 at 96 DPI.
- Implementation pixels: 2287 × 392 at 96 DPI.
- CSS viewport used for the implementation: 2297 × 394; the browser content capture normalizes to the exact 2287 × 392 source dimensions at density 1.
- State: dark desktop RTL, series browse page, filter panel expanded, Iran active, one active-filter chip.

## Comparison evidence

The source and implementation were opened together in the same visual comparison input at equal pixel dimensions. The full view was sufficient to judge both the overall hierarchy and the focused filter details because the source itself is a short component-region crop: top control row, active chip, section heading, horizontal filter surface, select widths, HD switch, and apply button are all readable at 1:1.

The final implementation matches the source structure closely:

- Nearly full-width dark canvas with a thin horizontal divider.
- Sort control, dashed active filter button and numbered badge, and removable Iran chip on the left.
- RTL section heading on the right.
- Rounded charcoal filter surface with eight aligned columns.
- White apply button at the left, compact HD switch, year/genre/country/age/language controls, and media selector flowing right-to-left.
- Gold active-country border/text state, restrained white borders, and equivalent control height/density.

## Required fidelity surfaces

- Fonts and typography: Vazirmatn preserves the heavy Persian UI hierarchy, compact labels, readable wrapping, and optical weight visible in the reference. Dynamic TMDB titles use truncation where needed.
- Spacing and layout rhythm: the final filter surface uses full-width 8 px gutters, a 20 px radius, consistent 12 px gaps, 56 px controls, and source-like top-row/panel separation. No horizontal overflow was found at 390, 1280, or 2297 CSS px.
- Colors and tokens: background, surface, border opacity, white CTA, muted text, and gold active state align with the source while retaining پرده‌نو’s blue navigation accent outside the matched component.
- Image quality: browse results use real TMDB `w780` backdrops with direct CDN loading when the local proxy is active. No placeholder drawings or fake image assets are used, and the final browser pass found no broken images.
- Copy and content: controls use concise Persian labels matching the reference intent; results, titles, descriptions, poster/backdrop paths, ratings, and trailer keys come from live TMDB data.
- Icons and affordances: existing Lucide filter, close, and chevron icons use consistent stroke weight and alignment; native selects, the switch, buttons, and mobile Sheet are keyboard-accessible and visibly focusable.

## Primary interactions tested

- Live `/tv` discovery returns 20 real TMDB titles and reports the real result total.
- Country `IR` applies successfully and returns 571 Iranian series in the tested response.
- Switching the media selector from series to movies preserves the Iran filter and navigates to `/movies?country=IR`.
- Mobile filter Sheet opens at 390 × 844 without page overflow and contains every desktop filter.
- A live movie detail page returned a Persian overview and an official TMDB YouTube trailer; the trailer dialog opened with a `youtube-nocookie.com` embed key from TMDB.
- Browser diagnostics were enabled during the final interaction pass; the earlier development-origin warning was fixed with `allowedDevOrigins`, and the smooth-scroll warning was fixed with the documented root attribute.

## Comparison history

- P1 — Existing browse design used a right sidebar and portrait posters instead of the supplied full-width Filimo filter pattern. Replaced it with the horizontal RTL toolbar, expandable panel, and dense landscape result grid. Post-fix evidence: exact-dimension comparison file above.
- P1 — The preview was still using a five-item deterministic fixture, so users could not browse the real catalog. Confirmed valid TMDB credentials, added a server-only outbound proxy path for this Windows network, and restarted on live TMDB. Post-fix evidence: 20 cards per page, 277,421 series in the default response, and 571 Iranian series for the tested filter.
- P1 — Next.js blocked development client bundles when opened through `127.0.0.1`, leaving dialogs and client controls unhydrated. Added the documented `allowedDevOrigins: ["127.0.0.1"]`. Post-fix evidence: the live official-trailer dialog opens successfully.
- P1 — Next image optimization could not reach the TMDB CDN through the local proxy. Disabled server-side optimization only when `OUTBOUND_PROXY_URL` is configured so the browser loads real TMDB backdrops directly. Post-fix evidence: 22 loaded images and zero broken images in the inspected series viewport.
- P2 — First filter implementation rendered the desktop field panel twice. Removed the unconditional duplicate render. Post-fix evidence: one eight-column panel in the final comparison.
- P2 — The initial 112rem browse max-width created 248 px side margins at the source width. Changed browse pages to 8 px gutters and added wide-screen grid tracks. Post-fix evidence: panel edges align with the source at 2287 px.
- P2 — TV pages previously exposed movie-only sort values. Added media-specific sorting and server-side allow-list validation before TMDB requests.
- P2 — The mobile Sheet stayed open after applying filters. Made the Sheet controlled and close it before client navigation.

## Findings

No actionable P0, P1, or P2 discrepancies remain. The retained P3 difference is the sticky پرده‌نو site header visible at the top of the implementation crop, while the supplied Filimo crop begins below unrelated page content; the filter component itself is aligned and the independent brand navigation is intentional.

## Implementation checklist

- [x] Match desktop filter hierarchy, sizes, surface, and active state.
- [x] Preserve responsive mobile filtering.
- [x] Connect controls to live TMDB Discover parameters.
- [x] Validate real images, Persian descriptions, trailers, pagination, and media switching.
- [x] Clear console errors/warnings and horizontal overflow.

final result: passed

---

# Design QA — Search dialog close button

## Source and implementation

- Source visual truth: `C:\Users\amirr\AppData\Local\Temp\codex-clipboard-19794492-236d-4712-95c4-3ea8ed7b5479.png`
- Browser-rendered implementation: `H:\Website\Movie Stream\artifacts\search-dialog-close-desktop.png`
- Mobile implementation: `H:\Website\Movie Stream\artifacts\search-dialog-close-mobile.png`
- Combined comparison evidence: `H:\Website\Movie Stream\artifacts\search-dialog-close-comparison.png`
- Viewport: 595 × 253 CSS px for the source-sized desktop check; 375 × 667 CSS px for the mobile check.
- Pixel dimensions and density: source 595 × 253, desktop implementation 595 × 253, mobile implementation 375 × 667, all at device scale factor 1; no density normalization was needed.
- State: dark RTL homepage with the empty search dialog open.

## Comparison evidence

The source and desktop implementation were combined side by side at equal pixel dimensions. The focused search-header region is readable at 1:1, so a separate crop was not needed. In the source, the close button is absolutely positioned over the input border. In the implementation, it occupies a dedicated 28 × 28 px flex item beside the 44 px-high input with an 8 px gap. Browser geometry confirmed no overlap at either viewport.

The surrounding dialog width and changing hero background are existing responsive/dynamic product behavior and were not part of this focused placement fix.

## Required fidelity surfaces

- Fonts and typography: the existing Vazirmatn search placeholder, size, weight, line height, truncation, and RTL alignment are unchanged.
- Spacing and layout rhythm: the close control is vertically centered in the input row, retains the existing 12 px container padding, and has a stable gap from the input on desktop and mobile.
- Colors and visual tokens: existing surface, border, muted icon, hover, and focus colors are preserved.
- Image quality and asset fidelity: no image assets were changed; the existing Lucide close icon remains sharp and consistent with the search icon.
- Copy and content: the placeholder and search content are unchanged; the close control now has the Persian accessible label `بستن جستجو`.

## Primary interactions tested

- Opened search from the header at 595 × 253 and 375 × 667.
- Confirmed the input and close-button rectangles do not intersect at either viewport.
- Clicked the close button and confirmed the dialog becomes hidden.
- Checked browser console errors: none found.

## Comparison history

- P2 — The close button overlapped the search input and its border because it was absolutely positioned without reserved RTL space. Disabled the generic floating close control for this dialog and placed a dedicated accessible close button in the search row. Post-fix evidence: the combined comparison and desktop/mobile screenshots above; measured overlap is `false` in both viewports.

## Findings

No actionable P0, P1, or P2 discrepancies remain for the requested close-button placement. No P3 follow-up is required.

## Implementation checklist

- [x] Keep the close button inside the search header flow.
- [x] Preserve RTL order and responsive sizing.
- [x] Preserve keyboard/accessibility semantics.
- [x] Verify close behavior and console state.

final result: passed
