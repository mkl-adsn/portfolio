export interface WorkEntry {
  company: string;
  period: string;
  role: string;
  description: string[];
}

export interface EducationEntry {
  institution: string;
  period: string;
  degree: string;
  description: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}

export const workExperience: WorkEntry[] = [
   {
    company: 'Universum',
    period: '2023‑2026',
    role: 'UX/UI Designer and Product Owner',
    description: [
      `Led all design and UX work across Universum's digital presence. Served as product owner for the company website and drove design for the SaaS employer branding insights platform and the global survey used for data collection. Also produced social media marketing assets and managed the company's branding and visual identity.`,
    ],
  },
  {
    company: 'Digitalist Sweden',
    period: '2018‑2023',
    role: 'UX/UI Designer',
    description: [
      `Worked with several major clients, including ones like Unionen, SVT, and Kulturhuset Stadsteatern, improving their website designs and user experiences through research, interviews, prototyping, and UI design. Built and maintained complex design systems, supported requirements work, and bridged design and development.`,
    ],
  },
  {
    company: 'FEO Media',
    period: '2017‑2018',
    role: 'UX/UI Game Artist',
    description: [
      `Designed a new admin panel interface for Quizkampen Business (the enterprise version of QuizClash), enabling clients to manage their quizzes and question databases. Also produced brochures, flyers, and landing pages for the sales team.`,
      `Promoted to lead designer for QuizClash 2 after six months. Created the new visual identity, wireframes, and UI art, and implemented them in Unity alongside the development team. Contributed visual effects, animations, and overall game design.`,
    ],
  },
  {
    company: 'Solid Agency',
    period: '2012‑2017',
    role: 'Graphic/UX Designer (2012‑2015)  ·  Art Director/UX (2015‑2017)',
    description: [
      `Started as a graphic/UX designer building web applications, browser games, and campaign sites, then took on client-facing work, a larger role in concept creation, and expanded into branding, social media campaigns, photography, and visual effects. In the final year, developed communication concepts across social platforms, working closely with copywriters and photographers. Clients included Ahlgrens Bilar, Helly Hansen, L'Oréal Paris, Malaco, and Pfizer.`,
    ],
  },
  {
    company: 'Lennandia Advertising',
    period: '2011',
    role: 'Graphic Designer',
    description: [
      `Seasonal position: updated text and image content in brochures, adjusted layouts, retouched images, and handled print design.`,
    ],
  },
  {
    company: 'Sydöstran Newspaper',
    period: '2010',
    role: 'Production Artist',
    description: [
      `Seasonal position at the local morning newspaper. Laid out pages, fit articles and images, created news graphics, and occasionally rewrote copy to fit available space.`,
    ],
  },
  {
    company: 'Freelance',
    period: '2009‑2014, 2021‑',
    role: 'Graphic / UX & UI Designer',
    description: [
      `Engaged by businesses and startups for branding and visual identity, UX/UI design for web and apps, logotypes, and print design.`,
    ],
  },
];

export const education: EducationEntry[] = [
  {
    institution: 'Linköpings Universitet',
    period: '2009‑2012',
    degree: 'Grafisk Design och Kommunikation (Graphic Design and Communications)',
    description: `Completed 158 of 180 credits towards a Bachelor's Degree. The programme had a strong theoretical focus, providing a broad understanding of topics relevant to the design industry including design history, visual rhetoric, information design, HCI/UX, intellectual property law, and marketing communications.`,
  },
  {
    institution: 'Törnströmska Gymnasiet',
    period: '2006‑2008',
    degree: 'Medieprogrammet: Grafisk Design (Media Programme: Graphic Design)',
    description: `An upper secondary programme focused on practical applications in graphic design, creative writing, and photography.`,
  },
];

export const languages: LanguageEntry[] = [
  { name: 'Swedish', level: 'Native language' },
  { name: 'English', level: 'Professional working proficiency (C2)' },
];
