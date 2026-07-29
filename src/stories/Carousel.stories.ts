import type { Meta, StoryObj } from "@storybook/html";
import { initCarousel } from "../scripts/carousel";

// CSS: src/styles/components/carousel.css (imported globally in preview.ts).
// The carousel needs its behaviour script, so each story builds a real DOM node
// and calls initCarousel() scoped to it (arrows + dots are injected there).

type Slide = { src: string; alt?: string; caption?: string };
type CarouselArgs = { count: number; captions: boolean };

const SEEDS = ["alpha", "bravo", "charlie", "delta", "echo"];

function slidesMarkup(slides: Slide[]): string {
  return slides
    .map(
      (s) => `
      <figure class="carousel__slide">
        <img src="${s.src}" alt="${s.alt ?? ""}" />
        ${s.caption ? `<figcaption>${s.caption}</figcaption>` : ""}
      </figure>`
    )
    .join("");
}

function carousel(slides: Slide[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "padding: 48px; background: var(--surface-1); max-width: 760px;";
  wrap.innerHTML = `
    <div class="carousel" data-carousel>
      <div class="carousel__viewport">
        <div class="carousel__track">${slidesMarkup(slides)}</div>
      </div>
    </div>
  `;
  initCarousel(wrap);
  return wrap;
}

function buildSlides(count: number, captions: boolean): Slide[] {
  return Array.from({ length: count }, (_, i) => ({
    src: `https://picsum.photos/seed/${SEEDS[i % SEEDS.length]}/900/560`,
    alt: `Demo slide ${i + 1}`,
    caption: captions ? `Slide ${i + 1} of ${count} — click to open the lightbox` : undefined,
  }));
}

const meta: Meta<CarouselArgs> = {
  title: "UI/Carousel",
  render: ({ count, captions }) => carousel(buildSlides(count, captions)),
  argTypes: {
    count: { control: { type: "range", min: 1, max: 5, step: 1 }, description: "Number of slides" },
    captions: { control: "boolean", description: "Show per-slide captions" },
  },
  args: { count: 3, captions: true },
};

export default meta;
type Story = StoryObj<CarouselArgs>;

export const Default: Story = {};
export const WithoutCaptions: Story = { name: "Without Captions", args: { captions: false } };
export const SingleImage: Story = { name: "Single Image", args: { count: 1 } };
export const ManyImages: Story = { name: "Many Images", args: { count: 5 } };
