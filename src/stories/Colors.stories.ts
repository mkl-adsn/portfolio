import type { Meta, StoryObj } from "@storybook/html";

const meta: Meta = {
  title: "Design System/Colors",
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

// ─── Token discovery ─────────────────────────────────────────────────────────
// The catalog reads the real custom properties off the loaded stylesheets
// rather than restating hex values here — so it can't drift from colors.css
// (add a token there and it shows up). We read the *authored* declaration from
// the CSSOM (not getComputedStyle, which the browser fully resolves) so we can
// show a semantic token's actual alias — `→ grey-900` — rather than the hex it
// happens to resolve to. Both the light `:root` and the dark
// `:root[data-theme="dark"]` blocks are captured, and the active theme picks
// which one to show, so the mapping flips with the toolbar.

type Token = { name: string; raw: string };

/** Ordered tokens declared on the base `:root`, plus dark-mode overrides by name. */
function collectRootTokens(): { base: Token[]; dark: Map<string, string> } {
  const base: Token[] = [];
  const seenBase = new Set<string>();
  const dark = new Map<string, string>();

  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText.trim();
        const isBase = selector === ":root";
        const isDark = selector === ':root[data-theme="dark"]';
        if (!isBase && !isDark) continue;
        for (let i = 0; i < rule.style.length; i++) {
          const prop = rule.style[i];
          if (!prop.startsWith("--")) continue;
          const value = rule.style.getPropertyValue(prop).trim();
          if (isDark) {
            dark.set(prop, value);
          } else if (!seenBase.has(prop)) {
            seenBase.add(prop);
            base.push({ name: prop, raw: value });
          }
        }
      } else if ("cssRules" in rule) {
        // Recurse into @layer / @media / @supports groups.
        try {
          visit((rule as CSSGroupingRule).cssRules);
        } catch {
          /* empty */
        }
      }
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // Cross-origin sheet (e.g. Google Fonts) — not readable, skip.
    }
  }
  return { base, dark };
}

const humanize = (token: string) =>
  token
    .replace(/^--/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** `var(--grey-900)` → `grey-900`; passthrough for literals. */
const refOf = (raw: string) => {
  const m = raw.match(/var\(\s*--([\w-]+)/);
  return m ? m[1] : raw;
};

// ─── Rendering ───────────────────────────────────────────────────────────────

const swatch = ({ name }: Token, sub: string): string => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="
      height: 96px;
      border-radius: 8px;
      background-color: var(${name});
      border: 1px solid var(--border-medium);
    "></div>
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <span style="font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--type-primary);">${humanize(name)}</span>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--type-secondary);">${name}</code>
      <code style="font-family: var(--font-sans); font-size: 12px; color: var(--type-tertiary);">${sub}</code>
    </div>
  </div>
`;

const grid = (tokens: Token[], sub: (t: Token) => string): string => `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 24px;
  ">
    ${tokens.map((t) => swatch(t, sub(t))).join("")}
  </div>
`;

const section = (title: string, tokens: Token[], sub: (t: Token) => string): string =>
  tokens.length === 0
    ? ""
    : `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <h3 class="type-label" style="color: var(--type-tertiary);">${title}</h3>
    ${grid(tokens, sub)}
  </div>
`;

const page = (body: string): string => `
  <div style="padding: 40px; background: var(--surface-1); display: flex; flex-direction: column; gap: 40px;">
    ${body}
  </div>
`;

// Primitives print their literal value; semantic tokens print what they alias
// to in the *active* theme (dark override if present, else the base value).
const asValue = (t: Token) => t.raw;
const asRef =
  (dark: Map<string, string>) =>
  (t: Token): string => {
    const themed =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? dark.get(t.name) ?? t.raw
        : t.raw;
    return `→ ${refOf(themed)}`;
  };

export const Palette: Story = {
  name: "All Colors",
  render: () => {
    const { base } = collectRootTokens();
    const greys = base.filter((t) => /^--(white|black|grey-\d+)$/.test(t.name));
    const overlays = base.filter((t) => /^--(grey|white|black)-\d+-\d{3}$/.test(t.name));
    return page(`
      ${section("Greyscale", greys, asValue)}
      ${section("Overlays", overlays, asValue)}
    `);
  },
};

export const SemanticTokens: Story = {
  name: "Semantic Tokens",
  render: () => {
    const { base, dark } = collectRootTokens();
    const group = (re: RegExp) => base.filter((t) => re.test(t.name));
    const ref = asRef(dark);
    return page(`
      ${section("Type", group(/^--type-(?!inverted)/), ref)}
      ${section("Type — Inverted", group(/^--type-inverted-/), ref)}
      ${section("Surface", group(/^--surface-/), ref)}
      ${section("Backdrop", group(/^--backdrop-/), ref)}
      ${section("Border", group(/^--border-/), ref)}
      ${section("Symbol", group(/^--symbol-/), ref)}
    `);
  },
};
