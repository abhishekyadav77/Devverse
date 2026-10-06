import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid category');

// Same shape for create and update: the editor always sends the full document.
export const blogSchema = z.object({
  title: z.string().trim().max(150, 'Title must be 150 characters or fewer').default(''),
  subtitle: z.string().trim().max(300, 'Subtitle must be 300 characters or fewer').default(''),
  content: z.string().max(300000, 'Article is too long').default(''),
  coverImage: z
    .string()
    .trim()
    .max(500, 'Cover image link is too long')
    .refine((v) => v === '' || /^https:\/\/\S+$/i.test(v), 'Cover image must be an https link')
    .default(''),
  category: z.union([objectId, z.literal(''), z.null()]).default(null).transform((v) => v || null),
  tags: z
    .array(z.string().trim().min(2, 'Each tag needs at least 2 characters').max(30, 'Tags must be 30 characters or fewer'))
    .max(5, 'Use at most 5 tags')
    .default([]),
  seoTitle: z.string().trim().max(70, 'SEO title must be 70 characters or fewer').default(''),
  seoDescription: z.string().trim().max(160, 'SEO description must be 160 characters or fewer').default(''),
});

export const publishSchema = z.object({
  publishAt: z.string().datetime({ message: 'Invalid publish date' }).optional(),
});