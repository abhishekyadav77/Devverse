import mongoose from 'mongoose';

// One document per UTC day, e.g. { date: '2026-10-02', views: 148 }
const dailyStatSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  views: { type: Number, default: 0 },
});

export default mongoose.model('DailyStat', dailyStatSchema);