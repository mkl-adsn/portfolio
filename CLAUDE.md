# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Components**: Place reusable Astro/React/Vue/Svelte/Preact components in `src/components/` (not yet created).
- **Static assets**: Files in `public/` are served as-is from the root (e.g. `public/favicon.svg` → `/favicon.svg`).
- **Config**: `astro.config.mjs` is the main Astro configuration entry point.
