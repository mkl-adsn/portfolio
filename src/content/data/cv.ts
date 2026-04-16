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
    company: 'Digitalist Sweden',
    period: '2018–2023',
    role: 'UX/Digital Designer',
    description: [
      `At Digitalist, I worked with several major clients, maintaining and improving their website designs and user experiences through research, interviews, prototyping, and UI design. I established and maintained complex design systems, supported requirements work, and helped bridge the gap between design and development.`,
    ],
  },
  {
    company: 'FEO Media',
    period: '2017–2018',
    role: 'UX/UI Game Artist',
    description: [
      `At FEO Media, I worked on Quizkampen Business — the enterprise version of Quizkampen (QuizClash) — primarily designing a new interface for the admin panel where clients could manage their quizzes and question database. I also collaborated with the marketing department, creating brochures, flyers, and landing pages for the sales team.`,
      `After six months, I transitioned to become the lead designer for QuizClash 2. I designed the new visual identity, created wireframes and UI art, and implemented them in Unity alongside the development team. I also worked on visual effects and animations, and contributed to the overall game design process.`,
    ],
  },
  {
    company: 'Solid Agency',
    period: '2012–2017',
    role: 'Graphic/UX Designer (2012–2015)  ·  Art Director/UX (2015–2017)',
    description: [
      `At Solid Agency, I began as a graphic/UX designer, primarily designing web applications, browser games, and campaign sites. As the company grew, so did my responsibilities — I started working more closely with clients, took a larger role in the concept creation process, and expanded into company branding, social media campaigns, photography, and visual effects.`,
      `In my final year, I focused on developing communication concepts for various social media platforms, collaborating closely with copywriters and photographers to produce content grounded in those concepts.`,
      `Clients I worked with included Ahlgrens Bilar, Helly Hansen, L'Oréal Paris, Malaco, and Pfizer, among others.`,
    ],
  },
  {
    company: 'Lennandia Advertising',
    period: '2011',
    role: 'Graphic Designer',
    description: [
      `A temporary position held during the summer holidays. Work involved updating text and image content in brochures, adjusting layouts as needed, image retouching, and print design.`,
    ],
  },
  {
    company: 'Sydöstran Newspaper',
    period: '2010',
    role: 'Production Artist',
    description: [
      `A temporary position held during the summer and winter holidays at the local morning newspaper Sydöstran. Responsibilities included laying out pages, fitting articles and images, creating news graphics, and occasionally rewriting articles to fit the available space.`,
    ],
  },
  {
    company: 'Freelance',
    period: '2009–2014',
    role: 'Graphic Designer',
    description: [
      `Alongside my studies, I worked as a freelance graphic designer for various smaller clients. Projects ranged from websites and logotypes to print design.`,
    ],
  },
];

export const education: EducationEntry[] = [
  {
    institution: 'Linköpings Universitet',
    period: '2009–2012',
    degree: 'Grafisk Design och Kommunikation — Graphic Design and Communications',
    description: `Completed 158 of 180 credits towards a Bachelor's Degree. The programme had a strong theoretical focus, providing a broad understanding of topics relevant to the design industry — including design history, visual rhetoric, information design, HCI/UX, intellectual property law, and marketing communications.`,
  },
  {
    institution: 'Törnströmska Gymnasiet',
    period: '2006–2008',
    degree: 'Medieprogrammet: Grafisk Design — Media Programme: Graphic Design',
    description: `An upper secondary programme focused on practical applications in graphic design, creative writing, and photography.`,
  },
];

export const languages: LanguageEntry[] = [
  { name: 'Swedish', level: 'Native language' },
  { name: 'English', level: 'Professional working proficiency' },
];
