/**
 * Lightbox — full-screen image modal.
 *
 * Two ways in:
 *   1. Any `[data-lightbox]` figure/element containing an <img> (and optional
 *      <figcaption>) becomes clickable and opens as a single-image group.
 *   2. Other code (e.g. the carousel) calls openLightbox(images, startIndex)
 *      directly to open a navigable group.
 *
 * Internally this is the same track-of-slides carousel used on the page: all
 * group images are laid out side by side and the track is translated, so
 * dragging/swiping slides the neighbouring image in from the edge (rather than
 * moving one <img> and swapping its src). A single overlay element is created
 * once and reused. Arrows / dots appear for groups of 2+; ESC, the ✕, a click
 * on the empty backdrop, or a tap outside the image all close it.
 */

export interface LightboxImage {
  src: string;
  alt: string;
  caption: string;
}

// ─── Shared overlay singleton ───────────────────────────────────────────────
let overlay: HTMLElement | null = null;
let viewport: HTMLElement;
let track: HTMLElement;
let dotsEl: HTMLElement;
let prevBtn: HTMLButtonElement;
let nextBtn: HTMLButtonElement;

let group: LightboxImage[] = [];
let index = 0;

// Swipe tuning — mirrors the on-page carousel.
const SWIPE_THRESHOLD = 0.15; // fraction of viewport width to advance a slide
const DRAG_SLOP = 8; // px of travel before a press counts as a drag

const CLOSE_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" /></svg>';

const ARROW_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>';

function buildOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="lightbox__backdrop" data-lightbox-close></div>
    <button class="lightbox__close" type="button" aria-label="Close">${CLOSE_SVG}</button>
    <button class="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Previous image">${ARROW_SVG}</button>
    <div class="lightbox__viewport">
      <div class="lightbox__track"></div>
    </div>
    <button class="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Next image">${ARROW_SVG}</button>
    <div class="lightbox__dots" aria-hidden="true"></div>
  `;
  document.body.appendChild(overlay);

  viewport = overlay.querySelector('.lightbox__viewport') as HTMLElement;
  track = overlay.querySelector('.lightbox__track') as HTMLElement;
  dotsEl = overlay.querySelector('.lightbox__dots') as HTMLElement;
  prevBtn = overlay.querySelector('.lightbox__arrow--prev') as HTMLButtonElement;
  nextBtn = overlay.querySelector('.lightbox__arrow--next') as HTMLButtonElement;

  overlay.querySelector('.lightbox__close')!.addEventListener('click', closeLightbox);
  overlay.querySelector('[data-lightbox-close]')!.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  dotsEl.addEventListener('click', (e) => {
    const dot = (e.target as HTMLElement).closest('[data-index]');
    if (dot) go(Number((dot as HTMLElement).dataset.index));
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  window.addEventListener('resize', () => {
    if (isOpen()) position(false);
  });

  attachSwipe();
}

function isOpen() {
  return overlay?.classList.contains('is-open') ?? false;
}

// Lay out every group image as a slide in the track.
function buildSlides() {
  const slides = group.map((item) => {
    const slide = document.createElement('div');
    slide.className = 'lightbox__slide';

    const figure = document.createElement('figure');
    figure.className = 'lightbox__figure';

    const img = document.createElement('img');
    img.className = 'lightbox__image';
    img.src = item.src;
    img.alt = item.alt;
    img.draggable = false;
    figure.appendChild(img);

    if (item.caption) {
      const cap = document.createElement('figcaption');
      cap.className = 'lightbox__caption';
      cap.textContent = item.caption;
      figure.appendChild(cap);
    }

    slide.appendChild(figure);
    return slide;
  });
  track.replaceChildren(...slides);
}

function updateDots() {
  dotsEl.innerHTML = group
    .map(
      (_, i) =>
        `<button class="lightbox__dot${i === index ? ' is-active' : ''}" ` +
        `type="button" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`
    )
    .join('');
}

// Translate the track to the active slide. `animate=false` snaps without a
// transition (used on open and on resize).
function position(animate = true) {
  track.style.transition = animate ? '' : 'none';
  track.style.transform = `translateX(${-index * 100}%)`;
  if (!animate) {
    void track.offsetWidth; // reflow so the next move re-enables the transition
    track.style.transition = '';
  }
}

function go(i: number) {
  index = Math.max(0, Math.min(group.length - 1, i));
  position();
  updateDots();
}

function step(delta: number) {
  go(index + delta);
}

// Drag/swipe the track left/right — the neighbouring image follows the pointer
// and slides in. A press that doesn't move counts as a tap: on the image it
// does nothing, outside it closes. Same feel as the on-page carousel.
function attachSwipe() {
  let dragging = false;
  let moved = false;
  let onImage = false;
  let startX = 0;
  let deltaX = 0;

  viewport.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    onImage = !!(e.target as HTMLElement).closest('.lightbox__image');
    startX = e.clientX;
    deltaX = 0;
    track.style.transition = 'none';
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > DRAG_SLOP) moved = true;
    if (group.length < 2) return; // nothing to drag toward
    const width = viewport.clientWidth || 1;
    track.style.transform = `translateX(${-index * 100 + (deltaX / width) * 100}%)`;
  });

  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    viewport.releasePointerCapture?.(e.pointerId);
    track.style.transition = '';

    if (!moved) {
      // A tap: close when it lands outside the image; ignore taps on the image.
      if (!onImage) closeLightbox();
      else position();
      return;
    }

    const width = viewport.clientWidth || 1;
    if (group.length > 1 && Math.abs(deltaX) > width * SWIPE_THRESHOLD) {
      go(index + (deltaX < 0 ? 1 : -1));
    } else {
      position();
    }
  };

  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);
}

export function openLightbox(images: LightboxImage[], startIndex = 0) {
  if (!images.length) return;
  if (!overlay) buildOverlay();
  group = images;
  index = Math.max(0, Math.min(images.length - 1, startIndex));

  buildSlides();
  updateDots();

  const multi = group.length > 1;
  overlay!.classList.toggle('is-multi', multi);
  prevBtn.style.display = multi ? '' : 'none';
  nextBtn.style.display = multi ? '' : 'none';
  dotsEl.style.display = multi ? '' : 'none';

  position(false);
  overlay!.classList.add('is-open');
  overlay!.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
}

export function closeLightbox() {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
}

/** Read a single image out of a `[data-lightbox]` element. */
function imageFromElement(el: HTMLElement): LightboxImage | null {
  const img = el.querySelector('img');
  if (!img) return null;
  const caption =
    el.querySelector('figcaption')?.textContent?.trim() ??
    el.dataset.caption ??
    '';
  return { src: img.currentSrc || img.src, alt: img.alt, caption };
}

/**
 * Wire every standalone `[data-lightbox]` element under `root`. Carousels
 * opt out here (they own their own click handling) via `[data-carousel]`.
 */
export function initLightbox(root: ParentNode = document) {
  if (!overlay) buildOverlay();

  root.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((el) => {
    if (el.dataset.lightboxBound) return;
    if (el.closest('[data-carousel]')) return;
    el.dataset.lightboxBound = 'true';
    el.classList.add('is-lightbox-trigger');
    el.addEventListener('click', () => {
      const item = imageFromElement(el);
      if (item) openLightbox([item], 0);
    });
  });
}
