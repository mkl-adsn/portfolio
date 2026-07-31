import type { Meta, StoryObj } from "@storybook/html";
import { iconMarkup, iconNames, type IconName, type IconTone } from "../scripts/icons";

const meta: Meta = {
  title: "Design System/Icons",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

// Every icon is a single currentColor SVG in src/icons/, coloured at use-time by
// a symbol token via the .icon tones. One file per icon serves every theme and
// tone — editing it updates all usages.

const cell = (name: IconName, tone: IconTone, size = 24): string => `
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: ${tone === "inverted" || tone === "fixed-light" ? "var(--surface-9)" : "var(--surface-0)"};
      border: 1px solid var(--border-medium);
    ">
      ${iconMarkup(name, { tone, size })}
    </div>
    <span style="font-family: var(--font-sans); font-size: 12px; color: var(--type-tertiary);">${name}</span>
  </div>
`;

const grid = (tone: IconTone): string => `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 16px;
  ">
    ${iconNames.map((name) => cell(name, tone)).join("")}
  </div>
`;

const section = (title: string, tone: IconTone): string => `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <h3 class="type-label" style="color: var(--type-tertiary);">${title}</h3>
    ${grid(tone)}
  </div>
`;

export const All: Story = {
  name: "All Icons",
  render: () => `
    <div style="padding: 40px; background: var(--surface-1); display: flex; flex-direction: column; gap: 40px;">
      ${section("symbol-strong — default, on the page surface", "strong")}
      ${section("symbol-medium — muted (e.g. contact section)", "medium")}
      ${section("symbol-inverted — on an inverting dark surface", "inverted")}
    </div>
  `,
};
