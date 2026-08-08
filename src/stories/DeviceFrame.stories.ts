import type { Meta, StoryObj } from "@storybook/html";

// A phone shell with a screen recording composited on top, scaling as one
// element. Used in case-study splits (src/content/cases/quizduel.md).
// Styles: src/styles/components/device-frame.css.
type DeviceFrameArgs = {
  width: number;
  screenX: number;
  screenY: number;
  screenW: number;
};

const SHELL = "/images/case/quizduel/phone.png";
const SCREEN = "/images/case/quizduel/giftbox-video.mp4";

function frame({ width, screenX, screenY, screenW }: DeviceFrameArgs): string {
  return `
    <div
      class="device-frame"
      style="width: ${width}px; --screen-x: ${screenX}%; --screen-y: ${screenY}%; --screen-w: ${screenW}%;"
    >
      <img class="device-frame__shell" src="${SHELL}" width="400" height="820" alt="" />
      <video
        class="device-frame__screen"
        src="${SCREEN}"
        width="360"
        height="640"
        autoplay
        loop
        muted
        playsinline
        aria-label="Animation of a gift package being opened"
      ></video>
    </div>
  `;
}

const meta: Meta<DeviceFrameArgs> = {
  title: "UI/DeviceFrame",
  render: frame,
  decorators: [(story) => `<div style="padding: 48px; background: var(--surface-1);">${story()}</div>`],
  argTypes: {
    width: { control: { type: "range", min: 120, max: 400, step: 4 }, description: "Rendered frame width (px)" },
    screenX: { control: { type: "range", min: 0, max: 100, step: 0.5 }, description: "--screen-x: screen centre, % of shell width" },
    screenY: { control: { type: "range", min: 0, max: 100, step: 0.5 }, description: "--screen-y: screen top edge, % of shell height" },
    screenW: { control: { type: "range", min: 50, max: 100, step: 0.5 }, description: "--screen-w: screen width, % of shell width" },
  },
  args: { width: 400, screenX: 50, screenY: 0, screenW: 90 },
};

export default meta;
type Story = StoryObj<DeviceFrameArgs>;

export const Default: Story = {};

// Same markup at a third of the size — the screen stays registered to the
// shell, which is the point of positioning it in percentages.
export const Small: Story = {
  args: { width: 140 },
};

// Side by side at three sizes: proof the two assets scale as one element.
export const Scaling: Story = {
  render: (args) => `
    <div style="display: flex; gap: 32px; align-items: flex-start;">
      ${[400, 240, 140].map((width) => frame({ ...args, width })).join("")}
    </div>
  `,
};
