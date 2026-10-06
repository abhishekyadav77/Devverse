import { Router } from 'express';
import { subscribe } from '../controllers/newsletter.controller.js';
import { validate } from '../middleware/validate.js';
import { newsletterLimiter } from '../middleware/rateLimiter.js';
import { newsletterSchema } from '../validators/newsletter.validator.js';

const router = Router();
router.post('/', newsletterLimiter, validate(newsletterSchema), subscribe);

export default router;