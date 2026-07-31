import type { Meta, StoryObj } from "@storybook/html";
import { iconMarkup } from "../scripts/icons";

// CSS: src/styles/components/skill-tag.css (imported globally in preview.ts).
type SkillTagArgs = { name: string; level: 1 | 2 | 3 };

function skillTag(name: string, level: 1 | 2 | 3): string {
  const stars = [1, 2, 3]
    .map((i) =>
      iconMarkup(i <= level ? "star-filled" : "star-outline", { tone: "inverted", size: 16 })
    )
    .join("");
  return `
    <div class="skill-tag">
      <span class="skill-tag__name">${name}</span>
      <span class="skill-tag__stars">${stars}</span>
    </div>
  `;
}

const meta: Meta<SkillTagArgs> = {
  title: "UI/Skill Tag",
  render: ({ name, level }) => skillTag(name, level),
  argTypes: {
    name: { control: "text", description: "Skill name" },
    level: { control: { type: "inline-radio" }, options: [1, 2, 3], description: "Proficiency (1–3 stars)" },
  },
  args: { name: "Figma", level: 3 },
  decorators: [(story) => `<div style="padding: 48px; background: var(--surface-1);">${story()}</div>`],
};

export default meta;
type Story = StoryObj<SkillTagArgs>;

export const Expert: Story = { args: { name: "Figma", level: 3 } };
export const Proficient: Story = { args: { name: "TypeScript", level: 2 } };
export const Familiar: Story = { args: { name: "Astro", level: 1 } };

export const AllLevels: Story = {
  name: "All Levels",
  render: () => `
    <div style="padding: 48px; background: var(--surface-1); display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start;">
      ${skillTag("Figma", 3)}
      ${skillTag("TypeScript", 2)}
      ${skillTag("Astro", 1)}
    </div>
  `,
};
