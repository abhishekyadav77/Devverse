import mongoose from 'mongoose';

const NINETY_DAYS = 60 * 60 * 24 * 90;

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['follow', 'like', 'comment', 'reply'], required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    message: { type: String, required: true, maxlength: 300 },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ blog: 1 });
notificationSchema.index({ comment: 1 });
// MongoDB deletes notifications automatically after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NINETY_DAYS });

export default mongoose.model('Notification', notificationSchema);