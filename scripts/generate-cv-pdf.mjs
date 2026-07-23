/**
 * Local step: render the print-optimized `/cv` route to a PDF.
 *
 * Run manually via `npm run build:cv` (or `npm run generate:cv`) — NOT part of
 * the deploy `build`, since the Vercel build environment has no Chromium binary.
 * The generated `public/cv.pdf` is committed to the repo and served as-is.
 *
 * Serves the built `dist/` with Astro's programmatic preview server, renders
 * `/cv` in headless Chromium, and writes the PDF to:
 *   - dist/cv.pdf    → local build output
 *   - public/cv.pdf  → committed; served by dev and every deploy
 *
 * The "Download CV" buttons point at /cv.pdf, so no app code needs to know this
 * script exists.
 */
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { copyFile, mkdir } from 'node:fs/promises';
import { preview } from 'astro';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distPdf = resolve(root, 'dist/cv.pdf');
const publicPdf = resolve(root, 'public/cv.pdf');

const server = await preview({ root });
const browser = await chromium.launch();

try {
  const { host, port } = server;
  const origin = `http://${host === '::' || host === '0.0.0.0' ? 'localhost' : host}:${port}`;

  const page = await browser.newPage();
  const response = await page.goto(`${origin}/cv`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) {
    throw new Error(`Failed to load /cv (status ${response ? response.status() : 'no response'})`);
  }

  // Ensure @font-face fonts are loaded before printing so they embed correctly.
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: distPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });

  await mkdir(dirname(publicPdf), { recursive: true });
  await copyFile(distPdf, publicPdf);

  console.log(`✓ cv.pdf generated → ${distPdf} and ${publicPdf}`);
} finally {
  await browser.close();
  await server.stop();
}
