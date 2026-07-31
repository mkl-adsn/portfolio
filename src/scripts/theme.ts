/**
 * Light/dark theme toggle.
 *
 * Flips `data-theme` on <html>, which drives the semantic token overrides in
 * colors.css. Icons are inline SVGs coloured with `currentColor` via symbol
 * tokens (see src/scripts/icons.ts + icon.css), so a theme flip recolours them
 * automatically — no per-icon swapping needed here. This module only keeps the
 * toggle's own glyph (moon ↔ sun) and aria-label in sync, and persists the
 * choice.
 *
 * The choice persists in localStorage so it survives navigating between pages.
 * A blocking inline script in BaseLayout's <head> applies it to <html> before
 * first paint; this module just syncs the toggle and future clicks with that.
 */

import { iconSvg } from './icons';

const STORAGE_KEY = 'theme';

function setStoredTheme(dark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // localStorage unavailable (private mode, disabled) — theme just won't persist.
  }
}

// The toggle shows the mode a click will switch *to*: a moon while light
// (click for dark), a sun while dark (click for light).
function applyToggleIcon(dark: boolean): void {
  const button = document.getElementById('theme-toggle');
  const icon = button?.querySelector('.icon');
  if (!button || !icon) return;
  icon.innerHTML = iconSvg(dark ? 'sun' : 'moon');
  button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

export function initThemeToggle(): void {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  // <html data-theme> was already set (or left as light) by the blocking head
  // script — sync the toggle glyph to whatever that resolved to on this load.
  const initialDark = document.documentElement.dataset.theme === 'dark';
  applyToggleIcon(initialDark);

  button.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    setStoredTheme(dark);
    applyToggleIcon(dark);
  });
}
