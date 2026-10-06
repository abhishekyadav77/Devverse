import { Router } from 'express';
import {
  register, login, logout, getMe, forgotPassword, resetPassword, changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, loginAccountLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, loginAccountLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;