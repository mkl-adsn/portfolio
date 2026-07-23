import type { Meta, StoryObj } from "@storybook/html";

const meta: Meta = {
  title: "Design System/Typography",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

const row = (label: string, cls: string, tag: string, sample: string) => `
  <div style="display: grid; grid-template-columns: 140px 1fr; align-items: baseline; gap: 24px; padding: 20px 0; border-bottom: 1px solid var(--grey-300);">
    <div style="font-family: var(--font-sans); font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--grey-600);">
      ${label}<br>
      <code style="font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--grey-500);">.${cls}</code>
    </div>
    <${tag} class="${cls}" style="margin: 0;">${sample}</${tag}>
  </div>
`;

const allRows = `
  ${row("H1", "type-h1", "h1", "The quick brown fox jumps")}
  ${row("H1 Semibold", "type-h1", "h1", "The quick <strong>brown fox</strong> jumps")}
  ${row("H2", "type-h2", "h2", "The quick brown fox jumps")}
  ${row("H3", "type-h3", "h3", "The quick brown fox jumps over the lazy dog")}
  ${row("Preamble", "type-preamble", "p", "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.")}
  ${row("Body", "type-body", "p", "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.")}
  ${row("Body Bold", "type-body-bold", "p", "The quick brown fox jumps over the lazy dog")}
  ${row("Label", "type-label", "span", "Label medium")}
  ${row("Label SM", "type-label-sm", "span", "Label small")}
`;

export const All: Story = {
  name: "All Styles",
  render: () => `
    <div style="padding: 40px; max-width: 900px; background: var(--grey-100);">
      <div style="border-top: 1px solid var(--grey-300);">
        ${allRows}
      </div>
    </div>
  `,
};

export const Headings: Story = {
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 32px; background: var(--grey-100);">
      <h1 class="type-h1">H1 — Warnock Pro Regular 60px</h1>
      <h1 class="type-h1">H1 with <strong>Semibold</strong> spans</h1>
      <h2 class="type-h2">H2 — Warnock Pro Regular 44px</h2>
      <h3 class="type-h3">H3 — Warnock Pro Regular 28px</h3>
    </div>
  `,
};

export const Body: Story = {
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 640px; background: var(--grey-100);">
      <p class="type-preamble">Preamble — Figtree 400 24px/1.5. The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.</p>
      <p class="type-body">Body — Figtree 400 18px/24px. The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. Pack my box with five dozen liquor jugs.</p>
      <p class="type-body-bold">Body Bold — Figtree 600 18px. The quick brown fox jumps over the lazy dog.</p>
    </div>
  `,
};

export const Labels: Story = {
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; background: var(--grey-100);">
      <span class="type-label">Label — Figtree 700 15px / 2.25px tracking</span>
      <span class="type-label-sm">Label SM — Figtree 700 13px / 2px tracking</span>
    </div>
  `,
};

export const OnDark: Story = {
  name: "On Dark Background",
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px; background: var(--grey-900);">
      <h2 class="type-h2" style="color: var(--grey-100);">H2 on dark</h2>
      <h3 class="type-h3" style="color: var(--grey-400);">H3 on dark</h3>
      <p class="type-body" style="color: var(--grey-100);">Body text on dark background.</p>
      <p class="type-body-bold" style="color: var(--grey-100);">Body bold on dark.</p>
      <span class="type-label" style="color: var(--grey-400);">Label on dark</span>
    </div>
  `,
};
