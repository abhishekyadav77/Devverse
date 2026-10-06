import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import Blog from './models/Blog.js';
import Like from './models/Like.js';
import Bookmark from './models/Bookmark.js';
import Comment from './models/Comment.js';
import CommentLike from './models/CommentLike.js';
import Follow from './models/Follow.js';
import Notification from './models/Notification.js';
import { ensureDefaultCategories } from './services/category.service.js';
import app from './app.js';
import DailyStat from './models/DailyStat.js';


const start = async () => {
  await connectDB();
  // Wait for indexes (text search + the unique like/bookmark/follow indexes) before accepting traffic
    await Promise.all([
    Blog.init(), Like.init(), Bookmark.init(), Comment.init(),
    CommentLike.init(), Follow.init(), Notification.init(), DailyStat.init(),
  ]);
  await ensureDefaultCategories();

  const server = app.listen(env.port, () => {
    console.log(`DevVerse API running on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});