# Frontend & design-system guide

How this project does CSS, design tokens, and components. These are conventions to
follow, not suggestions — they're what keeps the codebase consistent. This is the
canonical reference for both people and AI agents; `CLAUDE.md` summarises the
non-negotiables and points here.

## Principles

- **Two layers of tokens.** Primitives (raw values) → semantic aliases (roles).
  Components consume the semantic/named layer, never bare literals — except the
  deliberate escape hatches below.
- **A scale needs a *rule*, not a small count.** Every value sits on a legible
  progression (colours on a grey ramp, spacing on a 4px grid). Arbitrariness is the
  enemy, not the number of steps — ten predictable values beat five random ones.
- **Semantic aliases are earned.** Add one only when a value recurs with a *stable*
  meaning (~3+ uses). A token used once, or one whose value legitimately varies by
  context, doesn't belong. (We deliberately did *not* add `--space-section` — section
  rhythm genuinely varies, so a single token would lie.)
- **Escape hatches are legal.** Genuine one-offs — optical nudges (a `-12px`
  paragraph pull), mechanism offsets (the button's `-4px` press overlap), local
  z-index sibling ordering — stay literals, ideally with a one-line "why". The scale
  absorbs the common *rhythm*, not every pixel.
- **One source of truth per thing.** Type specs live in `typography.css`; a component
  tweaks, it never re-declares. Storybook reads token values live from the CSS.
  `global.css` is the single import list.

## Styles file map

`src/styles/` — one concern per file, all aggregated by **`global.css`** (the only
import list; both the app and Storybook load it):

| File | Owns |
| :--- | :--- |
| `colors.css` | Colour primitives (greys + alpha overlays) and semantic aliases (`--type-*`, `--surface-*`, `--border-*`, `--backdrop-*`, `--symbol-*`), plus the dark-mode remap. |
| `typography.css` | `@font-face`, `--font-*`, the `.type-*` classes, and prose (`.case-body`) styling. **All type specs live here.** |
| `spacing.css` | `--space-*` 4px ramp + `--space-gutter`. |
| `border-radius.css` | `--border-radius-*`. |
| `z-index.css` | `--z-*` global stacking scale. |
| `motion.css` | `--duration-*`, `--ease-*`. |
| `base.css` | Reset, `:focus-visible`, the theme-crossfade transition, reduced-motion, custom cursor, scrollbar. |
| `layout.css` | `.container*` gutters, page background + vignette. |
| `animations.css` | Scroll-reveal / halftone effect CSS. |
| `components/<name>.css` | One file per reusable component (unscoped, BEM-ish classes). |

Custom properties resolve at *use* time, so import order rarely matters — but keep the
token files first (they already are).

## Design tokens

| Family | File | Naming | Example |
| :--- | :--- | :--- | :--- |
| Colour primitives | `colors.css` | ramp position | `--grey-700`, `--grey-900-040` |
| Colour semantic | `colors.css` | role | `--type-primary`, `--surface-9`, `--border-strong` |
| Spacing | `spacing.css` | **value** (`N` = `Npx`) | `--space-24` → 24px |
| Radius | `border-radius.css` | size role | `--border-radius-default` |
| Z-index | `z-index.css` | layer role | `--z-nav`, `--z-modal` |
| Duration | `motion.css` | speed role | `--duration-fast` |
| Easing | `motion.css` | role | `--ease-emphasized` |

**Convention:** primitives are named by value or ramp position; semantic aliases by
role. Spacing is value-named because its steps carry no inherent semantics; colour /
z-index / motion are role-named because they do.

**Using & extending:**
- Reach for an existing token first.
- Need a value that isn't on a scale? If it's *on the grid* (e.g. a 4px multiple),
  add the ramp step. If it's *off-grid*, it's probably an optical one-off → literal
  with a comment, not a new token.
- Add a *semantic alias* only when a value recurs with one stable meaning.
- The token files are self-documenting — every value has an inline comment on what
  it's for. Keep that up when you add one.

**Z-index specifically:** `--z-*` is only for values competing on the *page root*
stacking context. Layering that merely orders siblings *inside* a component's own
context (a button face over its edge, lightbox chrome over the image) stays a small
literal (`1`, `2`) — that means "above my sibling", not "level N of the page". Don't
promote it.

## Typography

- **Every type spec lives in `typography.css`** — as a `.type-*` class, or by adding a
  component/structural selector to an existing type rule (e.g.
  `.type-body, .case-body p, .case-split__text`).
- **Components compose, they don't re-declare.** A component's CSS may override
  *deltas* (weight, colour) but must not restate font-family/size/tracking. If you're
  copying a type spec into a component, you're doing it wrong.
- **Promote recurring bespoke type to a named style.** When the same non-ramp spec
  shows up across components (as the 16px caption did), add a `.type-*` for it instead
  of repeating it. Genuinely one-off display type (the 80px case hero) may stay local,
  commented as intentional.
- Dark mode drops some font weights a step for optical parity — see the dark-mode
  block in `typography.css`.

## Components & Storybook

Storybook uses the HTML renderer (`@storybook/html`), so stories write markup as HTML
strings and rely on globally-loaded CSS — which is why component CSS lives in
standalone stylesheets, **never** in an Astro scoped `<style>`.

To add or refactor a reusable UI component:

1. **CSS** → `src/styles/components/<name>.css`: plain, unscoped classes with a
   BEM-ish prefix (`.skill-tag__name`). The `.astro` file is markup-only, with a
   comment pointing to the stylesheet.
2. **Register** the stylesheet in `src/styles/global.css` (only there — Storybook
   loads the same `global.css`, so there's no second list to keep in sync).
3. **Story** at `src/stories/<Name>.stories.ts` rendering the real class names (no
   inlined `<style>`). Primitive catalogs (colour, type, icons, spacing…) go under the
   `Design System/` title; components under `UI/`.

Storybook is living documentation: catalog stories **read token values live from the
CSS** (never hardcode a hex/px in a story) so they can't drift, and there's a
light/dark theme toolbar — check both.

Page-level sections in `src/layouts/` are content/animation-coupled compositions and
are **not** storied.

## Icons

- One `currentColor` SVG per icon in `src/icons/`. Colour comes from `--symbol-*`
  tones via `icon.css`, so one file serves every theme and tone.
- Names are typed: `ICON_NAMES` in `src/scripts/icons.ts` is the source of truth for
  the `IconName` union, with a dev-time guard that throws if the tuple and the files on
  disk drift. **A mistyped icon name is a compile error.**
- Use the `<Icon>` component in `.astro`; use `iconMarkup()` for JS-injected icons
  (carousel/lightbox).

## Theming

- Light mode = base `:root`. Dark mode = `:root[data-theme="dark"]` **remapping the
  semantic colour aliases only** — primitives don't change and components don't branch
  on theme (bar the documented optical type-weight tweaks).
- `data-theme` is applied before first paint by an inline script in `BaseLayout`; the
  toggle (`theme.ts`) keeps it and `localStorage` in sync.

## Motion & accessibility

- All transitions/animations use `--duration-*` / `--ease-*`. Durations collapse to
  ~0 under `prefers-reduced-motion` (`base.css`); JS-driven motion checks
  `prefersReducedMotion()` (`motion.ts`), and effects that break without their full
  pipeline are gated (custom cursor, halftone reveal).
- Interactive components carry real ARIA — the skills filter is a `radiogroup` with
  roving arrow-key focus; the lightbox manages focus and labels. Keyboard focus uses
  `:focus-visible`. Keep that bar for anything new.

## Quality gates

- CI runs `astro check` (types + `.astro`), `astro build`, and `build-storybook` — a
  type error or a broken story fails the build. Run `npm run check` locally first.
- **Verify frontend changes by driving the app**, not just building — confirm the
  computed styles/behaviour actually changed (e.g. a quick headless-browser
  computed-style assertion), especially for tokens, theming, and motion.
- Before committing, run `npm run build:cv` and include `public/cv.pdf` (see
  `CLAUDE.md`).
