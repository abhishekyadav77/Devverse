import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import blogRoutes from './blog.routes.js';
import engagementRoutes from './engagement.routes.js';
import commentRoutes from './comment.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';
import searchRoutes from './search.routes.js';
import homeRoutes from './home.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import { categoryRouter, tagRouter } from './taxonomy.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/blogs', engagementRoutes); // /blogs/:id/like, /bookmark, /comments
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRouter);
router.use('/tags', tagRouter);
router.use('/search', searchRoutes);
router.use('/home', homeRoutes);
router.use('/newsletter', newsletterRoutes);

export default router;
