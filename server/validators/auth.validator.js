import { z } from 'zod';

const RESERVED_USERNAMES = [
  'admin', 'api', 'bookmarks', 'profile', 'settings', 'login', 'register',
  'explore', 'search', 'dashboard', 'me', 'null', 'undefined', 'devverse',
];

export const emailField = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(254);

export const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Password must include at least one letter')
  .regex(/\d/, 'Password must include at least one number');

export const usernameField = z
  .string({ required_error: 'Username is required' })
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be 20 characters or fewer')
  .regex(/^[a-z0-9_]+$/, 'Username can only use letters, numbers and underscores')
  .refine((v) => !RESERVED_USERNAMES.includes(v), 'That username is reserved');

export const nameField = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name must be 60 characters or fewer');

export const registerSchema = z.object({
  name: nameField,
  username: usernameField,
  email: emailField,
  password: passwordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required').max(72),
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset link is invalid').max(200),
  password: passwordField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required').max(72),
    newPassword: passwordField,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });