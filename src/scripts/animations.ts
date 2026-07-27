/**
 * Scroll-driven "sketch to full" reveal animations — entry point.
 *
 * Text:   src/scripts/scrollReveal.ts (outlined skeleton + clipped fill)
 * Images: src/scripts/halftone.ts (CSS filter scrub: halftone → full color)
 * Hero:   src/scripts/typewriter.ts (typewriter heading + button stagger)
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './motion';
import { initScrollReveal, rebuildScrollReveal } from './scrollReveal';
import { initHalftone } from './halftone';

export { initHeroTypewriter } from './typewriter';

let _resizeTimer: ReturnType<typeof setTimeout> | null = null;

export function initAnimations() {
  // Reduced motion: leave headings and images in their plain, fully-visible
  // markup — skip wrapping them in the scroll-scrubbed reveal effects below.
  if (prefersReducedMotion()) return;

  initScrollReveal();
  initHalftone();

  // Rebuild text animations on resize (debounced 200 ms). ScrollTrigger.refresh()
  // recalculates image trigger positions after resize.
  window.addEventListener('resize', () => {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      rebuildScrollReveal();
      ScrollTrigger.refresh();
    }, 200);
  });
}
