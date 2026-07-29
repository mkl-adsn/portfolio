import type { Meta, StoryObj } from "@storybook/html";

// CSS: src/styles/components/nav.css (imported globally in preview.ts).
// .nav::after (the noise overlay) is positioned absolutely; in the app the
// sticky .nav-wrapper is its containing block. Here we wrap it in a positioned,
// clipped box so the noise stays contained within the story frame.
const ITEMS = ["Cases", "Bio", "CV", "Contact"];

function navBar(activeIndex: number): string {
  const tabs = ITEMS.map(
    (label, i) =>
      `<a href="#" class="nav__tab type-label-sm ${i === activeIndex ? "active" : ""}">${label}</a>`
  ).join("");
  return `
    <div style="position: relative; display: inline-flex; overflow: hidden; border-radius: 8px;">
      <nav class="nav" aria-label="Page sections">${tabs}</nav>
    </div>
  `;
}

const meta: Meta = {
  title: "UI/Nav Bar",
  parameters: { controls: { disable: true } },
  decorators: [
    (story) => `<div style="padding: 48px; background: var(--surface-2); display: flex; justify-content: center;">${story()}</div>`,
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => navBar(0) };
export const ContactActive: Story = { name: "Contact Active", render: () => navBar(3) };
