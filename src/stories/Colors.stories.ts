import type { Meta, StoryObj } from "@storybook/html";

const meta: Meta = {
  title: "Design System/Colors",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

type Swatch = { name: string; token: string; value: string };

const greys: Swatch[] = [
  { name: "White", token: "--white", value: "#ffffff" },
  { name: "Grey 100", token: "--grey-100", value: "#f9fafb" },
  { name: "Grey 200", token: "--grey-200", value: "#f0f2f4" },
  { name: "Grey 300", token: "--grey-300", value: "#E7EAEE" },
  { name: "Grey 400", token: "--grey-400", value: "#CACFD8" },
  { name: "Grey 500", token: "--grey-500", value: "#A7AFBE" },
  { name: "Grey 600", token: "--grey-600", value: "#768193" },
  { name: "Grey 700", token: "--grey-700", value: "#525b6c" },
  { name: "Grey 800", token: "--grey-800", value: "#384051" },
  { name: "Grey 900", token: "--grey-900", value: "#252c3c" },
];

const others: Swatch[] = [
  { name: "Accent", token: "--accent", value: "#8793af" },
  { name: "Grey 900 / 6%", token: "--grey-900-006", value: "rgba(37, 44, 60, 0.06)" },
];

const swatch = ({ name, token, value }: Swatch): string => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="
      height: 96px;
      border-radius: 8px;
      background-color: var(${token});
      border: 1px solid var(--grey-300);
    "></div>
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <span style="font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--grey-900);">${name}</span>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--grey-600);">${token}</code>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--grey-500);">${value}</code>
    </div>
  </div>
`;

const grid = (items: Swatch[]): string => `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 24px;
  ">
    ${items.map(swatch).join("")}
  </div>
`;

export const Palette: Story = {
  name: "All Colors",
  render: () => `
    <div style="padding: 40px; background: var(--grey-100); display: flex; flex-direction: column; gap: 40px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--grey-600);">Greyscale</h3>
        ${grid(greys)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--grey-600);">Accent & overlays</h3>
        ${grid(others)}
      </div>
    </div>
  `,
};

export const Greyscale: Story = {
  render: () => `
    <div style="padding: 40px; background: var(--grey-100);">${grid(greys)}</div>
  `,
};
