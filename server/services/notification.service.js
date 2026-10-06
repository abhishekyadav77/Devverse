import Notification from '../models/Notification.js';

export const snippet = (text = '', max = 70) => (text.length > max ? `${text.slice(0, max)}...` : text);

// Never throws: a failed notification must not break the like, follow or comment that caused it.
export const notify = async ({ recipient, sender, type, blog = null, comment = null, message }) => {
  try {
    if (!recipient || String(recipient) === String(sender)) return; // never notify yourself

    if (type === 'like' || type === 'follow') {
      // Upsert: repeating the action can never create a second notification
      await Notification.updateOne(
        { recipient, sender, type, blog },
        { $setOnInsert: { comment, message, read: false } },
        { upsert: true }
      );
    } else {
      await Notification.create({ recipient, sender, type, blog, comment, message });
    }
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
};

// Used when a like or follow is undone
export const removeNotification = async ({ recipient, sender, type, blog = null }) => {
  try {
    await Notification.deleteMany({ recipient, sender, type, blog });
  } catch (err) {
    console.error('Notification cleanup failed:', err.message);
  }
};