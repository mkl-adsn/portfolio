/** Hero typewriter — types out the hero heading, then staggers the CTA buttons in. */

import gsap from 'gsap';
import { heroSegments } from '../content/data/hero';
import { prefersReducedMotion } from './motion';

export function initHeroTypewriter() {
  const container = document.getElementById('hero-typewriter');
  const cursor    = document.querySelector<HTMLElement>('.hero-cursor');
  const buttonsEl = document.getElementById('hero-buttons');

  if (!container || !cursor || !buttonsEl) return;

  // Non-null assertions — narrowed by the guard above but not visible inside closures
  const _container = container!;
  const _cursor    = cursor!;
  const _buttonsEl = buttonsEl!

  const segments = heroSegments;

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

  // Reduced motion: skip the typing/stagger animation and show the finished state.
  if (prefersReducedMotion()) {
    _container.innerHTML = buildHTML(chars.length);
    _cursor.classList.add('done');
    _buttonsEl.style.opacity = '1';
    return;
  }

  let index = 0;
  const SPEED_MS = 25; // ms per character

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

  // Wait for Warnock Pro to load AND for the minimum pause to elapse.
  // font-display:swap means the browser renders the fallback immediately, so
  // without this gate the first characters appear in the wrong typeface.
  // Promise.all ensures neither condition alone is sufficient to start early.
  Promise.all([
    document.fonts.load('400 60px "Warnock Pro"'),
    document.fonts.load('600 60px "Warnock Pro"'),
    new Promise<void>(resolve => setTimeout(resolve, 1200)),
  ]).then(() => tick());
}
