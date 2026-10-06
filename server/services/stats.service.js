import DailyStat from '../models/DailyStat.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

// Never throws: analytics must not break reading an article.
export const recordView = async () => {
  const update = [{ date: todayKey() }, { $inc: { views: 1 } }, { upsert: true }];
  try {
    await DailyStat.updateOne(...update);
  } catch (err) {
    if (err.code === 11000) {
      // Two first-of-the-day views raced to create the document: retry once
      try {
        await DailyStat.updateOne(...update);
      } catch (retryErr) {
        console.error('View stat failed:', retryErr.message);
      }
    } else {
      console.error('View stat failed:', err.message);
    }
  }
};