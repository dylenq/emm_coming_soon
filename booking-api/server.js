import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { openDb } from './db.js';
import { computeSlots, toIso } from './slots.js';
import { freeBusy, createEvent } from './calendar.js';
import { checkoutHash, checkoutUrl, fmtAmount, verifyNotify } from './payhere.js';
import { sendConfirmation, sendContact } from './mailer.js';
import { validateContact, rateLimiter, EMAIL_RE } from './contact.js';

const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url))).professionals;
const env = process.env;
const db = openDb(env.DB_PATH || './bookings.db');
const HOLD_MS = 10 * 60e3;
const sandbox = env.PAYHERE_SANDBOX !== 'false';

const app = express();
// Set TRUST_PROXY to the number of reverse proxies in front of the API so req.ip is the real client.
if (env.TRUST_PROXY) app.set('trust proxy', Number(env.TRUST_PROXY) || env.TRUST_PROXY);
app.use(cors({ origin: env.SITE_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/payhere/notify', express.urlencoded({ extended: false }));

const releaseExpired = () =>
  db.prepare(`UPDATE bookings SET status='expired' WHERE status='pending' AND hold_expires < ?`).run(Date.now());

app.get('/api/catalog', (_req, res) => {
  res.json(Object.entries(catalog).map(([id, p]) => ({
    id, name: p.name,
    sessions: Object.entries(p.sessions).map(([sid, s]) => ({ id: sid, label: s.label, minutes: s.minutes, priceLKR: s.priceLKR })),
  })));
});

async function openSlots(proId, typeId, date) {
  const pro = catalog[proId], type = pro?.sessions[typeId];
  if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const from = toIso(date, '00:00'), to = new Date(from.getTime() + 24 * 3600e3);
  const busy = await freeBusy(pro.calendarId, from.toISOString(), to.toISOString());
  releaseExpired();
  const held = db.prepare(`SELECT start, end FROM bookings WHERE pro=? AND status IN ('pending','paid') AND start < ? AND end > ?`)
    .all(proId, to.toISOString(), from.toISOString()).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
  return { pro, type, slots: computeSlots({ date, pro, minutes: type.minutes, busy: [...busy, ...held] }) };
}

app.get('/api/slots', async (req, res) => {
  try {
    const r = await openSlots(req.query.pro, req.query.type, req.query.date);
    if (!r) return res.status(400).json({ error: 'Invalid request' });
    res.json({ slots: r.slots });
  } catch (e) { console.error(e); res.status(502).json({ error: 'Calendar unavailable' }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { pro: proId, type: typeId, start, name, email, phone, notes } = req.body ?? {};
    if (!name || !EMAIL_RE.test(email ?? '') || !phone || !start) return res.status(400).json({ error: 'Missing details' });
    const startDate = new Date(start);
    if (isNaN(startDate)) return res.status(400).json({ error: 'Invalid time' });
    const startIso = startDate.toISOString();
    const date = startDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
    const r = await openSlots(proId, typeId, date);
    if (!r || !r.slots.includes(startIso)) return res.status(409).json({ error: 'That time is no longer available' });
    const endIso = new Date(new Date(startIso).getTime() + r.type.minutes * 60e3).toISOString();
    const id = crypto.randomUUID();
    // re-check inside a transaction so two clients cannot grab the same slot
    const insert = () => {
      db.exec('BEGIN IMMEDIATE');
      try {
      const clash = db.prepare(`SELECT 1 FROM bookings WHERE pro=? AND status IN ('pending','paid') AND start < ? AND end > ? AND (status='paid' OR hold_expires >= ?)`)
        .get(proId, endIso, startIso, Date.now());
      if (clash) { db.exec('ROLLBACK'); return false; }
      db.prepare(`INSERT INTO bookings (id,pro,type,start,end,name,email,phone,notes,amount,status,hold_expires,created) VALUES (?,?,?,?,?,?,?,?,?,?,'pending',?,?)`)
        .run(id, proId, typeId, startIso, endIso, name, email, phone, notes ?? '', r.type.priceLKR, Date.now() + HOLD_MS, Date.now());
      db.exec('COMMIT');
      return true;
      } catch (e) { db.exec('ROLLBACK'); throw e; }
    };
    if (!insert()) return res.status(409).json({ error: 'That time is no longer available' });
    const [first, ...rest] = String(name).trim().split(/\s+/);
    res.json({
      id, action: checkoutUrl(sandbox),
      fields: {
        merchant_id: env.PAYHERE_MERCHANT_ID, order_id: id,
        items: `${r.type.label} with ${r.pro.name}`, amount: fmtAmount(r.type.priceLKR), currency: 'LKR',
        hash: checkoutHash({ merchantId: env.PAYHERE_MERCHANT_ID, orderId: id, amount: r.type.priceLKR, currency: 'LKR', secret: env.PAYHERE_MERCHANT_SECRET }),
        first_name: first, last_name: rest.join(' ') || '-', email, phone, address: 'N/A', city: 'Colombo', country: 'Sri Lanka',
        return_url: `${env.SITE_ORIGIN}/booking-confirmed.html?id=${id}`,
        cancel_url: `${env.SITE_ORIGIN}/booking-cancelled.html`,
        notify_url: `${env.API_BASE_URL}/api/payhere/notify`,
      },
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not start booking' }); }
});

app.post('/api/payhere/notify', async (req, res) => {
  const b = req.body;
  if (!verifyNotify(b, env.PAYHERE_MERCHANT_SECRET) || b.merchant_id !== env.PAYHERE_MERCHANT_ID) return res.sendStatus(400);
  const bk = db.prepare('SELECT * FROM bookings WHERE id=?').get(b.order_id);
  if (!bk || fmtAmount(bk.amount) !== b.payhere_amount || b.payhere_currency !== 'LKR') return res.sendStatus(400);
  if (b.status_code !== '2') {
    if (bk.status === 'pending' && Number(b.status_code) < 0) db.prepare(`UPDATE bookings SET status='failed' WHERE id=?`).run(bk.id);
    return res.sendStatus(200);
  }
  // Claim the booking in one transaction (idempotent: only the first successful callback creates the
  // event). If the hold lapsed and someone else took the slot before this payment landed, flag it.
  let outcome;
  db.exec('BEGIN IMMEDIATE');
  try {
    const clash = db.prepare(`SELECT id FROM bookings WHERE pro=? AND id<>? AND start < ? AND end > ? AND (status='paid' OR (status='pending' AND hold_expires >= ?))`)
      .get(bk.pro, bk.id, bk.end, bk.start, Date.now());
    outcome = clash ? 'conflict' : 'paid';
    const claimed = db.prepare(`UPDATE bookings SET status=? WHERE id=? AND status IN ('pending','expired')`).run(outcome, bk.id).changes;
    db.exec('COMMIT');
    if (!claimed) outcome = null;
    else if (clash) console.error(`PAID BOOKING CONFLICT: ${bk.id} (${bk.email}) paid after its hold lapsed; slot taken by ${clash.id}. Rebook or refund manually.`);
  } catch (e) { db.exec('ROLLBACK'); console.error(e); return res.sendStatus(500); }
  res.sendStatus(200);
  if (outcome !== 'paid') return;
  try {
    const pro = catalog[bk.pro], type = pro.sessions[bk.type];
    const ev = await createEvent({
      calendarId: pro.calendarId, bookingId: bk.id, start: bk.start, end: bk.end,
      summary: `${type.label}: ${bk.name}`,
      description: `Client: ${bk.name}\nEmail: ${bk.email}\nPhone: ${bk.phone}\nNotes: ${bk.notes}`,
    });
    db.prepare('UPDATE bookings SET event_id=?, meet_link=? WHERE id=?').run(ev.eventId, ev.meetLink, bk.id);
    await sendConfirmation({ to: bk.email, name: bk.name, proName: pro.name, label: type.label, startIso: bk.start, meetLink: ev.meetLink });
  } catch (e) { console.error('post-payment step failed for', bk.id, e); }
});

const contactLimit = rateLimiter({ max: 5, windowMs: 10 * 60e3 });
app.post('/api/contact', async (req, res) => {
  if (req.body?.website) return res.json({ ok: true }); // honeypot: bots fill hidden fields
  const { error, value } = validateContact(req.body);
  if (error) return res.status(400).json({ error });
  if (!contactLimit(req.ip)) return res.status(429).json({ error: 'Too many messages. Please try again later or contact us directly.' });
  try {
    await sendContact(value);
    res.json({ ok: true });
  } catch (e) { console.error('contact email failed', e); res.status(502).json({ error: 'Could not send your message. Please email or call us instead.' }); }
});

app.get('/api/bookings/:id', (req, res) => {
  const bk = db.prepare('SELECT status, start, pro, type, meet_link FROM bookings WHERE id=?').get(req.params.id);
  if (!bk) return res.sendStatus(404);
  res.json({ status: bk.status, start: bk.start, meetLink: bk.meet_link });
});

// In the Docker image the static website is served from the same container/origin.
if (env.STATIC_DIR) app.use(express.static(env.STATIC_DIR, { maxAge: '1h' }));

app.listen(env.PORT || 3000, () => console.log('booking-api listening'));
