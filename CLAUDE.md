# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Resonse style

Keep narration and explanations of what you are about to do to a minimum. Act, then give a brief summary. No preamble, no "I'll now...", no "Let me...", no post-action recaps.

## Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro add`, `astro check`) |
| `npm run build:cv` | Full site build **and** regenerate `public/cv.pdf` |
| `npm run generate:cv` | Regenerate `public/cv.pdf` from the existing `dist/` build |

## Committing

Before committing a branch, **always** run `npm run build:cv` to regenerate the
CV PDF, then include `public/cv.pdf` in the commit. Don't check whether CV
content changed first — unconditionally regenerating is foolproof and faster
than deciding, so just do it every time.

(`npm run generate:cv` re-renders the PDF from an existing `dist/` build if you
already have one up to date, but `build:cv` is the safe default. The deploy
`build` script deliberately does **not** generate the PDF — see
`scripts/generate-cv-pdf.mjs`.)

## Architecture

This is a minimal [Astro](https://astro.build) project (v6).

- **Routing**: File-based. Any `.astro` or `.md` file in `src/pages/` becomes a route matching its filename.
- **Components**: Place reusable Astro/React/Vue/Svelte/Preact components in `src/components/`. Also add them to Storybook (see below).
- **Static assets**: Files in `public/` are served as-is from the root (e.g. `public/favicon.svg` → `/favicon.svg`).
- **Config**: `astro.config.mjs` is the main Astro configuration entry point.

## Frontend & design system

The full conventions live in **[`docs/frontend.md`](./docs/frontend.md)** — read it
before non-trivial CSS, token, or component work. The load-bearing rules:

- **Tokens, not literals.** Colour, spacing, radius, z-index, and motion are
  tokenised in `src/styles/{colors,spacing,border-radius,z-index,motion}.css`. Use the
  tokens; keep raw values only for genuine one-offs (optical nudges, mechanism
  offsets, local sibling z-index) and comment them. Add a *semantic* alias only when a
  value recurs with one stable meaning.
- **Type lives in `typography.css`.** Components compose the `.type-*` classes (or add
  a selector to a type rule) and override only deltas (weight/colour) — they never
  restate font-family/size/tracking.
- **Component CSS → `src/styles/components/<name>.css`** (plain unscoped BEM-ish
  classes, not Astro scoped `<style>` — stories can't import `.astro`). The `.astro`
  file is markup-only; register the stylesheet in `src/styles/global.css` **only**
  (Storybook loads the same `global.css`); add a `src/stories/<Name>.stories.ts` that
  renders the real class names. Catalogs under `Design System/`, components under
  `UI/`. Catalog stories read token values **live from the CSS** — never hardcode.
- **Theme** via `:root[data-theme="dark"]` remapping semantic colour aliases only;
  components don't branch on theme. Storybook has a light/dark toolbar — check both.
- **Verify** frontend changes by driving the app (computed styles / behaviour), and
  keep `astro check` + `build-storybook` green (CI enforces both).

Page-level sections in `src/layouts/` (alongside `BaseLayout.astro`) are
content/animation-coupled compositions and are not storied.
