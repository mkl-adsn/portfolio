import type { Meta, StoryObj } from "@storybook/html";

// CSS: src/styles/components/skill-tag.css (imported globally in preview.ts).
const STAR_FILLED = "/images/Icon/Light/star-filled.svg";
const STAR_OUTLINE = "/images/Icon/Light/star-outline.svg";

type SkillTagArgs = { name: string; level: 1 | 2 | 3 };

function skillTag(name: string, level: 1 | 2 | 3): string {
  const stars = [1, 2, 3]
    .map((i) => `<img src="${i <= level ? STAR_FILLED : STAR_OUTLINE}" width="16" height="16" alt="" />`)
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
