import { google } from 'googleapis';

let cal;
function client() {
  if (!cal) {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    cal = google.calendar({ version: 'v3', auth });
  }
  return cal;
}

export async function freeBusy(calendarId, timeMin, timeMax) {
  if (process.env.DEV_FAKE_CALENDAR) return []
  const r = await client().freebusy.query({
    requestBody: { timeMin, timeMax, items: [{ id: calendarId }] },
  });
  return (r.data.calendars?.[calendarId]?.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

export async function createEvent({ calendarId, summary, description, start, end, bookingId }) {
  if (process.env.DEV_FAKE_CALENDAR) return { eventId: 'dev-' + bookingId, meetLink: 'https://meet.google.com/dev-fake' }
  const body = { summary, description, start: { dateTime: start }, end: { dateTime: end } };
  let r;
  try {
    r = await client().events.insert({
      calendarId, conferenceDataVersion: 1,
      requestBody: { ...body, conferenceData: { createRequest: { requestId: bookingId, conferenceSolutionKey: { type: 'hangoutsMeet' } } } },
    });
  } catch (e) {
    // Service accounts on personal Gmail calendars cannot create Meet links; still book the slot.
    console.warn('Meet link not created, creating plain event:', e.message);
    r = await client().events.insert({ calendarId, requestBody: body });
  }
  return { eventId: r.data.id, meetLink: r.data.hangoutLink ?? null };
}
