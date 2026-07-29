import type { Meta, StoryObj } from "@storybook/html";

// CSS: src/styles/components/search-box.css (imported globally in preview.ts).
type SearchBoxArgs = { placeholder: string; value: string };

function searchBox(placeholder: string, value: string): string {
  return `
    <div class="search-box" style="max-width: 480px;">
      <div class="search-box__face">
        <img src="/images/icon/dark/search.svg" width="24" height="24" alt="" style="flex-shrink: 0;" />
        <input type="text" placeholder="${placeholder}" value="${value}" class="search-box__input type-body" autocomplete="off" />
      </div>
      <div class="search-box__edge"></div>
    </div>
  `;
}

const meta: Meta<SearchBoxArgs> = {
  title: "UI/Search Box",
  render: ({ placeholder, value }) => searchBox(placeholder, value),
  argTypes: {
    placeholder: { control: "text" },
    value: { control: "text" },
  },
  args: { placeholder: "Type to find skill...", value: "" },
  decorators: [(story) => `<div style="padding: 48px; background: var(--surface-1);">${story()}</div>`],
};

export default meta;
type Story = StoryObj<SearchBoxArgs>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: "Figma" } };
