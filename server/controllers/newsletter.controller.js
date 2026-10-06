import Subscriber from '../models/Subscriber.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  } catch (err) {
    if (err.code !== 11000) throw err; // two simultaneous signups: treat as success
  }
  // Same reply for new and existing subscribers
  sendSuccess(res, { message: "You're subscribed. Thanks for joining." }, 201);
});