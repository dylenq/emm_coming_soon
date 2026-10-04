import { DatabaseSync } from 'node:sqlite';

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, pro TEXT, type TEXT, start TEXT, end TEXT,
    name TEXT, email TEXT, phone TEXT, notes TEXT,
    amount REAL, status TEXT, hold_expires INTEGER, event_id TEXT, meet_link TEXT, created INTEGER
  )`);
  return db;
}
