import type { Preview } from "@storybook/html";
import "../src/styles/tokens.css";
import "../src/styles/typography.css";
import "../src/styles/components/button.css";
import "../src/styles/components/tag.css";
import "../src/styles/components/skill-tag.css";
import "../src/styles/components/filter-tab.css";
import "../src/styles/components/nav.css";
import "../src/styles/components/search-box.css";
import "../src/styles/components/carousel.css";
import "../src/styles/components/lightbox.css";

const preview: Preview = {
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
