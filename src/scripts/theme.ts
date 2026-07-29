/**
 * Light/dark theme toggle.
 *
 * Flips `data-theme` on <html>, which drives the semantic token overrides in
 * tokens.css. Icons are plain <img>s pointing at pre-rendered Dark/Light SVG
 * files rather than currentColor glyphs, so a theme flip can't recolor them —
 * instead every icon's src is swapped between the two folders to match
 * whichever surface it now sits on.
 *
 * The choice persists in localStorage so it survives navigating between
 * pages. A blocking inline script in BaseLayout's <head> applies it to
 * <html> before first paint; this module just keeps icons/aria-label and
 * future clicks in sync with that.
 */

const ICON_SELECTOR = 'img[src*="/images/icon/"]';
const TOGGLE_ICON_ID = 'theme-toggle-icon';
const STORAGE_KEY = 'theme';

function setStoredTheme(dark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // localStorage unavailable (private mode, disabled) — theme just won't persist.
  }
}

function invertIconPath(src: string): string {
  if (src.includes('/images/icon/dark/')) return src.replace('/images/icon/dark/', '/images/icon/light/');
  if (src.includes('/images/icon/light/')) return src.replace('/images/icon/light/', '/images/icon/dark/');
  return src;
}

// Swaps every icon's Dark/Light variant to match the new theme, skipping the
// toggle button's own icon (that one also changes glyph, handled separately)
// and any icon marked `data-theme-static` — e.g. lightbox chrome, which always
// sits on the dark backdrop and so stays the Light variant in both themes.
function applyIconTheme(dark: boolean): void {
  document.querySelectorAll<HTMLImageElement>(ICON_SELECTOR).forEach(img => {
    if (img.id === TOGGLE_ICON_ID || img.dataset.themeStatic !== undefined) return;
    const lightSrc = img.dataset.lightSrc ?? img.getAttribute('src')!;
    img.dataset.lightSrc = lightSrc;
    img.setAttribute('src', dark ? invertIconPath(lightSrc) : lightSrc);
  });
}

// The toggle shows the mode a click will switch *to*: a moon while light
// (click for dark), a sun while dark (click for light) — plus the color
// variant that stays legible against its own face as that face inverts.
function applyToggleIcon(dark: boolean): void {
  const icon = document.getElementById(TOGGLE_ICON_ID) as HTMLImageElement | null;
  const button = document.getElementById('theme-toggle');
  if (!icon || !button) return;
  icon.src = dark ? '/images/icon/light/sun.svg' : '/images/icon/dark/moon.svg';
  button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

export function initThemeToggle(): void {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  // <html data-theme> was already set (or left as light) by the blocking
  // head script — sync icons to whatever that resolved to on this page load.
  const initialDark = document.documentElement.dataset.theme === 'dark';
  applyIconTheme(initialDark);
  applyToggleIcon(initialDark);

  button.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    setStoredTheme(dark);
    applyIconTheme(dark);
    applyToggleIcon(dark);
  });
}
