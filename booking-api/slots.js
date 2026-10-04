// Asia/Colombo is a fixed UTC+05:30 (no DST), so offsets can be applied directly.
const OFFSET = '+05:30';
const STEP_MIN = 30;

export const toIso = (date, hhmm) => new Date(`${date}T${hhmm}:00${OFFSET}`);
const weekday = (date) => new Date(`${date}T12:00:00${OFFSET}`).getUTCDay();

// busy: [{start, end}] (Date), returns ISO start strings of open slots
export function computeSlots({ date, pro, minutes, busy, now = new Date() }) {
  const win = pro.hours[weekday(date)];
  if (!win) return [];
  const open = toIso(date, win[0]), close = toIso(date, win[1]);
  const earliest = new Date(now.getTime() + pro.minNoticeHours * 3600e3);
  const buf = pro.bufferMin * 60e3, len = minutes * 60e3, out = [];
  for (let t = open.getTime(); t + len <= close.getTime(); t += STEP_MIN * 60e3) {
    if (t < earliest.getTime()) continue;
    const s = t - buf, e = t + len + buf;
    if (busy.some((b) => s < b.end.getTime() && e > b.start.getTime())) continue;
    out.push(new Date(t).toISOString());
  }
  return out;
}
