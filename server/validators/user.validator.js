import { z } from 'zod';
import { nameField, usernameField } from './auth.validator.js';

const urlField = (label) =>
  z
    .string()
    .trim()
    .max(200, `${label} link is too long`)
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), `${label} must start with http:// or https://`)
    .optional()
    .default('');

export const updateProfileSchema = z.object({
  name: nameField,
  username: usernameField,
  bio: z.string().trim().max(300, 'Bio must be 300 characters or fewer').optional().default(''),
  website: urlField('Website'),
  github: urlField('GitHub'),
  linkedin: urlField('LinkedIn'),
});