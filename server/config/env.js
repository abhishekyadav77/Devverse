import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to server/.env and fill in the values.');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

const isProd = process.env.NODE_ENV === 'production';
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

if (isProd && !clientUrl.startsWith('https://')) {
  console.error('In production CLIENT_URL must be your https site address, for example https://www.example.com');
  process.exit(1);
}

// 'none' lets a frontend and API on DIFFERENT domains share the login cookie.
// Use 'lax' when both live under one parent domain (www.example.com + api.example.com).
const sameSiteRaw = (process.env.COOKIE_SAME_SITE || '').toLowerCase();
const cookieSameSite = ['lax', 'none'].includes(sameSiteRaw) ? sameSiteRaw : isProd ? 'none' : 'lax';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl,
  cookieSameSite,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
  },
};