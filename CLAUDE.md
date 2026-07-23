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

## Architecture

This is a minimal [Astro](https://astro.build) project (v6) using strict TypeScript.

- **Routing**: File-based. Any `.astro` or `.md` file in `src/pages/` becomes a route matching its filename.
- **Components**: Place reusable Astro/React/Vue/Svelte/Preact components in `src/components/`. Also add them to Storybook (see below).
- **Static assets**: Files in `public/` are served as-is from the root (e.g. `public/favicon.svg` → `/favicon.svg`).
- **Config**: `astro.config.mjs` is the main Astro configuration entry point.

## Components & Storybook

Storybook uses the HTML renderer (`@storybook/html`), so stories cannot import `.astro` files — they write the component's markup as an HTML string and rely on its CSS being loaded globally. To keep one source of truth for both the app and Storybook, every reusable component's CSS lives in a standalone stylesheet, **not** in an Astro scoped `<style>` block.

When adding or refactoring a reusable UI component:

1. Put the component's CSS in `src/styles/components/<name>.css` (plain, unscoped classes — use a BEM-ish prefix like `.skill-tag__name` to avoid collisions). The `.astro` file carries only markup, with a comment pointing to its stylesheet.
2. Import that stylesheet in **both**:
   - `src/styles/global.css` (loads it for the app), and
   - `.storybook/preview.ts` (loads it for Storybook).
3. Add a story at `src/stories/<Name>.stories.ts` that renders the real class names (no inlined `<style>`). Design tokens (`--grey-900`, `--font-sans`, …) come from `tokens.css`, which preview.ts already loads.

Design-system primitives (colors, icons, typography) live as catalog stories under the `Design System/` title; components under `UI/`. The page-level sections in `src/components/sections/` are content/animation-coupled compositions and are not storied.
