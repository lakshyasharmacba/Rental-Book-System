import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
} catch (e) {
  console.warn('Mailer not configured:', e.message);
}

export { transporter };

export const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter || !env.SMTP_USER) {
    console.log('[MAIL SKIPPED - SMTP not configured] To:', to, 'Subject:', subject);
    return { skipped: true };
  }
  try {
    const result = await transporter.sendMail({
      from: `"RentLens Support" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('[✅ MAIL SENT] To:', to, '| Subject:', subject);
    return result;
  } catch (e) {
    console.error('[❌ MAIL ERROR]', e.message);
    return { error: e.message };
  }
};
