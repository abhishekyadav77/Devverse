import { Router } from 'express';
import { uploadImageFile, removeAvatar } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.js';
import { requireCloudinary, requirePurpose, singleImage } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Login is checked before any upload bytes are read
router.use(protect);

router.post('/image', uploadLimiter, requireCloudinary, requirePurpose, singleImage, uploadImageFile);
router.delete('/avatar', removeAvatar);

export default router;