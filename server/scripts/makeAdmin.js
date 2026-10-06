import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run make-admin -- user@example.com');
  process.exit(1);
}

await mongoose.connect(env.mongoUri);
const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });

if (!user) {
  console.error(`No user found with email ${email}`);
} else {
  console.log(`${user.name} (${user.email}) is now an admin.`);
}
await mongoose.disconnect();