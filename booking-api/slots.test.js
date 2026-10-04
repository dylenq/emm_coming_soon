import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSlots } from './slots.js';
import { checkoutHash, verifyNotify } from './payhere.js';
import crypto from 'node:crypto';

const pro = { hours: { 1: ['09:00', '12:00'] }, bufferMin: 15, minNoticeHours: 0 };
const now = new Date('2026-01-01T00:00:00Z');

test('Monday window yields 30-min stepped 60-min slots', () => {
  const s = computeSlots({ date: '2026-10-05', pro, minutes: 60, busy: [], now });
  assert.equal(s.length, 5); // 09:00..11:00 start
});
test('busy block plus buffer removes neighbours', () => {
  const busy = [{ start: new Date('2026-10-05T10:00:00+05:30'), end: new Date('2026-10-05T11:00:00+05:30') }];
  const s = computeSlots({ date: '2026-10-05', pro, minutes: 60, busy, now });
  assert.deepEqual(s, []);
});
test('day with no hours is empty', () => {
  assert.deepEqual(computeSlots({ date: '2026-10-06', pro, minutes: 60, busy: [], now }), []);
});
test('notify signature verifies and rejects tampering', () => {
  const md5 = (s) => crypto.createHash('md5').update(s).digest('hex').toUpperCase();
  const body = { merchant_id: 'M', order_id: 'O', payhere_amount: '4000.00', payhere_currency: 'LKR', status_code: '2' };
  body.md5sig = md5('MO4000.00LKR2' + md5('sec'));
  assert.ok(verifyNotify(body, 'sec'));
  assert.ok(!verifyNotify({ ...body, payhere_amount: '1.00' }, 'sec'));
});
test('checkout hash is deterministic', () => {
  const a = { merchantId: 'M', orderId: 'O', amount: 4000, currency: 'LKR', secret: 's' };
  assert.equal(checkoutHash(a), checkoutHash(a));
});
