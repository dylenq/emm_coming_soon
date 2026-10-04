import nodemailer from 'nodemailer';

let tx;
const transport = () => (tx ??= nodemailer.createTransport(process.env.SMTP_URL));

export async function sendConfirmation({ to, name, proName, label, startIso, meetLink }) {
  if (!process.env.SMTP_URL) { console.warn('SMTP_URL not set; skipping email to', to); return; }
  const when = new Date(startIso).toLocaleString('en-GB', { timeZone: 'Asia/Colombo', dateStyle: 'full', timeStyle: 'short' });
  await transport().sendMail({
    from: process.env.MAIL_FROM, to,
    subject: `Your EMM session is confirmed: ${when}`,
    text: `Hi ${name},\n\nYour ${label} with ${proName} is confirmed for ${when} (Sri Lanka time).\n` +
      (meetLink ? `Join online: ${meetLink}\n` : '') + `\nNeed to reschedule? Please give at least 24 hours' notice.\n\nEMM`,
  });
}

// Unlike confirmations, contact messages must never be dropped silently: throw if mail is not configured.
export async function sendContact({ name, email, phone, subject, message }) {
  if (!process.env.SMTP_URL || !process.env.CONTACT_TO) throw new Error('SMTP_URL / CONTACT_TO not configured');
  await transport().sendMail({
    from: process.env.MAIL_FROM, to: process.env.CONTACT_TO, replyTo: email,
    subject: `Website enquiry${subject ? ` (${subject})` : ''}: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nTopic: ${subject || '-'}\n\n${message}`,
  });
}
