import nodemailer from 'nodemailer';
const t = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: 'lakshyaPrasher644gmail@gmail.com', pass: 'ifcs sncc jsuh ihbw' }
});
t.verify((err, ok) => {
  if (err) console.log('❌ FAIL:', err.message);
  else console.log('✅ SUCCESS: SMTP Connected!');
  process.exit(0);
});
