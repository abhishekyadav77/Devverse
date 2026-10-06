import { z } from 'zod';
import { emailField } from './auth.validator.js';

export const newsletterSchema = z.object({ email: emailField });