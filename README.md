# Portfolio — Mikael Andersson

Personal portfolio site built with [Astro](https://astro.build) (v6): case studies, CV, and contact details, deployed as a static site.

**Worth a look if you're skimming:**
- [`src/scripts/halftone.ts`](./src/scripts/halftone.ts) — a scroll-scrubbed CMYK halftone reveal built from CSS custom properties + blend modes, no canvas.
- [`src/scripts/scrollReveal.ts`](./src/scripts/scrollReveal.ts) — heading "draw-in" effect that uses the Range API to detect real rendered line breaks, so it holds up at fractional DPI scaling.
- `prefers-reduced-motion` is honored throughout ([`src/scripts/motion.ts`](./src/scripts/motion.ts)), and interactive components (lightbox, skill filter) carry real ARIA semantics, not just visual polish.
- The CV page ([`src/pages/cv.astro`](./src/pages/cv.astro)) and the live site render from the same typed content modules, so the downloadable PDF can't drift from the page.

## Getting started

```sh
npm install
npm run dev
```

The dev server runs at `localhost:4321`.

## Commands

| Command                | Action                                                    |
| :---------------------- | :--------------------------------------------------------- |
| `npm run dev`           | Start local dev server at `localhost:4321`                 |
| `npm run build`         | Build production site to `./dist/`                         |
| `npm run preview`       | Preview production build locally                           |
| `npm run astro ...`     | Run Astro CLI commands (e.g. `astro add`, `astro check`)   |
| `npm run build:cv`      | Full site build **and** regenerate `public/cv.pdf`         |
| `npm run generate:cv`   | Regenerate `public/cv.pdf` from the existing `dist/` build |
| `npm run storybook`     | Start Storybook at `localhost:6006`                         |
| `npm run build-storybook` | Build the static Storybook site                           |

## Project structure

```text
/
├── public/              Static assets served as-is (fonts, images, cv.pdf)
├── src/
│   ├── components/ui/   Reusable Astro components (also storied)
│   ├── content/          Content collections (case studies) and typed data
│   ├── layouts/           Page-level sections (Hero, Cases, Bio, CV, Contact)
│   ├── pages/             File-based routes
│   ├── scripts/           Client-side behaviour (animations, carousel, cursor, lightbox)
│   ├── stories/           Storybook stories
│   └── styles/            Design tokens, base styles, and per-component stylesheets
├── astro.config.mjs
└── scripts/generate-cv-pdf.mjs   Renders src/pages/cv.astro to public/cv.pdf via headless Chromium
```

See [CLAUDE.md](./CLAUDE.md) for the component/Storybook conventions and the CV PDF build process in more detail.
