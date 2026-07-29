/**
 * Inline icon strings for script-generated UI (lightbox, carousel).
 *
 * These controls live inside <button>s that set `color:` and hover states, so
 * their glyphs must inherit `currentColor` — an <img src="…svg"> can't. Instead
 * of hand-copying the SVG markup (which then drifts from the real assets), we
 * import the actual files from public/images/Icon/Light/ at build time via
 * Vite's `?raw` and swap their hardcoded stroke colour for `currentColor`. Edit
 * the SVG in the Icon folder and the change flows straight through here.
 *
 * The Light variants are the source: these controls always sit on the dark
 * lightbox backdrop / image overlay, so a light glyph is what the button colour
 * resolves to.
 */

import xCloseRaw from '../../public/images/Icon/Light/x-close.svg?raw';
import arrowLeftRaw from '../../public/images/Icon/Light/arrow-left.svg?raw';
import arrowRightRaw from '../../public/images/Icon/Light/arrow-right.svg?raw';
import zoomInRaw from '../../public/images/Icon/Light/zoom-in.svg?raw';
import zoomOutRaw from '../../public/images/Icon/Light/zoom-out.svg?raw';

// Make an imported SVG inheritable and decorative: any concrete stroke/fill
// colour becomes `currentColor`, and it's hidden from assistive tech (the
// button already carries an aria-label).
function normalize(raw: string): string {
  return raw
    .replace(/(stroke|fill)="#[0-9a-fA-F]{3,8}"/g, '$1="currentColor"')
    .replace(/<svg\b/, (m) => (/aria-hidden=/.test(raw) ? m : `${m} aria-hidden="true"`))
    .trim();
}

export const CLOSE_SVG = normalize(xCloseRaw);
export const ARROW_LEFT_SVG = normalize(arrowLeftRaw);
export const ARROW_RIGHT_SVG = normalize(arrowRightRaw);

const ZOOM_IN_SVG = normalize(zoomInRaw);
const ZOOM_OUT_SVG = normalize(zoomOutRaw);

/** Magnifier glyph: the `+` (zoom-in) affordance when `plus`, else `−`. */
export function zoomSvg(plus: boolean): string {
  return plus ? ZOOM_IN_SVG : ZOOM_OUT_SVG;
}
