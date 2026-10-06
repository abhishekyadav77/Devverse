import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });
bookmarkSchema.index({ blog: 1 });

export default mongoose.model('Bookmark', bookmarkSchema);