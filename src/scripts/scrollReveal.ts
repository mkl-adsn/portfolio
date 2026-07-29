/**
 * Scroll-driven "sketch to full" reveal animation for headings.
 *
 * Dual-layer (outlined skeleton + clipped fill) — reveals left→right as the
 * element enters the viewport bottom, row by row.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Populated by buildRowsAndAnimate; flushed by rebuildScrollReveal (called from
// animations.ts's debounced resize listener).
const _resizeCallbacks: Array<() => void> = [];

/** Dual-layer draw effect for headings: outline skeleton + clipped fill reveal. */
function wrapDrawHeading(
  el: HTMLElement,
  color = 'var(--type-primary)',
  outlineWidth = '1px',
): { fillEl: HTMLElement; outlineEl: HTMLElement } {
  const original = el.innerHTML;

  // Outline ghost (skeleton always visible) — in normal flow, used as the
  // source element for Range API line-break detection.
  const outlineEl = document.createElement('span');
  outlineEl.className = 'draw-outline-layer';
  outlineEl.setAttribute('aria-hidden', 'true');
  outlineEl.innerHTML = original;
  Object.assign(outlineEl.style, {
    display: 'block',
    WebkitTextStroke: `${outlineWidth} ${color}`,
    color: 'transparent',
    userSelect: 'none',
  });

  // Fill layer — row spans built by buildBodyRowsAndAnimate via Range API on
  // the outline layer. WebkitTextStroke matches outline so glyph metrics are
  // identical and line breaks land in the same positions.
  const fillEl = document.createElement('span');
  fillEl.className = 'draw-fill-layer';
  Object.assign(fillEl.style, {
    display: 'block',
    position: 'absolute',
    inset: '0',
    color,
    whiteSpace: 'inherit',
    clipPath: 'inset(0 100% 0 0)',
    WebkitTextStroke: `${outlineWidth} transparent`,
  });

  el.style.position = 'relative';
  el.innerHTML = '';
  el.appendChild(outlineEl);
  el.appendChild(fillEl);

  return { fillEl, outlineEl };
}

/**
 * Detects rendered line groups in el by walking its text nodes and using the
 * Range API to read each word's bounding rect top — no DOM modification needed.
 * Returns an array of lines, each line being an array of word strings.
 *
 * Why Range API instead of offsetTop on injected spans: at fractional DPI scales
 * (e.g. 125% on Windows) the browser lays text out at physical-pixel precision.
 * The element's CSS box width (getBoundingClientRect / offsetWidth) may differ
 * from the effective text-wrap width, so any duplicate element we create will
 * wrap at slightly different positions. Reading rects directly from the source
 * text nodes sidesteps this entirely.
 */
function detectTextLines(el: HTMLElement): string[][] {
  const lineMap = new Map<number, string[]>();

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const text = node.textContent;
      for (const match of text.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, match.index!);
        range.setEnd(node, match.index! + match[0].length);
        const top = Math.round(range.getBoundingClientRect().top);
        if (!lineMap.has(top)) lineMap.set(top, []);
        lineMap.get(top)!.push(match[0]);
      }
    } else {
      for (const child of node.childNodes) walk(child);
    }
  }

  walk(el);

  return Array.from(lineMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, words]) => words);
}

/**
 * Body text animation — detects line breaks from the source element via the
 * Range API, then builds clip-path row spans in an overlay fill layer.
 *
 * Each fill row-span contains exactly one line of text (as measured from the
 * source), so its own width never matters — it cannot re-wrap regardless of
 * any subpixel difference between the fill layer and source element widths.
 */
function buildBodyRowsAndAnimate(
  fillLayer: HTMLElement,
  sourceEl: HTMLElement,
  trigger: HTMLElement,
  start: string,
  end: string,
  stagger: number,
) {
  let st: ScrollTrigger | null = null;

  function build() {
    st?.kill();
    fillLayer.style.clipPath = 'inset(0 100% 0 0)';

    requestAnimationFrame(() => {
      // Clear stale row spans BEFORE detection — fillLayer is a child of
      // sourceEl, so detectTextLines would otherwise walk its old text nodes
      // and return doubled/incorrect line groups on every resize rebuild.
      fillLayer.innerHTML = '';

      const lines = detectTextLines(sourceEl);

      const rowEls = lines.map(words => {
        const span = document.createElement('span');
        span.className = 'draw-row';
        span.style.cssText = 'display: block; clip-path: inset(0 100% 0 0);';
        span.textContent = words.join(' ');
        return span;
      });

      rowEls.forEach(r => fillLayer.appendChild(r));
      fillLayer.style.clipPath = '';

      st = ScrollTrigger.create({
        trigger,
        start,
        end,
        scrub: 0.8,
        onUpdate(self) {
          const p = self.progress;
          const n = rowEls.length;
          rowEls.forEach((rowEl, i) => {
            const delay = n > 1 ? (i / (n - 1)) * stagger : 0;
            const local = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
            const pct   = Math.round(local * 1000) / 10;
            rowEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
          });
        },
      });
    });
  }

  build();
  _resizeCallbacks.push(build);
}

/** Wraps every `.draw-heading`/`.draw-subheading` in the scroll-scrubbed reveal effect. */
export function initScrollReveal() {
  // Draw-heading: outline skeleton → grey-900 fill, row by row. Uses Range API
  // on the outline layer (normal-flow source) so line-break detection is
  // accurate regardless of the heading's containing layout context (block,
  // flex item with justify-between, etc.).
  document.querySelectorAll<HTMLElement>('.draw-heading').forEach(el => {
    const { fillEl, outlineEl } = wrapDrawHeading(el);
    buildBodyRowsAndAnimate(fillEl, outlineEl, el, 'top 95%', 'top 30%', 0.4);
  });

  // Draw-subheading (h3): same effect, grey-700.
  document.querySelectorAll<HTMLElement>('.draw-subheading').forEach(el => {
    const { fillEl, outlineEl } = wrapDrawHeading(el, 'var(--type-secondary)', '0.5px');
    buildBodyRowsAndAnimate(fillEl, outlineEl, el, 'top 95%', 'top 30%', 0.4);
  });
}

/** Rebuilds all row spans (called after a debounced resize, before ScrollTrigger.refresh()). */
export function rebuildScrollReveal() {
  _resizeCallbacks.forEach(cb => cb());
}
