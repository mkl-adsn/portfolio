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
let zoomBtn: HTMLButtonElement;

let group: LightboxImage[] = [];
let index = 0;

// ─── Zoom / pan state (applies to the active slide's image) ──────────────────
// `scale` is relative to the fit-to-frame size: 1 = fit, and the cap is the
// image's native 1:1 pixel size (computed per image in geom()). `tx`/`ty`
// translate the image in CSS px. All three reset to the fit state whenever the
// active image changes (open, navigate) or on close.
let activeImg: HTMLImageElement | null = null;
let scale = 1;
let tx = 0;
let ty = 0;
// Last-rendered zoomed flag, so the class/icon only touch the DOM on a flip
// (applyTransform runs every pointermove frame).
let zoomedNow = false;

// Scales within EPS of 1 count as "fit" (not zoomed).
const ZOOM_EPS = 0.01;

// Whether we've pushed a history entry for the currently-open lightbox, so the
// back gesture/button closes it instead of navigating the page.
let historyPushed = false;

// Swipe tuning — mirrors the on-page carousel.
const SWIPE_THRESHOLD = 0.15; // fraction of viewport width to advance a slide
const DRAG_SLOP = 8; // px of travel before a press counts as a drag

// Icons mirror the assets in public/images/Icon/Light/, inlined so they inherit
// `currentColor` from the button (rather than loaded as <img>).
const CLOSE_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">' +
  '<path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" /></svg>';

const ARROW_LEFT_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">' +
  '<path d="M10.25 17L5 12L10.25 7M21 12L6 12" stroke="currentColor" stroke-width="2" /></svg>';

const ARROW_RIGHT_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">' +
  '<path d="M13.752 17L19.002 12L13.752 7M3 12L18 12" stroke="currentColor" stroke-width="2" /></svg>';

// Magnifying glass; `plus` draws a + inside (zoom-in affordance), else a −.
function zoomSvg(plus: boolean) {
  const sign = plus ? '<path d="M12 15L12 9" stroke="currentColor" stroke-width="2" />' : '';
  return (
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />' +
    '<path d="M17 17L21 21" stroke="currentColor" stroke-width="2" />' +
    '<path d="M9 12H15" stroke="currentColor" stroke-width="2" />' +
    sign +
    '</svg>'
  );
}

function buildOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="lightbox__backdrop" data-lightbox-close></div>
    <button class="lightbox__zoom" type="button" aria-label="Zoom in">${zoomSvg(true)}</button>
    <button class="lightbox__close" type="button" aria-label="Close">${CLOSE_SVG}</button>
    <button class="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Previous image">${ARROW_LEFT_SVG}</button>
    <div class="lightbox__viewport">
      <div class="lightbox__track"></div>
    </div>
    <button class="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Next image">${ARROW_RIGHT_SVG}</button>
    <div class="lightbox__dots" aria-hidden="true"></div>
  `;
  document.body.appendChild(overlay);

  viewport = overlay.querySelector('.lightbox__viewport') as HTMLElement;
  track = overlay.querySelector('.lightbox__track') as HTMLElement;
  dotsEl = overlay.querySelector('.lightbox__dots') as HTMLElement;
  prevBtn = overlay.querySelector('.lightbox__arrow--prev') as HTMLButtonElement;
  nextBtn = overlay.querySelector('.lightbox__arrow--next') as HTMLButtonElement;
  zoomBtn = overlay.querySelector('.lightbox__zoom') as HTMLButtonElement;

  overlay.querySelector('.lightbox__close')!.addEventListener('click', closeLightbox);
  overlay.querySelector('[data-lightbox-close]')!.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  // Button mirrors a double-tap: toggle between fit and native, about the image
  // centre.
  zoomBtn.addEventListener('click', () => {
    const rect = activeImg?.getBoundingClientRect();
    if (rect) toggleZoom(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

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
    if (!isOpen()) return;
    position(false);
    // The box (and thus the native-scale cap) changes with the viewport; re-clamp
    // the current zoom so the image can't end up over-scaled or panned off-frame.
    const g = geom();
    if (g) scale = Math.min(scale, g.maxScale);
    refreshFitCenter();
    clampPan();
    applyTransform(false);
  });

  // Back gesture / button: pop closes the lightbox rather than leaving the page.
  // The browser has already removed our pushed entry, so just hide (no back()).
  window.addEventListener('popstate', () => {
    if (!isOpen()) return;
    historyPushed = false;
    hideLightbox();
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
  setActiveImage(); // resets any zoom before revealing the new slide
  position();
  updateDots();
}

function step(delta: number) {
  go(index + delta);
}

// ─── Zoom / pan ──────────────────────────────────────────────────────────────

function isZoomed() {
  return scale > 1 + ZOOM_EPS;
}

// Point the module at the current slide's image and clear zoom state. Called on
// open and on every navigation.
function setActiveImage() {
  const slide = track.children[index] as HTMLElement | undefined;
  activeImg = slide?.querySelector('.lightbox__image') as HTMLImageElement | null;
  resetZoom(false);
}

// Geometry of the active image at fit (scale 1): its layout box, the size of the
// contained (letterboxed) content within that box, and the scale that renders
// the image at its native 1:1 pixel size — the zoom cap. Returns null until the
// image has loaded (naturalWidth known).
function geom() {
  const img = activeImg;
  if (!img || !img.naturalWidth) return null;
  const boxW = img.clientWidth;
  const boxH = img.clientHeight;
  const ar = img.naturalWidth / img.naturalHeight;
  let contentW: number;
  let contentH: number;
  if (boxW / boxH > ar) {
    contentH = boxH;
    contentW = boxH * ar;
  } else {
    contentW = boxW;
    contentH = boxW / ar;
  }
  const maxScale = Math.max(1, img.naturalWidth / contentW);
  return { boxW, boxH, contentW, contentH, maxScale };
}

// Screen-space centre of the active image at its fit position (tx/ty = 0). The
// transformed centre is always fitC + (tx, ty), since scaling about the element
// centre never moves it — so this stays valid at any scale as long as it's
// captured while the applied transform matches the current tx/ty.
let fitCx = 0;
let fitCy = 0;

function refreshFitCenter() {
  if (!activeImg) return;
  const rect = activeImg.getBoundingClientRect();
  fitCx = rect.left + rect.width / 2 - tx;
  fitCy = rect.top + rect.height / 2 - ty;
}

// Clamp the pan against the whole screen (the viewport now spans it), so the
// image can be dragged right up to the screen edges. On an axis where the
// scaled image is smaller than the screen, it's centred instead.
function clampPan() {
  const g = geom();
  if (!g) return;
  const vp = viewport.getBoundingClientRect();
  const halfW = (g.contentW * scale) / 2;
  const halfH = (g.contentH * scale) / 2;

  if (halfW * 2 >= vp.width) {
    const min = vp.right - fitCx - halfW; // content right edge ≥ screen right
    const max = vp.left - fitCx + halfW; // content left edge ≤ screen left
    tx = Math.max(min, Math.min(max, tx));
  } else {
    tx = vp.left + vp.width / 2 - fitCx; // centre on screen
  }

  if (halfH * 2 >= vp.height) {
    const min = vp.bottom - fitCy - halfH;
    const max = vp.top - fitCy + halfH;
    ty = Math.max(min, Math.min(max, ty));
  } else {
    ty = vp.top + vp.height / 2 - fitCy;
  }
}

function applyTransform(animate: boolean) {
  if (!activeImg) return;
  activeImg.style.transition = animate ? 'transform 0.25s ease' : 'none';
  activeImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  const zoomed = isZoomed();
  if (zoomed !== zoomedNow) {
    zoomedNow = zoomed;
    overlay!.classList.toggle('is-zoomed', zoomed);
    zoomBtn.innerHTML = zoomSvg(!zoomed);
    zoomBtn.setAttribute('aria-label', zoomed ? 'Zoom out' : 'Zoom in');
  }
}

function resetZoom(animate: boolean) {
  scale = 1;
  tx = 0;
  ty = 0;
  applyTransform(animate);
}

// Zoom toward the viewport point (px, py) so the image content under that point
// stays put. `target` is clamped to [fit, native].
function zoomAbout(target: number, px: number, py: number, animate: boolean) {
  const g = geom();
  if (!g) return;
  refreshFitCenter(); // DOM matches the current tx/ty at entry — capture now
  const next = Math.max(1, Math.min(g.maxScale, target));
  const rect = activeImg!.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  tx += ((scale - next) * (px - cx)) / scale;
  ty += ((scale - next) * (py - cy)) / scale;
  scale = next;
  clampPan();
  applyTransform(animate);
}

// Double-tap / button: to native if currently at fit, back to fit if zoomed.
function toggleZoom(px: number, py: number) {
  if (isZoomed()) {
    resetZoom(true);
  } else {
    const g = geom();
    if (g && g.maxScale > 1 + ZOOM_EPS) zoomAbout(g.maxScale, px, py, true);
  }
}

// Unified pointer gestures over the active image:
//   • 1 finger, not zoomed → swipe the track between slides (or tap to close /
//     double-tap to zoom in).
//   • 1 finger, zoomed → pan the image (double-tap to zoom out); slide swiping
//     is disabled.
//   • 2 fingers → pinch to zoom about the midpoint, panning as the midpoint
//     moves. Capped at native 1:1.
// Mouse double-click and wheel-zoom ride the same paths.
function attachSwipe() {
  const pointers = new Map<number, { x: number; y: number }>();
  let mode: 'none' | 'swipe' | 'pan' | 'pinch' = 'none';

  // Swipe/pan bookkeeping.
  let onImage = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let lastX = 0;
  let lastY = 0;

  // Pinch bookkeeping.
  let startDist = 0;
  let startScale = 1;
  let midX = 0;
  let midY = 0;

  // Double-tap detection (works for touch taps and mouse clicks alike).
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  function beginSinglePointer(x: number, y: number, target: EventTarget | null) {
    onImage = !!(target as HTMLElement)?.closest('.lightbox__image');
    moved = false;
    startX = x;
    startY = y;
    lastX = x;
    lastY = y;
    deltaX = 0;
    mode = isZoomed() ? 'pan' : 'swipe';
    track.style.transition = 'none';
    if (activeImg) activeImg.style.transition = 'none';
  }

  function beginPinch() {
    const pts = [...pointers.values()];
    startDist = dist(pts[0], pts[1]) || 1;
    startScale = scale;
    midX = (pts[0].x + pts[1].x) / 2;
    midY = (pts[0].y + pts[1].y) / 2;
    mode = 'pinch';
    // Cancel any in-progress track drag so the slide snaps back to rest.
    track.style.transition = 'none';
    track.style.transform = `translateX(${-index * 100}%)`;
    if (activeImg) activeImg.style.transition = 'none';
  }

  function handleTap(x: number, y: number) {
    const now = performance.now();
    if (now - lastTapTime < 300 && Math.hypot(x - lastTapX, y - lastTapY) < 30) {
      lastTapTime = 0;
      toggleZoom(x, y);
      return;
    }
    lastTapTime = now;
    lastTapX = x;
    lastTapY = y;
    // A lone tap outside the image closes; on the image it does nothing.
    if (!onImage) closeLightbox();
  }

  viewport.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.setPointerCapture?.(e.pointerId);
    if (pointers.size === 1) beginSinglePointer(e.clientX, e.clientY, e.target);
    else if (pointers.size === 2) beginPinch();
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (mode === 'pinch' && pointers.size >= 2) {
      const pts = [...pointers.values()];
      const d = dist(pts[0], pts[1]);
      const mx = (pts[0].x + pts[1].x) / 2;
      const my = (pts[0].y + pts[1].y) / 2;
      zoomAbout(startScale * (d / startDist), mx, my, false);
      tx += mx - midX; // pan with the midpoint as fingers travel
      ty += my - midY;
      midX = mx;
      midY = my;
      clampPan();
      applyTransform(false);
      return;
    }

    if (mode === 'pan') {
      refreshFitCenter(); // capture before mutating tx/ty (DOM still in sync)
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > DRAG_SLOP) moved = true;
      clampPan();
      applyTransform(false);
      return;
    }

    // Swipe.
    deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > DRAG_SLOP) moved = true;
    if (group.length < 2) return; // nothing to drag toward
    const width = viewport.clientWidth || 1;
    track.style.transform = `translateX(${-index * 100 + (deltaX / width) * 100}%)`;
  });

  const end = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    viewport.releasePointerCapture?.(e.pointerId);

    if (mode === 'pinch') {
      if (pointers.size === 1) {
        // One finger left mid-pinch — continue as a pan (or swipe once at fit).
        const p = [...pointers.values()][0];
        beginSinglePointer(p.x, p.y, null);
        moved = true; // don't treat the lift as a tap
      } else if (pointers.size === 0) {
        mode = 'none';
        if (!isZoomed()) resetZoom(true);
        else applyTransform(true);
      }
      return;
    }

    if (mode === 'pan') {
      if (pointers.size === 0) {
        mode = 'none';
        if (!moved) handleTap(e.clientX, e.clientY);
        else applyTransform(true);
      }
      return;
    }

    // Swipe end.
    mode = 'none';
    track.style.transition = '';
    if (!moved) {
      handleTap(e.clientX, e.clientY);
      if (onImage) position();
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

  // Desktop wheel zoom, toward the cursor. Only acts when there's headroom to
  // zoom, so normal (unzoomable) images don't swallow the wheel.
  viewport.addEventListener(
    'wheel',
    (e) => {
      if (!isOpen()) return;
      const g = geom();
      if (!g || g.maxScale <= 1 + ZOOM_EPS) return;
      e.preventDefault();
      zoomAbout(scale * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY, false);
      if (!isZoomed()) resetZoom(false); // snap panning to centre at fit
    },
    { passive: false }
  );
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
  setActiveImage(); // point zoom/pan at the opening slide, cleared to fit
  overlay!.classList.add('is-open');
  overlay!.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');

  // Push a history entry so the back gesture/button closes the lightbox. Guarded
  // so re-opening into a new group (while already open) doesn't stack entries.
  if (!historyPushed) {
    history.pushState({ lightbox: true }, '');
    historyPushed = true;
  }
}

// Hide the overlay without touching history — shared by the UI close path and
// the popstate handler.
function hideLightbox() {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
}

export function closeLightbox() {
  if (!isOpen()) return;
  hideLightbox();
  // Roll back the entry we pushed on open. This fires popstate, but the handler
  // no-ops because the lightbox is already hidden.
  if (historyPushed) {
    historyPushed = false;
    history.back();
  }
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
