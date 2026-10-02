import Notification from '../models/Notification.js';
import { sendMail } from '../config/mailer.js';
import { env } from '../config/env.js';

export const createNotification = async ({ userId, type, message, link, channels = ['in_app'] }) => {
  await Notification.create({ userId, type, message, link, channels });
  if (channels.includes('email')) {
    // Email will be sent by specific event handlers that know the user email
  }
};

export const sendNotificationEmail = async ({ to, subject, html }) => {
  try {
    await sendMail({ to, subject, html });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

export const notifyUser = async (user, { type, message, link, channels = ['in_app', 'email'], subject, html }) => {
  await createNotification({ userId: user._id, type, message, link, channels });
  if (channels.includes('email') && user.email) {
    await sendNotificationEmail({ to: user.email, subject: subject || message, html: html || `<p>${message}</p><a href="${env.CLIENT_URL}${link}">View</a>` });
  }
};

