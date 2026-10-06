import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(40, 'Name must be 40 characters or fewer'),
  description: z.string().trim().max(200, 'Description must be 200 characters or fewer').optional().default(''),
});

export const tagSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be 30 characters or fewer'),
});