/**
 * Icon registry — single source of truth for icon artwork.
 *
 * Every icon is one `.svg` file in src/icons/, authored with `currentColor`
 * so a single file serves every theme and tone. Editing that file updates
 * every usage (Astro `<Icon>` and the JS-built icons below) on next build.
 *
 * Astro components should prefer the <Icon> component (src/components/ui/
 * Icon.astro). This module also exposes the raw SVG + a markup helper for the
 * scripts (carousel, lightbox, theme toggle) that build icons in the browser
 * rather than at render time.
 */

// Eager raw import of every icon, keyed by path. Resolved relative to this file.
const modules = import.meta.glob('../icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Map "mail" → its raw <svg> string.
const svgByName: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, svg]) => [
    path.match(/([^/]+)\.svg$/)![1],
    svg,
  ])
);

export type IconTone = 'strong' | 'medium' | 'inverted' | 'fixed-light';

/**
 * Canonical icon names — the source of truth for the `IconName` type, so a
 * mistyped name is a compile error instead of a blank box at runtime. Keep in
 * sync with the files in src/icons/; the dev guard below fails loudly if they
 * ever drift (a file with no entry here, or an entry with no file).
 */
export const ICON_NAMES = [
  'arrow-left',
  'arrow-right',
  'download',
  'github',
  'linkedin',
  'location',
  'mail',
  'moon',
  'phone',
  'search',
  'star-filled',
  'star-outline',
  'sun',
  'x-close',
  'zoom-in',
  'zoom-out',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

// Dev-only: the tuple above is hand-maintained but the artwork is discovered
// from the filesystem, so cross-check them and fail loudly on any mismatch.
// Stripped from production builds (import.meta.env.DEV is false there).
if (import.meta.env.DEV) {
  const files = new Set(Object.keys(svgByName));
  const missingFile = ICON_NAMES.filter((n) => !files.has(n));
  const missingName = [...files].filter((n) => !ICON_NAMES.includes(n as IconName));
  if (missingFile.length || missingName.length) {
    throw new Error(
      'Icon registry drift between ICON_NAMES and src/icons/:\n' +
        (missingFile.length
          ? `  In ICON_NAMES but no src/icons/<name>.svg: ${missingFile.join(', ')}\n`
          : '') +
        (missingName.length
          ? `  In src/icons/ but missing from ICON_NAMES (add for typing): ${missingName.join(', ')}\n`
          : '')
    );
  }
}

/** All available icon names (sorted), e.g. for the Storybook catalog. */
export const iconNames: readonly IconName[] = [...ICON_NAMES].sort();

/** Raw `<svg>` markup for an icon (colours already `currentColor`). */
export function iconSvg(name: IconName): string {
  const svg = svgByName[name];
  if (!svg) throw new Error(`Unknown icon: "${name}"`);
  return svg;
}

interface IconMarkupOptions {
  tone?: IconTone;
  size?: number;
  class?: string;
}

/**
 * A full `.icon` span wrapping the SVG — for code that injects icons as HTML
 * strings (carousel/lightbox). Colour comes from the tone via icon.css.
 */
export function iconMarkup(
  name: IconName,
  { tone = 'strong', size = 24, class: cls = '' }: IconMarkupOptions = {}
): string {
  const classes = `icon icon--${tone}${cls ? ` ${cls}` : ''}`;
  return `<span class="${classes}" style="--icon-size: ${size}px" aria-hidden="true">${iconSvg(name)}</span>`;
}
