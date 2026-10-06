import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export const getHealth = (req, res) =>
  sendSuccess(res, {
    status: 'ok',
    app: 'DevVerse API',
    uptime: Math.round(process.uptime()),
    database: DB_STATES[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
