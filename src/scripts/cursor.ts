/**
 * Custom cursor — hand-with-pen illustration.
 *
 * Only active on devices with a fine pointer (mouse / trackpad).
 * Touch / coarse-pointer devices keep the native cursor and the
 * #custom-cursor element is hidden entirely via CSS.
 *
 * The cursor image has the pen nib at a fixed pixel offset from its
 * top-left corner (HOTSPOT_X, HOTSPOT_Y). The transform is adjusted
 * so the nib tracks the exact mouse position.
 */

import { prefersReducedMotion } from './motion';

// Pixel offset from the top-left corner of the cursor image to the pen nib.
// Tune these if the cursor images are resized.
const HOTSPOT_X = 68;
const HOTSPOT_Y = 34;

// Interpolation factor per frame (0–1). Lower = more trail, higher = snappier.
// At 60 fps, 0.12 gives ~4-5 frames of lag on a fast move.
const LERP = 0.12;

// Stop the animation loop once the cursor is within this many px of the target.
const SETTLE_THRESHOLD = 0.15;

export function initCustomCursor() {
  // Only activate for mouse / trackpad — skip touch and stylus-only devices.
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // Respect reduced-motion: keep the native system cursor and don't run the
  // trail loop. CSS hides #custom-cursor and leaves the native cursor visible.
  if (prefersReducedMotion()) return;

  const el = document.getElementById('custom-cursor');
  if (!el) return;

  // targetX/Y: where the mouse actually is.
  // cx/cy: where the cursor image currently is (lerped toward target each frame).
  let targetX = -400;
  let targetY = -400;
  let cx = -400;
  let cy = -400;
  let loopRunning = false;

  function loop() {
    cx += (targetX - cx) * LERP;
    cy += (targetY - cy) * LERP;

    el!.style.transform = `translate(${cx - HOTSPOT_X}px, ${cy - HOTSPOT_Y}px)`;

    // Keep looping until the cursor has settled at the target.
    if (Math.abs(targetX - cx) > SETTLE_THRESHOLD || Math.abs(targetY - cy) > SETTLE_THRESHOLD) {
      requestAnimationFrame(loop);
    } else {
      loopRunning = false;
    }
  }

  // While pressed, the cursor stays in is-pressed until the pointer has been
  // dragged past this distance from where it went down — so a click with a
  // little wobble keeps the pressed look instead of flickering off.
  const DRAG_RELEASE_DISTANCE = 24;

  let pressed = false;
  let pressX = 0;
  let pressY = 0;

  const clearPressed = () => {
    pressed = false;
    el!.classList.remove('is-pressed');
  };

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!loopRunning) {
      loopRunning = true;
      requestAnimationFrame(loop);
    }
    // Release the pressed look only once the drag exceeds the threshold.
    if (pressed && Math.hypot(e.clientX - pressX, e.clientY - pressY) > DRAG_RELEASE_DISTANCE) {
      clearPressed();
    }
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => {
    pressed = true;
    pressX = e.clientX;
    pressY = e.clientY;
    el!.classList.add('is-pressed');
  });
  document.addEventListener('pointerup', clearPressed);

  // Pressing on a link (buttons render as <a> when they have href) and moving
  // starts a native link-drag. That drag hijacks the pointer: it swallows
  // pointerup and stops the cursor tracking and further clicks until it ends.
  // Cancelling the drag at the source keeps the normal pointer interaction
  // intact — the pressed look is released by the distance check above instead.
  document.addEventListener('dragstart', (e) => e.preventDefault());

  // pointercancel covers other cases where the browser takes over the pointer;
  // window blur covers releasing the button after the window lost focus.
  document.addEventListener('pointercancel', clearPressed);
  window.addEventListener('blur', clearPressed);

  // Hide the cursor element when the pointer leaves the browser window.
  document.addEventListener('mouseleave', () => el!.classList.add('is-outside'));
  document.addEventListener('mouseenter', () => el!.classList.remove('is-outside'));
}
