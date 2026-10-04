import crypto from 'node:crypto';

const md5 = (s) => crypto.createHash('md5').update(s).digest('hex').toUpperCase();
export const fmtAmount = (n) => Number(n).toFixed(2);

export function checkoutUrl(sandbox) {
  return sandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout';
}

// hash = md5(merchant_id + order_id + amount + currency + md5(secret))
export function checkoutHash({ merchantId, orderId, amount, currency, secret }) {
  return md5(merchantId + orderId + fmtAmount(amount) + currency + md5(secret));
}

// md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(secret))
export function verifyNotify(body, secret) {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;
  if (!md5sig) return false;
  const expected = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(secret));
  const a = Buffer.from(expected), b = Buffer.from(String(md5sig).toUpperCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
