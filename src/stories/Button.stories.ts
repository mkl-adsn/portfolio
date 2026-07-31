import type { Meta, StoryObj } from "@storybook/html";
import { iconMarkup, type IconName } from "../scripts/icons";

type ButtonArgs = {
  variant: "light" | "dark";
  label: string;
  icon: IconName | "None";
  asLink: boolean;
  disabled: boolean;
};

const ICONS: (IconName | "None")[] = [
  "None",
  "download",
  "arrow-left",
  "mail",
  "phone",
  "linkedin",
  "location",
  "search",
  "star-filled",
  "star-outline",
];

function renderButton(args: ButtonArgs): string {
  // A disabled link can't use the native `disabled` attribute → render a button.
  const tag = args.asLink && !args.disabled ? "a" : "button";
  const hrefAttr = tag === "a" ? 'href="#"' : "";
  const disabledAttr =
    args.disabled && tag === "button" ? "disabled" : "";
  const ariaDisabled = args.disabled ? 'aria-disabled="true"' : "";
  const classes = `btn btn--${args.variant}${args.disabled ? " btn--disabled" : ""}`;
  const iconTone = args.variant === "dark" ? "inverted" : "strong";
  const iconHtml =
    args.icon && args.icon !== "None"
      ? iconMarkup(args.icon, { tone: iconTone, class: "btn__icon" })
      : "";

  return `
    <${tag} ${hrefAttr} ${disabledAttr} ${ariaDisabled} class="${classes}">
      <span class="btn__face">
        ${iconHtml}
        ${args.label}
      </span>
      <span class="btn__edge"></span>
    </${tag}>
  `;
}

const meta: Meta<ButtonArgs> = {
  title: "UI/Button",
  render: renderButton,
  argTypes: {
    variant: {
      control: "radio",
      options: ["light", "dark"],
      description: "Color variant",
    },
    label: {
      control: "text",
      description: "Button label text",
    },
    icon: {
      control: "select",
      options: ICONS,
      description: "Icon to show before the label",
    },
    asLink: {
      control: "boolean",
      description: "Render as <a> instead of <button>",
    },
    disabled: {
      control: "boolean",
      description: "Disabled (muted, non-interactive) state",
    },
  },
  args: {
    variant: "light",
    label: "Button",
    icon: "None",
    asLink: false,
    disabled: false,
  },
  decorators: [
    (story) => `<div style="padding: 48px; display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start;">${story()}</div>`,
  ],
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Light: Story = {
  args: { variant: "light", label: "Browse Cases" },
};

export const Dark: Story = {
  args: { variant: "dark", label: "Browse Cases" },
};

export const LightWithIcon: Story = {
  name: "Light + Icon",
  args: { variant: "light", label: "Download CV", icon: "download" },
};

export const DarkWithIcon: Story = {
  name: "Dark + Icon",
  args: { variant: "dark", label: "Download CV", icon: "download" },
};

export const Disabled: Story = {
  args: { variant: "light", label: "View", icon: "download", disabled: true },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => `
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start;">
      <button class="btn btn--light">
        <span class="btn__face">Light</span>
        <span class="btn__edge"></span>
      </button>
      <button class="btn btn--dark">
        <span class="btn__face">Dark</span>
        <span class="btn__edge"></span>
      </button>
      <button class="btn btn--light">
        <span class="btn__face">
          ${iconMarkup("download", { tone: "strong", class: "btn__icon" })}
          Light + Icon
        </span>
        <span class="btn__edge"></span>
      </button>
      <button class="btn btn--dark">
        <span class="btn__face">
          ${iconMarkup("download", { tone: "inverted", class: "btn__icon" })}
          Dark + Icon
        </span>
        <span class="btn__edge"></span>
      </button>
      <button class="btn btn--light btn--disabled" disabled aria-disabled="true">
        <span class="btn__face">
          ${iconMarkup("download", { tone: "strong", class: "btn__icon" })}
          Light Disabled
        </span>
        <span class="btn__edge"></span>
      </button>
      <button class="btn btn--dark btn--disabled" disabled aria-disabled="true">
        <span class="btn__face">
          ${iconMarkup("download", { tone: "inverted", class: "btn__icon" })}
          Dark Disabled
        </span>
        <span class="btn__edge"></span>
      </button>
    </div>
  `,
};
