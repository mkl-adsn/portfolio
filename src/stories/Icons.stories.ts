import type { Meta, StoryObj } from "@storybook/html";

const meta: Meta = {
  title: "Design System/Icons",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

// Icon files live in /public/images/Icon/{Dark,Light}. Dark = dark glyphs for
// light backgrounds; Light = white glyphs for dark backgrounds.
const ICONS = [
  "Search",
  "Location",
  "Mail",
  "Phone",
  "Linkedin",
  "Download",
  "Arrow left",
  "Star Filled",
  "Star Outline",
];

const cell = (name: string, folder: "Dark" | "Light"): string => `
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: ${folder === "Light" ? "var(--grey-900)" : "var(--white)"};
      border: 1px solid var(--grey-300);
    ">
      <img src="/images/Icon/${folder}/${encodeURIComponent(name)}.svg" width="24" height="24" alt="${name}" />
    </div>
    <span style="font-family: var(--font-sans); font-size: 12px; color: var(--grey-600);">${name}</span>
  </div>
`;

const grid = (folder: "Dark" | "Light"): string => `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 16px;
  ">
    ${ICONS.map((n) => cell(n, folder)).join("")}
  </div>
`;

export const All: Story = {
  name: "All Icons",
  render: () => `
    <div style="padding: 40px; background: var(--grey-100); display: flex; flex-direction: column; gap: 40px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--grey-600);">Dark — for light backgrounds</h3>
        ${grid("Dark")}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--grey-600);">Light — for dark backgrounds</h3>
        ${grid("Light")}
      </div>
    </div>
  `,
};
