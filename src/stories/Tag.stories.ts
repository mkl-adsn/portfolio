import type { Meta, StoryObj } from "@storybook/html";

// The pill tag used in the case-study hero (src/pages/cases/[slug].astro) to
// list disciplines / tools. type-label-sm on a grey-900 pill.
type TagArgs = { label: string };

function renderTag({ label }: TagArgs): string {
  return `
    <span class="type-label-sm" style="
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background-color: var(--grey-900);
      color: var(--grey-100);
      border-radius: 4px;
    ">${label}</span>
  `;
}

const meta: Meta<TagArgs> = {
  title: "UI/Tag",
  render: renderTag,
  argTypes: { label: { control: "text", description: "Tag text" } },
  args: { label: "Figma" },
  decorators: [(story) => `<div style="padding: 48px; background: var(--grey-100);">${story()}</div>`],
};

export default meta;
type Story = StoryObj<TagArgs>;

export const Default: Story = {};

export const Group: Story = {
  name: "Tag Group",
  render: () => {
    const tags = ["Figma", "UX Research", "Design Systems", "Prototyping"];
    return `
      <div style="padding: 48px; background: var(--grey-100); display: flex; gap: 8px; flex-wrap: wrap;">
        ${tags.map((t) => renderTag({ label: t })).join("")}
      </div>
    `;
  },
};
