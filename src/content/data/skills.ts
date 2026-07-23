export type SkillLevel = 1 | 2 | 3;
export type SkillCategory = 'Application' | 'Design' | 'Dev' | 'Other';

export interface Skill {
  name: string;
  categories: SkillCategory[];
  level: SkillLevel;
}

export const skills: Skill[] = [
  // Apps
  { name: 'Figma',                    categories: ['Design', 'Application'],   level: 3 },
  { name: 'Photoshop',                categories: ['Design', 'Application'],   level: 3 },
  { name: 'Design Systems',           categories: ['Design'],                  level: 3 },
  { name: 'AI assisted workflows',    categories: ['Dev'],                    level: 2 },
  { name: 'Illustrator',    categories: ['Design', 'Application'],              level: 2 },
  { name: 'After Effects',  categories: ['Design', 'Application'],              level: 2 },
  { name: 'InDesign',       categories: ['Design', 'Application'],              level: 2 },

  { name: 'Claude Code / Codex',    categories: ['Application'],                             level: 3 },
  { name: 'UI design',    categories: ['Design'],                             level: 3 },

  { name: 'UX Research',    categories: ['Design'],                             level: 2 },
  { name: 'Prototyping',    categories: ['Design'],              level: 3 },
  { name: 'User Testing',   categories: ['Design'],                             level: 2 },
  { name: 'Art Direction',   categories: ['Design'],                            level: 2 },
  { name: 'Branding & Identity',   categories: ['Design'],                      level: 2 },
  { name: 'Accessibility',  categories: ['Design'],                             level: 2 },
    { name: 'Print design',  categories: ['Design'],                             level: 2 },

  // Dev
  { name: 'Front End',     categories: ['Design', 'Dev'],       level: 2 },
  { name: 'Figma MCP',     categories: ['Dev'],                                level: 2 },
  { name: 'Git',            categories: ['Dev'],                               level: 2 },
    { name: 'Tailwind',     categories: ['Dev'],                                level: 2 },

    { name: 'Storyblok CMS',            categories: ['Dev'],                      level: 2 },
  { name: 'Scrum / Agile',            categories: ['Other'],                level: 2 },
    { name: 'Jira',            categories: ['Other'],                level: 2 },


  // Other
  { name: 'Game Design/Gamification',    categories: ['Other'],               level: 2 },
  { name: 'Copywriting',    categories: ['Other'],               level: 2 },
  { name: 'Unity',          categories: ['Other'],               level: 1 },
  { name: 'Wordpress',            categories: ['Dev'],                level: 1 },
  { name: 'Product Ownership',            categories: ['Other'],                level: 1 },
  { name: 'Wordpress',            categories: ['Other'],                level: 2 },
  { name: 'Drupal CMS',            categories: ['Other'],                level: 1 },



];
