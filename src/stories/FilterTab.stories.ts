import type { Meta, StoryObj } from "@storybook/html";

// CSS: src/styles/components/filter-tab.css (imported globally in preview.ts).
type FilterTabArgs = { label: string; active: boolean };

function filterTab(label: string, active: boolean): string {
  return `
    <button class="filter-tab" data-active="${active}">
      <span class="filter-tab__label type-label-sm">${label}</span>
      <span class="filter-tab__bar"></span>
    </button>
  `;
}

const meta: Meta<FilterTabArgs> = {
  title: "UI/Filter Tab",
  render: ({ label, active }) => filterTab(label, active),
  argTypes: {
    label: { control: "text", description: "Tab label" },
    active: { control: "boolean", description: "Selected state" },
  },
  args: { label: "All Skills", active: false },
  decorators: [(story) => `<div style="padding: 48px; background: var(--grey-100);">${story()}</div>`],
};

export default meta;
type Story = StoryObj<FilterTabArgs>;

export const Default: Story = { args: { label: "Design", active: false } };
export const Active: Story = { args: { label: "All Skills", active: true } };

export const Group: Story = {
  name: "Tab Row",
  render: () => {
    const cats = ["All Skills", "Application", "Design", "Code", "Other", "Irrelevant"];
    return `
      <div style="padding: 48px; background: var(--grey-100); display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-end;">
        ${cats.map((c, i) => filterTab(c, i === 0)).join("")}
      </div>
    `;
  },
};
