export type SkillLevel = 1 | 2 | 3;
export type SkillCategory = 'Application' | 'Design' | 'Code' | 'Other' | 'Irrelevant';

export interface Skill {
  name: string;
  categories: SkillCategory[];
  level: SkillLevel;
}

export const skills: Skill[] = [
  // Design
  { name: 'Figma',          categories: ['Design'],              level: 3 },
  { name: 'Sketch',         categories: ['Design'],              level: 3 },
  { name: 'Photoshop',      categories: ['Design'],              level: 3 },
  { name: 'Illustrator',    categories: ['Design'],              level: 3 },
  { name: 'After Effects',  categories: ['Design'],              level: 2 },
  { name: 'InDesign',       categories: ['Design'],              level: 2 },
  { name: 'Blender',        categories: ['Design'],              level: 1 },

  // UX / Application
  { name: 'UX Research',    categories: ['Application'],         level: 3 },
  { name: 'Prototyping',    categories: ['Design', 'Application'], level: 3 },
  { name: 'Design Systems', categories: ['Design', 'Application'], level: 3 },
  { name: 'User Testing',   categories: ['Application'],         level: 2 },
  { name: 'Accessibility',  categories: ['Application', 'Code'], level: 2 },

  // Code
  { name: 'HTML / CSS',     categories: ['Code'],                level: 3 },
  { name: 'JavaScript',     categories: ['Code'],                level: 2 },
  { name: 'TypeScript',     categories: ['Code'],                level: 2 },
  { name: 'React',          categories: ['Code'],                level: 2 },
  { name: 'Astro',          categories: ['Code'],                level: 1 },
  { name: 'Git',            categories: ['Code'],                level: 2 },

  // Other
  { name: 'Game Design',    categories: ['Other'],               level: 2 },
  { name: 'Copywriting',    categories: ['Other'],               level: 2 },
  { name: 'Unity',          categories: ['Other'],               level: 1 },

  // Irrelevant (kept for transparency)
  { name: 'Excel',          categories: ['Irrelevant'],          level: 2 },
  { name: 'PowerPoint',     categories: ['Irrelevant'],          level: 2 },
];
