import { env } from '../config/env.js';
import { site } from '../config/site.js';
import { escapeHtml } from '../utils/escape.js';

// Sends through Resend (https://resend.com). Development without a key just prints the link.
export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const { resendApiKey, from } = env.email;

  if (!resendApiKey || !from) {
    if (!env.isProd) {
      console.log(`\n[dev email] Password reset requested for ${to}\n${resetUrl}\n`);
      return;
    }
    throw new Error('Email is not configured. Set RESEND_API_KEY and EMAIL_FROM.');
  }

  const text = `Someone asked to reset your ${site.name} password.\n\nOpen this link within 15 minutes:\n${resetUrl}\n\nIf this wasn't you, ignore this email. Your password stays the same.`;
  const html = `<p>Someone asked to reset your ${escapeHtml(site.name)} password.</p>
<p><a href="${escapeHtml(resetUrl)}">Choose a new password</a></p>
<p>The link works for 15 minutes. If this wasn't you, ignore this email. Your password stays the same.</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: `Reset your ${site.name} password`, html, text }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Email provider responded with ${response.status}`);
};