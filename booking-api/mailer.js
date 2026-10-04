import nodemailer from 'nodemailer';

let tx;
export async function sendConfirmation({ to, name, proName, label, startIso, meetLink }) {
  if (!process.env.SMTP_URL) { console.warn('SMTP_URL not set; skipping email to', to); return; }
  tx ??= nodemailer.createTransport(process.env.SMTP_URL);
  const when = new Date(startIso).toLocaleString('en-GB', { timeZone: 'Asia/Colombo', dateStyle: 'full', timeStyle: 'short' });
  await tx.sendMail({
    from: process.env.MAIL_FROM, to,
    subject: `Your EMM session is confirmed: ${when}`,
    text: `Hi ${name},\n\nYour ${label} with ${proName} is confirmed for ${when} (Sri Lanka time).\n` +
      (meetLink ? `Join online: ${meetLink}\n` : '') + `\nNeed to reschedule? Please give at least 24 hours' notice.\n\nEMM`,
  });
}
