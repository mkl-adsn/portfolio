/**
 * Scroll-driven "sketch to full" reveal animations.
 *
 * Text:   Dual-layer (outlined skeleton + clipped fill) — reveals left→right
 *         as the element enters the viewport bottom.
 * Images: CSS filter scrub (grayscale+contrast+blur → full color).
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Resize registry ────────────────────────────────────────────────────── */

// Populated by buildRowsAndAnimate; flushed by the debounced resize listener
// added at the end of initAnimations.
const _resizeCallbacks: Array<() => void> = [];
let _resizeTimer: ReturnType<typeof setTimeout> | null = null;

/* ─── Utility ────────────────────────────────────────────────────────────── */

/**
 * After layout, groups .draw-word spans in fillLayer by rendered row (offsetTop),
 * rebuilds the layer as block row-spans each with clip-path, then wires a
 * ScrollTrigger that reveals rows left→right with a stagger.
 *
 * On window resize the build is re-run automatically: wordWrappedHTML is
 * captured once before the first build destroys the .draw-word spans, then
 * restored at the start of every subsequent build so row detection can re-run
 * against the new layout.
 */
function buildRowsAndAnimate(
  fillLayer: HTMLElement,
  trigger: HTMLElement,
  start: string,
  end: string,
  stagger: number,
) {
  // Capture word-wrapped HTML before first build destroys it.
  const wordWrappedHTML = fillLayer.innerHTML;
  let st: ScrollTrigger | null = null;

  function build() {
    // Kill the previous trigger so we don't accumulate stale instances.
    st?.kill();

    // Restore word spans so offsetTop measurements are valid for the current layout.
    fillLayer.innerHTML = wordWrappedHTML;
    fillLayer.style.clipPath = 'inset(0 100% 0 0)';

    requestAnimationFrame(() => {
      // Mirror the trigger's exact float pixel width onto the fill layer so text
      // wraps at identical positions. getBoundingClientRect() returns a float
      // (e.g. 624.92px); setting it explicitly avoids the subpixel rounding that
      // inset:0 / right:0 introduce. For heading fill layers this is a no-op
      // (they already use inset:0 and their metrics are controlled by text-stroke).
      fillLayer.style.width = `${trigger.getBoundingClientRect().width}px`;

      const wordEls = Array.from(fillLayer.querySelectorAll<HTMLElement>('.draw-word'));

      const rowMap = new Map<number, HTMLElement[]>();
      wordEls.forEach(w => {
        const top = Math.round(w.offsetTop);
        if (!rowMap.has(top)) rowMap.set(top, []);
        rowMap.get(top)!.push(w);
      });

      const rowEls = Array.from(rowMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([, words]) => {
          const rowSpan = document.createElement('span');
          rowSpan.className = 'draw-row';
          rowSpan.style.cssText = 'display: block; clip-path: inset(0 100% 0 0);';
          rowSpan.textContent = words.map(w => w.textContent ?? '').join(' ');
          return rowSpan;
        });

      // Swap word-span content for row-span content, then clear parent clip-path
      fillLayer.innerHTML = '';
      rowEls.forEach(r => fillLayer.appendChild(r));
      fillLayer.style.clipPath = '';

      st = ScrollTrigger.create({
        trigger,
        start,
        end,
        scrub: 0.8,
        onUpdate(self) {
          const p = self.progress;
          // Distribute delays evenly so the last row starts at `stagger` (fraction of
          // scroll range) regardless of row count — prevents rows beyond 1/stagger
          // from never being reached.
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

/** Dual-layer draw effect for headings: outline skeleton + clipped fill reveal. */
function wrapDrawHeading(el: HTMLElement, color = 'var(--grey-900)', outlineWidth = '1px') {
  const original = el.innerHTML;

  // Outline ghost (skeleton always visible)
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

  // Fill layer — word-wrapped for row detection; hidden until rows are built in rAF.
  // WebkitTextStroke must match the outline layer so both layers have identical
  // character metrics and therefore identical line-break positions.
  const fillEl = document.createElement('span');
  fillEl.className = 'draw-fill-layer';
  fillEl.innerHTML = original.replace(/(\S+)/g, '<span class="draw-word">$1</span>');
  Object.assign(fillEl.style, {
    display: 'block',
    position: 'absolute',
    inset: '0',
    color,
    whiteSpace: 'inherit',
    clipPath: 'inset(0 100% 0 0)',
    WebkitTextStroke: `${outlineWidth} transparent`, // match outline metrics, invisible
  });

  el.style.position = 'relative';
  el.innerHTML = '';
  el.appendChild(outlineEl);
  el.appendChild(fillEl);

  return fillEl;
}

/**
 * Leanrada-style separate-K colour halftone effect.
 *
 * Technique: CSS custom properties --hs (grid size) and --hb (bleed) drive
 * all gradient radii and filter values via CSS. JS only sets the property
 * values on scroll; all rendering logic lives in animations.css.
 *
 * DOM structure:
 *   .halftone-box                       ← replaces the original <img>
 *     .halftone-demo                    ← CMY filtered wrapper
 *       img.halftone-media              ← saturated image (CMY signal)
 *       .halftone-demo-ink              ← Y channel (::before) + C+M (::after)
 *     .halftone-demo-k-layer            ← K (black) channel, multiply-blended
 *       img.halftone-media              ← greyscale image (K signal)
 *     .halftone-reveal                  ← original image, fades in at end
 *       img
 *
 * Scroll phases (0 → 1):
 *   0 – REVEAL_START   --hs shrinks MAX_SIZE → MIN_SIZE (coarse → fine dots)
 *   REVEAL_START – 1   halftone holds fine; .halftone-reveal fades in
 */

/** Builds the leanrada separate-K DOM structure around a .draw-image element. */
function setupHalftoneDOM(img: HTMLElement): { box: HTMLElement; reveal: HTMLElement } {
  const src = (img as HTMLImageElement).src;
  const alt = (img as HTMLImageElement).alt ?? '';

  function makeImg(extraClass?: string): HTMLImageElement {
    const el = document.createElement('img');
    el.src = src;
    el.alt = alt;
    el.className = extraClass ? `halftone-media ${extraClass}` : 'halftone-media';
    return el;
  }

  // CMY wrapper
  const cmy = document.createElement('div');
  cmy.className = 'halftone-demo';
  cmy.appendChild(makeImg());
  const ink = document.createElement('div');
  ink.className = 'halftone-demo-ink';
  cmy.appendChild(ink);

  // K layer
  const kLayer = document.createElement('div');
  kLayer.className = 'halftone-demo-k-layer';
  kLayer.appendChild(makeImg());

  // Reveal — original image fades in over the halftone during final phase
  const reveal = document.createElement('div');
  reveal.className = 'halftone-reveal';
  reveal.appendChild(makeImg());

  // Box replaces the original img
  const box = document.createElement('div');
  box.className = 'halftone-box';
  box.style.setProperty('--hs', '40px');
  box.style.setProperty('--hb', '0.3');
  img.parentNode!.insertBefore(box, img);
  box.appendChild(cmy);
  box.appendChild(kLayer);
  box.appendChild(reveal);
  img.remove();

  return { box, reveal };
}

/** Drives the halftone scroll animation by updating --hs and reveal opacity. */
function updateHalftoneScroll(box: HTMLElement, reveal: HTMLElement, progress: number) {
  const DOT_END      = 0.85; // fraction at which dots finish shrinking to MIN_SIZE
  const REVEAL_START = 0.55; // fraction at which original image starts fading in
  const MAX_SIZE     = 40;   // px — coarse dots at scroll start
  const MIN_SIZE     = 4;    // px — fine dots at DOT_END

  // Dot size: shrinks independently from MAX_SIZE → MIN_SIZE over 0 → DOT_END
  const tDot  = Math.min(1, progress / DOT_END);
  const eDot  = tDot * tDot * (3 - 2 * tDot);   // smoothstep
  const size  = MAX_SIZE + (MIN_SIZE - MAX_SIZE) * eDot;

  // Reveal opacity: fades in independently over REVEAL_START → 1.0
  const tRev  = Math.max(0, (progress - REVEAL_START) / (1 - REVEAL_START));
  const eRev  = tRev * tRev * (3 - 2 * tRev);
  const revealOpacity = eRev;

  box.style.setProperty('--hs', `${size.toFixed(2)}px`);
  reveal.style.opacity = revealOpacity.toFixed(4);
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

/** Grey-400 → grey-900 color reveal for body text: overlay fill layer. */
function wrapDrawBody(el: HTMLElement): HTMLElement {
  // position:relative makes el the containing block for the fill overlay.
  el.style.position = 'relative';

  // Fill layer sits over the source text and inherits all font properties.
  // inset:0 is fine here — width never affects row detection (Range API reads
  // from sourceEl directly) and each row-span holds only one line so it
  // cannot re-wrap regardless of any subpixel box difference.
  const fillEl = document.createElement('div');
  fillEl.className = 'draw-body-fill';
  Object.assign(fillEl.style, {
    position: 'absolute',
    inset: '0',
    margin: '0',
    color: 'var(--grey-900)',
    pointerEvents: 'none',
    clipPath: 'inset(0 100% 0 0)',
  });

  el.appendChild(fillEl);
  return fillEl;
}

/* ─── Init ───────────────────────────────────────────────────────────────── */

/* ─── Hero typewriter ────────────────────────────────────────────────────── */

export function initHeroTypewriter() {
  const container = document.getElementById('hero-typewriter');
  const cursor    = document.querySelector<HTMLElement>('.hero-cursor');
  const buttonsEl = document.getElementById('hero-buttons');

  if (!container || !cursor || !buttonsEl) return;

  // Non-null assertions — narrowed by the guard above but not visible inside closures
  const _container = container!;
  const _cursor    = cursor!;
  const _buttonsEl = buttonsEl!

  const segments = [
    { text: 'Mikael Andersson, senior UX/UI designer aligning product vision with technical execution.', bold: true  },
    { text: ' Turns stakeholder input and developer needs into ', bold: false },
    { text: 'scalable, buildable UI solutions.', bold: true  },
  ];

  // Flatten to per-character array
  const chars: Array<{ char: string; bold: boolean }> = [];
  for (const seg of segments) {
    for (const char of seg.text) {
      chars.push({ char, bold: seg.bold });
    }
  }

  // Build innerHTML for the first `count` characters, grouping bold runs
  function buildHTML(count: number): string {
    let html = '';
    let i = 0;
    while (i < count) {
      const bold = chars[i].bold;
      let run = '';
      while (i < count && chars[i].bold === bold) {
        run += chars[i].char;
        i++;
      }
      html += bold ? `<strong>${run}</strong>` : run;
    }
    return html;
  }

  let index = 0;
  const SPEED_MS = 33; // ms per character

  // Keep buttons invisible until typing finishes; wrapper opacity is already 0 in HTML
  function tick() {
    _container.innerHTML = buildHTML(index);
    index++;

    if (index <= chars.length) {
      setTimeout(tick, SPEED_MS);
    } else {
      // Typing done — fade out cursor, then stagger buttons in
      _cursor.classList.add('done');

      _buttonsEl.style.opacity = '1';
      gsap.fromTo(
        Array.from(_buttonsEl.children),
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.8, delay: 0.5 }
      );
    }
  }

  // Short pause before typing begins
  setTimeout(tick, 1200);
}

export function initAnimations() {
  // ── 1. Draw-heading (h2): outline skeleton → grey-900 fill, row by row ─────
  document.querySelectorAll<HTMLElement>('.draw-heading').forEach(el => {
    buildRowsAndAnimate(wrapDrawHeading(el), el, 'top 95%', 'top 30%', 0.4);
  });

  // ── 1b. Draw-subheading (h3): same effect, grey-700 ──────────────────────
  document.querySelectorAll<HTMLElement>('.draw-subheading').forEach(el => {
    buildRowsAndAnimate(wrapDrawHeading(el, 'var(--grey-700)', '0.5px'), el, 'top 95%', 'top 30%', 0.4);
  });

  // ── 2. Body text: grey-400 → grey-900, row by row ────────────────────────
  // Uses Range API (buildBodyRowsAndAnimate) to detect line breaks from the
  // source element directly — immune to subpixel DPI rendering differences.
  document.querySelectorAll<HTMLElement>('.draw-body').forEach(el => {
    buildBodyRowsAndAnimate(wrapDrawBody(el), el, el, 'top 95%', 'top 70%', 0.3);
  });

  // ── 3. Images: colour halftone → full image ──────────────────────────────
  document.querySelectorAll<HTMLElement>('.draw-image').forEach(el => {
    const { box, reveal } = setupHalftoneDOM(el);
    updateHalftoneScroll(box, reveal, 0);

    ScrollTrigger.create({
      trigger: box,
      start: 'top 75%',
      end: 'top 25%',
      scrub: 1,
      onUpdate(self) { updateHalftoneScroll(box, reveal, self.progress); },
    });
  });

  // ── 4. Rebuild text animations on resize (debounced 200 ms) ──────────────
  // _resizeCallbacks is populated by each buildRowsAndAnimate call above.
  // ScrollTrigger.refresh() recalculates image trigger positions after resize.
  window.addEventListener('resize', () => {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      _resizeCallbacks.forEach(cb => cb());
      ScrollTrigger.refresh();
    }, 200);
  });

}
