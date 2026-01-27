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
    icon: z.string().nullish(), // SVG 图标名称或路径
    color: z.string().nullish(), // 图标颜色
  }),
});

// AI 笔记本集合
const aiNotebooks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    icon: z.string().nullish(),
    color: z.string().nullish(),
    order: z.number().default(0),
    category: z.string(), // 分类，如 "js-interview", "react-interview" 等
  }),
});

// AI 笔记集合
const aiNotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    aiNotebook: z.string(), // 所属 AI 笔记本
    date: z.date(),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  notebooks,
  notes,
  aiNotebooks,
  aiNotes,
};

