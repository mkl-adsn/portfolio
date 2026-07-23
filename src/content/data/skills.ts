export type SkillLevel = 1 | 2 | 3;
export type SkillCategory = 'Design' | 'Application' | 'Dev' | 'Other';

export interface Skill {
  name: string;
  categories: SkillCategory[];
  level: SkillLevel;
}

export const skills: Skill[] = [
  // Apps
  { name: 'Figma',                    categories: ['Application', 'Design'],   level: 3 },
  { name: 'UI design',                categories: ['Design'],                  level: 3 },
  { name: 'Design Systems',           categories: ['Design'],                  level: 3 },
  { name: 'Photoshop',                categories: ['Application', 'Design'],   level: 3 },
  { name: 'Prototyping',              categories: ['Design'],                  level: 3 },
  { name: 'AI assisted workflows',    categories: ['Dev'],                     level: 2 },
  { name: 'UX Research',              categories: ['Design'],                  level: 2 },
  { name: 'Branding & Identity',      categories: ['Design'],                  level: 2 },
  // Below Fold
  { name: 'Art Direction',            categories: ['Design'],                  level: 2 },
  { name: 'Illustrator',              categories: ['Application', 'Design'],   level: 2 },
  { name: 'After Effects',            categories: ['Application', 'Design'],   level: 2 },
  { name: 'InDesign',                 categories: ['Application', 'Design'],   level: 2 },
  { name: 'Claude Code',              categories: ['Application'],             level: 2 },
  { name: 'User Testing',             categories: ['Design'],                  level: 2 },
  { name: 'Accessibility',            categories: ['Design'],                  level: 2 },
  { name: 'Print design',             categories: ['Design'],                  level: 2 },
  { name: 'Front End',                categories: ['Dev'],                     level: 2 },
  { name: 'Figma MCP',                categories: ['Dev'],                     level: 2 },
  { name: 'Tailwind',                 categories: ['Dev'],                     level: 2 },
  { name: 'Storyblok CMS',            categories: ['Dev'],                     level: 2 },
  { name: 'Scrum / Agile',            categories: ['Other'],                   level: 2 },
  { name: 'Jira',                     categories: ['Other'],                   level: 2 },
  { name: 'Game Design/Gamification', categories: ['Design', 'Other'],         level: 2 },
  { name: 'Git',                      categories: ['Dev'],                     level: 1 },
  { name: 'Copywriting',              categories: ['Other'],                   level: 1 },
  { name: 'Unity',                    categories: ['Application'],             level: 1 },
  { name: 'Wordpress',                categories: ['Dev'],                     level: 1 },
  { name: 'Product Ownership',        categories: ['Other'],                   level: 1 },
  { name: 'Drupal CMS',               categories: ['Other'],                   level: 1 },



];

/** Category order used for the print/CV grouping. */
const PRINT_CATEGORY_ORDER: SkillCategory[] = ['Design', 'Application', 'Dev', 'Other'];

export interface SkillGroup {
  category: SkillCategory;
  names: string[];
}

/**
 * Groups skills for the print CV: deduplicates by name (keeping the first
 * occurrence), assigns each skill to its FIRST category only, and returns one
 * group per category in `PRINT_CATEGORY_ORDER` (empty categories omitted).
 */
export function groupSkillsForPrint(source: Skill[] = skills): SkillGroup[] {
  const seen = new Set<string>();
  const byCategory = new Map<SkillCategory, string[]>();

  for (const skill of source) {
    if (seen.has(skill.name)) continue;
    seen.add(skill.name);
    const category = skill.categories[0];
    if (!category) continue;
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(skill.name);
  }

  return PRINT_CATEGORY_ORDER
    .filter(category => byCategory.has(category))
    .map(category => ({ category, names: byCategory.get(category)! }));
}
