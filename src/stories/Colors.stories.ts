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
  { name: "Grey 100 / 60%", token: "--grey-100-060", value: "rgba(249, 250, 251, 0.6)" },
  { name: "Grey 900 / 6%", token: "--grey-900-006", value: "rgba(37, 44, 60, 0.06)" },
  { name: "Grey 900 / 20%", token: "--grey-900-020", value: "rgba(37, 44, 60, 0.2)" },
  { name: "Grey 900 / 40%", token: "--grey-900-040", value: "rgba(37, 44, 60, 0.4)" },
  { name: "Grey 900 / 90%", token: "--grey-900-090", value: "rgba(37, 44, 60, 0.9)" },
];

const swatch = ({ name, token, value }: Swatch): string => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="
      height: 96px;
      border-radius: 8px;
      background-color: var(${token});
      border: 1px solid var(--border-medium);
    "></div>
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <span style="font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--type-primary);">${name}</span>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--type-secondary);">${token}</code>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--type-tertiary);">${value}</code>
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

// ── Semantic tokens ─────────────────────────────────────────────────────────
// Mirrors the "Semantic tokens" block in src/styles/tokens.css: each token's
// swatch shows what it resolves to today so the mapping stays visible even
// though it's just a var() alias under the hood.
type SemanticSwatch = { name: string; token: string; ref: string };

const typeTokens: SemanticSwatch[] = [
  { name: "Primary", token: "--type-primary", ref: "grey-900" },
  { name: "Secondary", token: "--type-secondary", ref: "grey-700" },
  { name: "Tertiary", token: "--type-tertiary", ref: "grey-600" },
  { name: "Disabled", token: "--type-disabled", ref: "grey-500" },
];

const typeInvertedTokens: SemanticSwatch[] = [
  { name: "Inverted Primary", token: "--type-inverted-primary", ref: "grey-100" },
  { name: "Inverted Secondary", token: "--type-inverted-secondary", ref: "grey-300" },
  { name: "Inverted Tertiary", token: "--type-inverted-tertiary", ref: "grey-400" },
];

const surfaceTokens: SemanticSwatch[] = [
  { name: "Surface 0", token: "--surface-0", ref: "white" },
  { name: "Surface 1", token: "--surface-1", ref: "grey-100" },
  { name: "Surface 2", token: "--surface-2", ref: "grey-200" },
  { name: "Surface 3", token: "--surface-3", ref: "grey-300" },
  { name: "Surface 5", token: "--surface-5", ref: "grey-500" },
  { name: "Surface 7", token: "--surface-7", ref: "grey-700" },
  { name: "Surface 8", token: "--surface-8", ref: "grey-800" },
  { name: "Surface 9", token: "--surface-9", ref: "grey-900" },
];

const backdropTokens: SemanticSwatch[] = [
  { name: "Backdrop Lightest", token: "--backdrop-lightest", ref: "grey-900 / 6%" },
  { name: "Backdrop Light", token: "--backdrop-light", ref: "grey-900 / 20%" },
  { name: "Backdrop Medium", token: "--backdrop-medium", ref: "grey-900 / 40%" },
  { name: "Backdrop Strong", token: "--backdrop-strong", ref: "grey-900 / 90%" },
  { name: "Backdrop Inverted", token: "--backdrop-inverted", ref: "grey-100 / 60%" },
];

const borderTokens: SemanticSwatch[] = [
  { name: "Border Strong", token: "--border-strong", ref: "grey-900" },
  { name: "Border Medium", token: "--border-medium", ref: "grey-500" },
  { name: "Border Inverted", token: "--border-inverted", ref: "grey-100" },
];

const semanticSwatch = ({ name, token, ref }: SemanticSwatch): string => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="
      height: 96px;
      border-radius: 8px;
      background-color: var(${token});
      border: 1px solid var(--border-medium);
    "></div>
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <span style="font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--type-primary);">${name}</span>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--type-secondary);">${token}</code>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--type-tertiary);">→ ${ref}</code>
    </div>
  </div>
`;

const semanticGrid = (items: SemanticSwatch[]): string => `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 24px;
  ">
    ${items.map(semanticSwatch).join("")}
  </div>
`;

export const Palette: Story = {
  name: "All Colors",
  render: () => `
    <div style="padding: 40px; background: var(--surface-1); display: flex; flex-direction: column; gap: 40px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Greyscale</h3>
        ${grid(greys)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Overlays</h3>
        ${grid(others)}
      </div>
    </div>
  `,
};

export const Greyscale: Story = {
  render: () => `
    <div style="padding: 40px; background: var(--surface-1);">${grid(greys)}</div>
  `,
};

export const SemanticTokens: Story = {
  name: "Semantic Tokens",
  render: () => `
    <div style="padding: 40px; background: var(--surface-1); display: flex; flex-direction: column; gap: 40px;">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Type</h3>
        ${semanticGrid(typeTokens)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Type — Inverted</h3>
        ${semanticGrid(typeInvertedTokens)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Surface</h3>
        ${semanticGrid(surfaceTokens)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Backdrop</h3>
        ${semanticGrid(backdropTokens)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h3 class="type-label" style="color: var(--type-tertiary);">Border</h3>
        ${semanticGrid(borderTokens)}
      </div>
    </div>
  `,
};
