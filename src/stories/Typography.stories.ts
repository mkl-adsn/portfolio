import type { Meta, StoryObj } from "@storybook/html";

const meta: Meta = {
  title: "Design System/Typography",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

// ─── Live metrics ────────────────────────────────────────────────────────────
// Specs are read off the real `.type-*` classes at render time instead of being
// typed out here — so they can't drift from typography.css, and they re-read
// when the theme toolbar flips (dark mode drops some weights). Reads the
// declared font-family/weight/size straight from computed style, so font
// loading doesn't affect the numbers.

function spec(cls: string): string {
  const el = document.createElement("span");
  el.className = cls;
  el.textContent = "Ag";
  el.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  const family = cs.fontFamily.split(",")[0].replace(/["']/g, "");
  const weight = cs.fontWeight;
  const size = Math.round(parseFloat(cs.fontSize));
  const lh = cs.lineHeight === "normal" ? null : Math.round(parseFloat(cs.lineHeight));
  el.remove();
  return `${family} ${weight} · ${size}px${lh ? ` / ${lh}px` : ""}`;
}

const row = (label: string, cls: string, tag: string, sample: string) => `
  <div style="display: grid; grid-template-columns: 200px 1fr; align-items: baseline; gap: 24px; padding: 20px 0; border-bottom: 1px solid var(--border-medium);">
    <div style="font-family: var(--font-sans); font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--type-tertiary);">
      ${label}<br>
      <code style="font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--type-tertiary);">.${cls}</code><br>
      <code style="font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--type-tertiary);">${spec(cls)}</code>
    </div>
    <${tag} class="${cls}" style="margin: 0;">${sample}</${tag}>
  </div>
`;

const allRows = () => `
  ${row("H1", "type-h1", "h1", "The quick brown fox jumps")}
  ${row("H1 Semibold", "type-h1", "h1", "The quick <strong>brown fox</strong> jumps")}
  ${row("H2", "type-h2", "h2", "The quick brown fox jumps")}
  ${row("H3", "type-h3", "h3", "The quick brown fox jumps over the lazy dog")}
  ${row("Preamble", "type-preamble", "p", "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.")}
  ${row("Body", "type-body", "p", "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.")}
  ${row("Body Bold", "type-body-bold", "p", "The quick brown fox jumps over the lazy dog")}
  ${row("Caption", "type-caption", "p", "The quick brown fox jumps over the lazy dog")}
  ${row("Label", "type-label", "span", "Label medium")}
  ${row("Label SM", "type-label-sm", "span", "Label small")}
`;

export const All: Story = {
  name: "All Styles",
  render: () => `
    <div style="padding: 40px; max-width: 900px; background: var(--surface-1);">
      <div style="border-top: 1px solid var(--border-medium);">
        ${allRows()}
      </div>
    </div>
  `,
};

export const Headings: Story = {
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 32px; background: var(--surface-1);">
      <h1 class="type-h1">H1 — ${spec("type-h1")}</h1>
      <h1 class="type-h1">H1 with <strong>Semibold</strong> spans</h1>
      <h2 class="type-h2">H2 — ${spec("type-h2")}</h2>
      <h3 class="type-h3">H3 — ${spec("type-h3")}</h3>
    </div>
  `,
};

export const Body: Story = {
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 640px; background: var(--surface-1);">
      <p class="type-preamble">Preamble — ${spec("type-preamble")}. The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.</p>
      <p class="type-body">Body — ${spec("type-body")}. The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. Pack my box with five dozen liquor jugs.</p>
      <p class="type-body-bold">Body Bold — ${spec("type-body-bold")}. The quick brown fox jumps over the lazy dog.</p>
    </div>
  `,
};

export const Labels: Story = {
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; background: var(--surface-1);">
      <span class="type-label">Label — ${spec("type-label")} / 2.25px tracking</span>
      <span class="type-label-sm">Label SM — ${spec("type-label-sm")} / 2px tracking</span>
    </div>
  `,
};

export const OnDark: Story = {
  name: "On Dark Background",
  render: () => `
    <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px; background: var(--surface-9);">
      <h2 class="type-h2" style="color: var(--type-inverted-primary);">H2 on dark</h2>
      <h3 class="type-h3" style="color: var(--type-inverted-tertiary);">H3 on dark</h3>
      <p class="type-body" style="color: var(--type-inverted-primary);">Body text on dark background.</p>
      <p class="type-body-bold" style="color: var(--type-inverted-primary);">Body bold on dark.</p>
      <span class="type-label" style="color: var(--type-inverted-tertiary);">Label on dark</span>
    </div>
  `,
};
