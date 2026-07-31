import type { Preview } from "@storybook/html";

// Storybook loads the site's ONE stylesheet entry — the same file BaseLayout
// imports — so stories render with exactly the app's tokens, typography and
// component CSS. Adding/removing a component stylesheet in global.css is now
// picked up here automatically; there is no second list to keep in sync.
// (global.css pulls in Tailwind too, via the @tailwindcss/vite plugin wired
// up in main.ts, so utility classes used in component markup also resolve.)
import "../src/styles/global.css";

const preview: Preview = {
  // Theme toolbar. The site drives light/dark off `data-theme` on <html>
  // (dark = `:root[data-theme="dark"]`, light = the attribute's absence), and
  // the decorator below applies the same switch to the Storybook iframe root —
  // so every story, and the token catalogs, react to it exactly like the site.
  globalTypes: {
    theme: {
      description: "Light / dark theme",
      toolbar: {
        title: "Theme",
        icon: "sun",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (story, context) => {
      const root = document.documentElement;
      if (context.globals.theme === "dark") {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      return story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
