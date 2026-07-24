/**
 * TEMPORARY device-diagnostic overlay. Activated only when the URL contains
 * `?debug` (see BaseLayout.astro), so normal visitors never load it.
 *
 * Prints live viewport / scroll / nav metrics so we can diagnose the Android
 * sticky-nav gap and the on-load scroll jump on a real device. Delete this file
 * and its import in BaseLayout.astro once the bugs are fixed.
 */
export function initDebugOverlay() {
  const box = document.createElement('div');
  box.style.cssText =
    'position:fixed;left:0;bottom:0;z-index:99999;background:rgba(0,0,0,.82);' +
    'color:#0f0;font:11px/1.45 monospace;padding:6px 8px;white-space:pre;' +
    'pointer-events:none;max-width:100vw;';
  // Append after DOM is ready.
  const attach = () => document.body.appendChild(box);
  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach);

  const vv = window.visualViewport;

  // ── On-load scroll timeline (diagnoses the "jump past hero" bug) ───────────
  // Record scrollY at fixed moments after load and track the peak, so we can see
  // whether/when the page auto-scrolls away from the top.
  let maxScroll = 0;
  const loadLog: string[] = [];
  [0, 100, 300, 600, 1000, 2000, 3500].forEach((ms) =>
    setTimeout(() => loadLog.push(`${ms}:${Math.round(window.scrollY)}`), ms)
  );

  function render() {
    maxScroll = Math.max(maxScroll, window.scrollY);
    const nav = document.querySelector('#main-nav');
    const navTop = nav ? Math.round(nav.getBoundingClientRect().top) : -1;
    const hero = document.querySelector('#hero');
    const heroH = hero ? Math.round((hero as HTMLElement).getBoundingClientRect().height) : -1;

    box.textContent = [
      `scrollY ${Math.round(window.scrollY)}   peak ${Math.round(maxScroll)}`,
      `innerH ${window.innerHeight}   docClientH ${document.documentElement.clientHeight}`,
      vv
        ? `vv.h ${Math.round(vv.height)}  vv.offTop ${Math.round(vv.offsetTop)}  vv.pageTop ${Math.round(vv.pageTop)}`
        : 'no visualViewport',
      `navTop(rect) ${navTop}   heroH ${heroH}`,
      `scroller ${document.scrollingElement?.tagName ?? '?'}`,
      `load ${loadLog.join(' ')}`,
    ].join('\n');

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
