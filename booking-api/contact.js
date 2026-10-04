// Validation for contact-form messages. Returns { error } or { value } (trimmed fields).
const LIMITS = { name: 200, email: 200, phone: 50, subject: 200, message: 5000 };
export const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function validateContact(body) {
  const v = {};
  for (const k of Object.keys(LIMITS)) {
    const raw = body?.[k];
    if (raw != null && typeof raw !== 'string') return { error: 'Invalid request' };
    v[k] = (raw ?? '').trim();
    if (v[k].length > LIMITS[k]) return { error: `${k[0].toUpperCase() + k.slice(1)} is too long` };
  }
  if (!v.name || !v.message) return { error: 'Please fill in your name and message' };
  if (!EMAIL_RE.test(v.email)) return { error: 'Please enter a valid email address' };
  return { value: v };
}

// Fixed-window per-key limiter: allow `max` hits per `windowMs`.
export function rateLimiter({ max, windowMs }) {
  const hits = new Map();
  return (key, now = Date.now()) => {
    for (const [k, h] of hits) if (now - h.start >= windowMs) hits.delete(k);
    const h = hits.get(key) ?? { start: now, n: 0 };
    h.n++; hits.set(key, h);
    return h.n <= max;
  };
}
