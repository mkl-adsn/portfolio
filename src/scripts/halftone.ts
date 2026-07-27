/**
 * Leanrada-style separate-K colour halftone reveal for `.draw-image` elements.
 *
 * Technique: CSS custom properties --hs (grid size) and --hb (bleed) drive
 * all gradient radii and filter values via CSS. JS only sets the property
 * values on scroll; all rendering logic lives in animations.css.
 *
 * DOM structure:
 *   .halftone-figure-wrapper            ← flex item; position:relative
 *     .case-image (figure)              ← mix-blend-mode: multiply
 *       .halftone-box
 *         .halftone-demo                ← CMY filtered wrapper
 *           img.halftone-media          ← saturated image (CMY signal)
 *           .halftone-demo-ink          ← Y channel (::before) + C+M (::after)
 *         .halftone-demo-k-layer        ← K (black) channel, multiply-blended
 *           img.halftone-media          ← greyscale image (K signal)
 *     .halftone-reveal                  ← sibling of figure; outside multiply context
 *       img                             ← original image, fades in at end
 *
 * Scroll phases (0 → 1):
 *   0 – REVEAL_START   --hs shrinks MAX_SIZE → MIN_SIZE (coarse → fine dots)
 *   REVEAL_START – 1   halftone holds fine; .halftone-reveal fades in
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

/** Builds the leanrada separate-K DOM structure around a .draw-image element. */
function setupHalftoneDOM(img: HTMLElement): { box: HTMLElement; reveal: HTMLElement } {
  const revealSrc   = (img as HTMLImageElement).src;
  const halftoneSrc = (img as HTMLImageElement).dataset.halftoneSrc ?? revealSrc;
  const alt         = (img as HTMLImageElement).alt ?? '';

  function makeImg(src: string, extraClass?: string): HTMLImageElement {
    const el = document.createElement('img');
    el.src = src;
    el.alt = alt;
    el.className = extraClass ? `halftone-media ${extraClass}` : 'halftone-media';
    return el;
  }

  // CMY wrapper — uses halftone-specific image (solid, no alpha)
  const cmy = document.createElement('div');
  cmy.className = 'halftone-demo';
  cmy.appendChild(makeImg(halftoneSrc));
  const ink = document.createElement('div');
  ink.className = 'halftone-demo-ink';
  cmy.appendChild(ink);

  // K layer — same halftone image
  const kLayer = document.createElement('div');
  kLayer.className = 'halftone-demo-k-layer';
  kLayer.appendChild(makeImg(halftoneSrc));

  // Reveal — original image (may have transparency), fades in during final phase
  const reveal = document.createElement('div');
  reveal.className = 'halftone-reveal';
  reveal.appendChild(makeImg(revealSrc));

  // Wrap the figure so reveal can live outside .case-image (and therefore
  // outside its mix-blend-mode: multiply stacking context) while staying
  // visually overlaid on the same area.
  const figure = img.parentNode!;
  const wrapper = document.createElement('div');
  wrapper.className = 'halftone-figure-wrapper';
  figure.parentNode!.insertBefore(wrapper, figure);
  wrapper.appendChild(figure);

  // Box replaces the original img inside the figure
  const box = document.createElement('div');
  box.className = 'halftone-box';
  box.style.setProperty('--hs', '40px');
  box.style.setProperty('--hb', '0.3');
  figure.insertBefore(box, img);
  box.appendChild(cmy);
  box.appendChild(kLayer);
  img.remove();

  // Reveal is a sibling of the figure inside the wrapper — outside .case-image
  wrapper.appendChild(reveal);

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

/** Wraps every `.draw-image` in the colour-halftone → full-image scroll reveal. */
export function initHalftone() {
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
}
