import { defineCollection, z } from 'astro:content';

const notebooks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    icon: z.string().nullish(),
    color: z.string().nullish(),
    order: z.number().default(0),
  }),
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    notebook: z.string(), // 所属笔记本
    date: z.date(),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  notebooks,
  notes,
};

