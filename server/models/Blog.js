import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 150, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true },
    subtitle: { type: String, trim: true, maxlength: 300, default: '' },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' }, // sanitized HTML
    coverImage: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isHidden: { type: Boolean, default: false }, // admin moderation (Phase 7)
    publishedAt: { type: Date, default: null }, // a future date means "scheduled"
        modifiedAt: { type: Date, default: null }, // last real edit (unlike updatedAt, ignores views/likes/comments)
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    seo: {
      title: { type: String, default: '', maxlength: 70 },
      description: { type: String, default: '', maxlength: 160 },
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', subtitle: 'text', content: 'text' }, { weights: { title: 10, subtitle: 5, content: 1 } });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1, views: -1 });
blogSchema.index({ status: 1, likesCount: -1 });

export default mongoose.model('Blog', blogSchema);