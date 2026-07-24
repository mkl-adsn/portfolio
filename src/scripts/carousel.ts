/**
 * Image carousel — one visible slide at a time.
 *
 * Markup (see src/styles/components/carousel.css):
 *   <div class="carousel" data-carousel>
 *     <div class="carousel__viewport">
 *       <div class="carousel__track">
 *         <figure class="carousel__slide">
 *           <img src="…" alt="…" /><figcaption>…</figcaption>
 *         </figure>
 *         … more slides …
 *       </div>
 *     </div>
 *   </div>
 *
 * Arrows and dot indicators are generated here from the slide count, so the
 * author only writes the slides. Navigation: prev/next arrows, dot clicks, and
 * pointer drag / swipe (mouse + touch, unified via Pointer Events). Clicking a
 * slide (without dragging) opens the whole set in the lightbox at that index.
 */

import { openLightbox, type LightboxImage } from './lightbox';
import { ARROW_LEFT_SVG, ARROW_RIGHT_SVG } from './icons';

// Drag distance (fraction of viewport width) needed to advance a slide.
const SWIPE_THRESHOLD = 0.15;
// Pointer travel (px) beyond which a press counts as a drag, not a click.
const DRAG_SLOP = 8;

// Arrows come from public/images/Icon/Light/ via src/scripts/icons.ts, inlined
// so they inherit `currentColor` from the button.

function slidesOf(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('.carousel__slide'));
}

function groupOf(slides: HTMLElement[]): LightboxImage[] {
  return slides.map((slide) => {
    const img = slide.querySelector('img');
    return {
      src: img?.currentSrc || img?.src || '',
      alt: img?.alt ?? '',
      caption: slide.querySelector('figcaption')?.textContent?.trim() ?? '',
    };
  });
}

function setupCarousel(root: HTMLElement) {
  if (root.dataset.carouselBound) return;
  root.dataset.carouselBound = 'true';

  const track = root.querySelector<HTMLElement>('.carousel__track');
  const viewport = root.querySelector<HTMLElement>('.carousel__viewport');
  const slides = slidesOf(root);
  if (!track || !viewport || slides.length === 0) return;

  const multi = slides.length > 1;
  let index = 0;

  // ── Build controls (arrows + dots) for multi-slide carousels ──────────────
  let dots: HTMLButtonElement[] = [];
  if (multi) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel__arrow carousel__arrow--prev';
    prev.setAttribute('aria-label', 'Previous image');
    prev.innerHTML = ARROW_LEFT_SVG;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel__arrow carousel__arrow--next';
    next.setAttribute('aria-label', 'Next image');
    next.innerHTML = ARROW_RIGHT_SVG;

    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'carousel__dots';
    dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    root.appendChild(prev);
    root.appendChild(next);
    root.appendChild(dotsWrap);
  }

  function update(animate = true) {
    track!.style.transition = animate ? '' : 'none';
    track!.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    if (!animate) {
      // Force reflow so the next transform re-enables the transition cleanly.
      void track!.offsetWidth;
      track!.style.transition = '';
    }
  }

  function go(i: number) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    update();
  }

  // ── Pointer drag / swipe ──────────────────────────────────────────────────
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;

  function onDown(e: PointerEvent) {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    deltaX = 0;
    track!.style.transition = 'none';
    viewport!.setPointerCapture(e.pointerId);
  }

  function onMove(e: PointerEvent) {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    // Any pointer travel past the slop — horizontal *or* vertical — disqualifies
    // this gesture from being a tap, so a vertical scroll never opens the
    // lightbox even if `pointercancel` doesn't fire.
    const deltaY = e.clientY - startY;
    if (Math.abs(deltaX) > DRAG_SLOP || Math.abs(deltaY) > DRAG_SLOP) moved = true;
    const width = viewport!.clientWidth || 1;
    const offset = (-index * 100) + (deltaX / width) * 100;
    track!.style.transform = `translateX(${offset}%)`;
  }

  function onUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    viewport!.releasePointerCapture?.(e.pointerId);
    track!.style.transition = '';

    const width = viewport!.clientWidth || 1;
    if (!moved) {
      // A tap/click, not a drag → open the current slide in the lightbox.
      // Handled here (not via a `click` listener) because setPointerCapture
      // suppresses the synthesized click for mouse input.
      update();
      openLightbox(groupOf(slides), index);
    } else if (multi && Math.abs(deltaX) > width * SWIPE_THRESHOLD) {
      go(index + (deltaX < 0 ? 1 : -1));
    } else {
      update();
    }
  }

  // Fired when the browser takes over the gesture — e.g. a vertical drag that
  // becomes a page scroll (touch-action: pan-y). Must NOT open the lightbox:
  // just abandon the drag and snap the track back to rest.
  function onCancel() {
    if (!dragging) return;
    dragging = false;
    track!.style.transition = '';
    update();
  }

  // Attached even for single-slide carousels so a click still opens the
  // lightbox; drag-to-change is simply a no-op when there is one slide.
  viewport.addEventListener('pointerdown', onDown);
  viewport.addEventListener('pointermove', onMove);
  viewport.addEventListener('pointerup', onUp);
  viewport.addEventListener('pointercancel', onCancel);

  // Keep transform correct across viewport resizes (percent-based, so no-op
  // math, but re-assert in case a browser drops it after orientation change).
  window.addEventListener('resize', () => update(false));

  update(false);
}

export function initCarousel(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-carousel]').forEach(setupCarousel);
}
