import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    halftoneImage: z.string().optional(),
    imageOrientation: z.enum(['portrait', 'landscape']).default('portrait'),
    order: z.number().default(0),
  }),
});

export const collections = { cases };
