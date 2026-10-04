import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, rateLimiter } from './contact.js';

const ok = { name: ' Ana ', email: 'ana@x.lk', message: ' Hello ' };

test('valid contact is trimmed and accepted', () => {
  const { error, value } = validateContact(ok);
  assert.equal(error, undefined);
  assert.equal(value.name, 'Ana');
  assert.equal(value.message, 'Hello');
  assert.equal(value.phone, '');
});
test('missing message, bad email, wrong types and oversize fields are rejected', () => {
  assert.ok(validateContact({ ...ok, message: '  ' }).error);
  assert.ok(validateContact({ ...ok, email: 'nope' }).error);
  assert.ok(validateContact({ ...ok, name: ['x'] }).error);
  assert.ok(validateContact({ ...ok, message: 'x'.repeat(5001) }).error);
  assert.ok(validateContact(undefined).error);
});
test('rate limiter allows max hits per window then resets', () => {
  const hit = rateLimiter({ max: 2, windowMs: 1000 });
  assert.ok(hit('a', 0)); assert.ok(hit('a', 10)); assert.ok(!hit('a', 20));
  assert.ok(hit('b', 20));
  assert.ok(hit('a', 1000));
});
