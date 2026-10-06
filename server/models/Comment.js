import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // null = top-level comment. Replies always point at the top-level comment.
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    // Who this reply is addressed to (for "replying to @name")
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

commentSchema.index({ blog: 1, parent: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

export default mongoose.model('Comment', commentSchema);