import type { Meta, StoryObj } from "@storybook/html";

// CSS: src/styles/components/phone.css (imported globally in preview.ts).
type PhoneArgs = { image: string; alt: string };

function phone(image: string, alt: string): string {
  return `
    <div class="phone">
      <div class="phone__shell">
        <div class="phone__bezel"></div>
        <div class="phone__screen">
          ${image ? `<img src="${image}" alt="${alt}" class="phone__image" />` : ""}
          <div class="phone__status-bar">
            <span class="type-label-sm" style="color: black;">10:00</span>
            <div class="phone__status-icons">
              <span class="phone__status-icon"></span>
              <span class="phone__status-icon"></span>
              <span class="phone__status-icon"></span>
            </div>
          </div>
        </div>
        <div class="phone__home-indicator"></div>
        <div class="phone__home-shadow"></div>
      </div>
    </div>
  `;
}

const meta: Meta<PhoneArgs> = {
  title: "UI/Phone Mockup",
  render: ({ image, alt }) => phone(image, alt),
  argTypes: {
    image: { control: "text", description: "Screen image URL" },
    alt: { control: "text" },
  },
  args: { image: "/images/case-placeholder-image.png", alt: "App screen" },
  decorators: [(story) => `<div style="padding: 48px; background: var(--grey-200);">${story()}</div>`],
};

export default meta;
type Story = StoryObj<PhoneArgs>;

export const WithImage: Story = { name: "With Image" };
export const Empty: Story = { args: { image: "" } };
