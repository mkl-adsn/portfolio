/**
 * Scroll-driven "sketch to full" reveal animations.
 *
 * Text:   Dual-layer (outlined skeleton + clipped fill) — reveals left→right
 *         as the element enters the viewport bottom.
 * Images: CSS filter scrub (grayscale+contrast+blur → full color).
 * Text blocks (.reveal-text): simple opacity + translateY fade-in.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Utility ────────────────────────────────────────────────────────────── */

/** Wrap a text node's content in a dual-layer structure for the draw effect. */
function wrapDrawHeading(el: HTMLElement) {
  const original = el.innerHTML;

  // Outline ghost (skeleton always visible)
  const outlineEl = document.createElement('span');
  outlineEl.className = 'draw-outline-layer';
  outlineEl.setAttribute('aria-hidden', 'true');
  outlineEl.innerHTML = original;
  Object.assign(outlineEl.style, {
    display: 'block',
    WebkitTextStroke: '1px var(--grey-900)',
    color: 'transparent',
    userSelect: 'none',

  });

  // Fill layer (clipped)
  const fillEl = document.createElement('span');
  fillEl.className = 'draw-fill-layer';
  fillEl.innerHTML = original;
  Object.assign(fillEl.style, {
    display: 'block',
    position: 'absolute',
    inset: '0',
    color: 'var(--grey-900)',
    clipPath: 'inset(0 100% 0 0)',
    whiteSpace: 'inherit',
   
  });

  el.style.position = 'relative';
  el.innerHTML = '';
  el.appendChild(outlineEl);
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
    { text: 'Senior UX/UI Designer aligning product vision with technical execution.', bold: true  },
    { text: ' Brings together stakeholder input and development understanding to create ', bold: false },
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
  // ── 1. Draw-heading: outline → fill ─────────────────────────────────────
  document.querySelectorAll<HTMLElement>('.draw-heading').forEach(el => {
    const fillLayer = wrapDrawHeading(el);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      end: 'top 30%',
      scrub: 0.8,
      onUpdate(self) {
        const pct = Math.round(self.progress * 1000) / 10; // 0–100
        fillLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      },
    });
  });

  // ── 2. Images: sketch filter → full color ────────────────────────────────
  document.querySelectorAll<HTMLElement>('.draw-image').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      end: 'top 20%',
      scrub: 1,
      onUpdate(self) {
        const p = self.progress; // 0 → 1
        const grayscale  = 1 - p;
        const contrast   = 1 + (0.8 * (1 - p));     // 1.8 → 1.0
        const brightness = 1 + (0.15 * (1 - p));    // 1.15 → 1.0
        const blur       = (0.5 * (1 - p)).toFixed(2); // 0.5px → 0
        el.style.filter = `grayscale(${grayscale.toFixed(2)}) contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)}) blur(${blur}px)`;
      },
    });
  });

  // ── 3. Body text blocks: fade + rise ─────────────────────────────────────
  document.querySelectorAll<HTMLElement>('.reveal-text').forEach(el => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // ── 4. Content blocks: scale 0 → 1 (zoom in from bottom) ────────────────
  // document.querySelectorAll<HTMLElement>('.zoom-in').forEach(el => {
  //   ScrollTrigger.create({
  //     trigger: el,
  //     start: 'top 100%',   // element's top edge enters viewport
  //     end: 'top 90%',      // element's top at 1/3 from bottom (100% − 33%)
  //     scrub: 0.8,
  //     onUpdate(self) {
  //       el.style.transform = `scale(${self.progress.toFixed(4)})`;
  //     },
  //   });
  // });
}
