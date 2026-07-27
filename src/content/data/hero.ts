export interface HeroSegment {
  text: string;
  /** Rendered as <strong> in the typewriter animation. */
  bold: boolean;
}

export const heroSegments: HeroSegment[] = [
  { text: 'Mikael Andersson, senior UX/UI designer who aligns product vision with technical execution.', bold: true  },
  { text: ' Turns stakeholder input and user needs into ', bold: false },
  { text: 'scalable, deployable UI.', bold: true  },
];

/** Full sentence for the aria-label / any non-animated context. */
export const heroCopy = heroSegments.map((s) => s.text).join('');
