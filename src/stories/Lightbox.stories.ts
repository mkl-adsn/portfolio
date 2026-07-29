import type { Meta, StoryObj } from "@storybook/html";
import { initLightbox, openLightbox } from "../scripts/lightbox";

// CSS: src/styles/components/lightbox.css (imported globally in preview.ts).
// The lightbox is a body-level overlay opened by script. These stories provide
// triggers: a single [data-lightbox] figure, and a button that opens a group.

function panel(inner: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "padding: 48px; background: var(--surface-1); max-width: 640px; display: flex; flex-direction: column; gap: 16px;";
  wrap.innerHTML = inner;
  return wrap;
}

const meta: Meta = {
  title: "UI/Lightbox",
};

export default meta;
type Story = StoryObj;

// A standalone image: click it to open full-screen (no arrows/dots).
export const SingleImage: Story = {
  name: "Single Image",
  render: () => {
    const el = panel(`
      <p class="type-label" style="color: var(--type-tertiary);">Click the image ↓</p>
      <figure class="case-image-full" data-lightbox style="margin: 0;">
        <img src="https://picsum.photos/seed/lightbox-single/1200/760" alt="A demo image" />
        <figcaption style="font-family: var(--font-sans); font-size: 16px; color: var(--type-tertiary); text-align: center; margin-top: 12px;">
          This caption is carried into the lightbox.
        </figcaption>
      </figure>
    `);
    initLightbox(el);
    return el;
  },
};

// A grouped lightbox opened programmatically — arrows + dots appear.
export const ImageGroup: Story = {
  name: "Image Group (navigable)",
  render: () => {
    const images = ["one", "two", "three", "four"].map((seed, i) => ({
      src: `https://picsum.photos/seed/lb-${seed}/1200/760`,
      alt: `Group image ${i + 1}`,
      caption: `Image ${i + 1} of 4 — use the arrows, dots, or ← → keys.`,
    }));
    const el = panel(`
      <button type="button" style="align-self: flex-start; padding: 12px 20px; border: none; border-radius: 4px; background: var(--surface-9); color: var(--type-inverted-primary); font-family: var(--font-sans); font-weight: 600; font-size: 14px; cursor: pointer;">Open group in lightbox</button>
    `);
    el.querySelector("button")!.addEventListener("click", () => openLightbox(images, 0));
    return el;
  },
};
