import type { Meta, StoryObj } from "@storybook/html";

// The pill tag used to list disciplines/tools: `variant="light"` on the case
// list (src/layouts/Cases.astro), `variant="dark"` on a case's own hero
// (src/pages/cases/[case].astro). Styles: src/styles/components/tag.css.
type TagArgs = { label: string; variant: "light" | "dark" };

function renderTag({ label, variant }: TagArgs): string {
  return `<span class="tag tag--${variant} type-label-sm">${label}</span>`;
}

const meta: Meta<TagArgs> = {
  title: "UI/Tag",
  render: renderTag,
  argTypes: {
    label: { control: "text", description: "Tag text" },
    variant: { control: "radio", options: ["light", "dark"] },
  },
  args: { label: "Figma", variant: "dark" },
  decorators: [(story) => `<div style="padding: 48px; background: var(--grey-100);">${story()}</div>`],
};

export default meta;
type Story = StoryObj<TagArgs>;

export const Dark: Story = {};

export const Light: Story = {
  args: { variant: "light" },
};

export const Group: Story = {
  name: "Tag Group",
  render: () => {
    const tags = ["Figma", "UX Research", "Design Systems", "Prototyping"];
    return `
      <div style="padding: 48px; background: var(--grey-100); display: flex; gap: 8px; flex-wrap: wrap;">
        ${tags.map((label) => renderTag({ label, variant: "dark" })).join("")}
      </div>
    `;
  },
};
