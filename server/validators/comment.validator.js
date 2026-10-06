import { z } from 'zod';

const content = z
  .string({ required_error: 'Write something first' })
  .trim()
  .min(1, 'Write something first')
  .max(2000, 'Comments can be at most 2000 characters');

export const commentSchema = z.object({
  content,
  parentId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid comment').optional(),
});

export const updateCommentSchema = z.object({ content });