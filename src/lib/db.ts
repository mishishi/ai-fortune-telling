import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'fortune.db');

let db: Database.Database;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        birthData TEXT NOT NULL,
        baziData TEXT NOT NULL,
        aiAnalysis TEXT NOT NULL,
        radarScores TEXT NOT NULL,
        isFullVersion INTEGER DEFAULT 1,
        unlocked INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_reports_userId ON reports(userId);
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL,
        lastLoginAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        birthData TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_members_userId ON members(userId);
    `);

    // Migration: add push columns if not exist (ignore errors if columns already exist)
    const userColumns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const hasColumn = (name: string) => userColumns.some(c => c.name === name);

    if (!hasColumn('pushEnabled')) {
      try { db.exec("ALTER TABLE users ADD COLUMN pushEnabled INTEGER DEFAULT 0"); } catch { /* ignore */ }
    }
    if (!hasColumn('pushTime')) {
      try { db.exec("ALTER TABLE users ADD COLUMN pushTime TEXT DEFAULT '08:00'"); } catch { /* ignore */ }
    }
    if (!hasColumn('pushSubscription')) {
      try { db.exec("ALTER TABLE users ADD COLUMN pushSubscription TEXT"); } catch { /* ignore */ }
    }
  }
  return db;
}
