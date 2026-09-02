# Design guidelines

These guidelines describe the dominant implementation; they do not introduce a new design system. The visual source of truth is `src/app/globals.css`, shared primitives in `src/components/ui/`, and the existing product components.

## Visual principles

- Persian and RTL are defaults, not adaptations. Use logical properties (`start`, `end`, `ms`, `me`, `ps`, `pe`) and verify both desktop and mobile reading order.
- Keep imagery dominant with layered dark scrims rather than opaque content panels.
- Use a near-black cinematic canvas, restrained surfaces, bright blue actions, warm yellow ratings, and destructive pink/red only for destructive/error states.
- Favor dense, skimmable catalog rails and grids with clear titles and generous section rhythm.
- Personal features must state that they are local to the browser.

## Tokens

| Role | Current token/value |
| --- | --- |
| Background | `--background: #0b0d12` |
| Foreground | `--foreground: #f5f7fa` |
| Card/surface | `#131722` |
| Strong surface | `#1a2030` |
| Primary/cinema | `#21a7ff` |
| Muted text | `#a6adbb` |
| Destructive | `#ef476f` |
| Base radius | `0.625rem` |
| Focus ring | primary blue |
| Rating | hard-coded `#f6c945` in rating displays |
| Active browse filter | hard-coded gold around `#d5a924`/`#f6d45f` |

Use semantic Tailwind tokens (`bg-background`, `bg-card`, `text-muted-foreground`, `border-border`, `text-primary`) for general product UI. Preserve hard-coded colors only where the existing component has a deliberate cinematic/filter role.

## Typography

- Font stack: Vazirmatn Variable, Noto Sans Arabic, Tahoma, Arial, sans-serif.
- Body copy is commonly `text-sm` with `leading-7` or `leading-8` for Persian readability.
- Page titles use heavy `font-black`, usually `text-3xl`/`text-4xl`.
- Hero/detail titles scale from `text-4xl` to `text-6xl` or `text-7xl`.
- Eyebrow labels are small, bold, and primary blue.
- Use `text-balance` for large cinematic titles and truncation/line clamping for cards.

## Layout and spacing

- `.page-container`: centered, maximum 100rem, responsive inline gutters.
- `.browse-container`: nearly full width with 0.5rem inline gutters.
- `.section-space`: responsive vertical padding from 1.75rem to 3.75rem.
- Minimum supported document width is 320px.
- Poster cards use `2:3`; landscape browse cards use `16:10`; people commonly use `3:4`.
- Horizontal rails use overflow scrolling, snap alignment, hidden scrollbars, and fixed responsive card widths.
- Product grids progress from two poster columns or one landscape column on small screens to five/six columns on wide screens.

## Elevation, radii, and imagery

- Shared controls default to `rounded-lg`; dialogs/cards/panels often use `rounded-xl`.
- Browse filter surfaces use a deliberate 20px radius.
- Poster elevation uses `0 18px 48px rgba(0,0,0,.38)`.
- Dialogs and sheets use subtle borders/rings and backdrop blur.
- Media images should use `next/image`, `tmdbImage`, correct aspect-ratio wrappers, responsive `sizes`, and the committed fallback poster.
- Keep hero/detail scrims from `globals.css`; they have separate mobile treatments.

## Components

### Buttons and links

Reuse `Button` and its `default`, `outline`, `secondary`, `ghost`, `destructive`, and `link` variants. The shared primitive supplies disabled opacity, focus rings, icon sizing, and active press feedback. Product CTAs may override height/padding, as the hero and filter actions do.

Interactive icon-only controls require an accessible Persian label. Links that look like buttons should use `Button asChild` to preserve link semantics.

### Inputs and forms

Reuse `Input`, `Textarea`, `Label`, `Switch`, and shared selection primitives. Controls use rounded borders, dark transparent fills, blue focus rings, disabled opacity, and destructive invalid states. Keep visible field-level error copy near the control and pair labels with `htmlFor`.

Browse filters are a specialized exception: 56px dark controls, gold active/focus treatment, and a white apply action. Do not apply that pattern to ordinary forms.

### Cards and badges

Media cards combine a poster/backdrop, scrim, rating badge, type badge, optional adult/IMDb badge, title, year, and hover/focus scale. Reuse `MediaCard` instead of duplicating media URL/image/rating logic.

General information cards use `bg-card`, low-opacity white borders, and `rounded-xl`. Badges are compact pills; reserve primary fill for strong labels/actions.

### Dialogs, sheets, and overlays

Use Radix-backed shared primitives for focus management and escape behavior. Dialogs are centered by default; search intentionally sits near the top. Mobile navigation and browse filters use right-side Sheets consistent with RTL flow. Always provide a title/description, visually hidden when necessary.

### Navigation

The fixed header is transparent at the top and becomes a blurred dark surface after scrolling. Desktop navigation appears at `lg`; smaller layouts use a Sheet. Active desktop routes use a blue bottom rule. The footer provides quick and legal navigation.

## States

- **Loading:** route `PageSkeleton`, local `Skeleton` grids, or an inline spinning status with `aria-live` where results update.
- **Empty:** dashed low-contrast container, a relevant icon, concise explanation, and a recovery action when useful.
- **Error:** safe Persian message; route errors provide a retry action, and infinite browse provides inline retry.
- **Disabled/pending:** block pointer events and reduce opacity; do not rely on color alone.
- **Selected/pressed:** use `aria-current`, `aria-pressed`, `aria-selected`, or `aria-expanded` as appropriate.
- **Spoiler:** conceal text until an explicit reveal action.

## Responsive rules

- Test at minimum 320–390px, a tablet/medium breakpoint, 1280px, and a wide desktop.
- Replace desktop navigation/filter toolbars with Sheets on small screens.
- Avoid horizontal page overflow; only media rails and intended galleries scroll horizontally.
- Hide secondary poster art when detail/season layouts need more mobile space.
- Preserve touch targets and visible icon actions on mobile; hover-only affordances need an always-visible small-screen equivalent.

## Accessibility and motion

- Preserve `lang="fa"`, `dir="rtl"`, `DirectionProvider`, semantic landmarks, and heading IDs.
- Use native buttons/links and Radix semantics. Decorative images/icons use empty alt text or `aria-hidden`; meaningful images use Persian descriptions.
- Use `.focus-ring` or primitive focus-visible styles; never remove focus without a replacement.
- Announce async search/loading state and label dialogs/sheets.
- Global reduced-motion rules collapse animation and transition durations.
- Do not encode rating/error/selection using color alone.

## Component creation rules

1. Reuse a product component or `src/components/ui` primitive first.
2. Keep Server Components as the default; create a client boundary only for interaction/browser APIs.
3. Merge conditional classes with `cn`.
4. Use semantic tokens and logical RTL spacing.
5. Add or update accessible names, loading/empty/error states, responsive behavior, and tests with behavior changes.

## Current inconsistencies

- Shared dialog and sheet close buttons contain the English screen-reader label `Close`, while product-specific controls are labeled in Persian.
- Product areas mix semantic tokens with hard-coded dark/gold colors.
- Default shared button heights are compact (32px), while major product buttons frequently override them.
- The screenshot state test expects a filter dialog label that does not match the current visible Sheet title/trigger wording.
- Seeded comments visually resemble real community content although the feature is browser-local.
- The codebase has no light theme despite semantic dark/light-capable primitive classes; the root forces dark mode.
