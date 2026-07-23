import type { StorybookConfig } from "@storybook/html-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: (config) => {
    config.plugins ??= [];
    config.plugins.push(tailwindcss());
    return config;
  },
};

export default config;
