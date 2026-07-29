import type { Meta, StoryObj } from "@storybook/html";

const meta: Meta = {
  title: "Design System/Icons",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

// Icon files live in /public/images/icon/{dark,light}. Dark = dark glyphs for
// light backgrounds; Light = white glyphs for dark backgrounds. Most files are
// named "Title Case.svg", but the star glyphs are "kebab-case.svg" — file is
// the real basename on disk, label is just the display name.
const ICONS = [
  { label: "Search", file: "search" },
  { label: "Location", file: "location" },
  { label: "Mail", file: "mail" },
  { label: "Phone", file: "phone" },
  { label: "Linkedin", file: "linkedin" },
  { label: "Download", file: "download" },
  { label: "Arrow left", file: "arrow-left" },
  { label: "Star Filled", file: "star-filled" },
  { label: "Star Outline", file: "star-outline" },
];

const cell = (label: string, file: string, folder: "dark" | "light"): string => `
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: ${folder === "light" ? "var(--surface-9)" : "var(--surface-0)"};
      border: 1px solid var(--grey-300);
    ">
      <img src="/images/icon/${folder}/${encodeURIComponent(file)}.svg" width="24" height="24" alt="${label}" />
    </div>
    <span style="font-family: var(--font-sans); font-size: 12px; color: var(--type-tertiary);">${label}</span>
  </div>
`;

const grid = (folder: "dark" | "light"): string => `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 16px;
  ">
    ${ICONS.map(({ label, file }) => cell(label, file, folder)).join("")}
  </div>
`;

export const All: Story = {
  name: "All Icons",
  render: () => `
    <div style="padding: 40px; background: var(--surface-1); display: flex; flex-direction: column; gap: 40px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Dark — for light backgrounds</h3>
        ${grid("dark")}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Light — for dark backgrounds</h3>
        ${grid("light")}
      </div>
    </div>
  `,
};
