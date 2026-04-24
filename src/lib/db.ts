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
      try { db.exec("ALTER TABLE users ADD COLUMN pushEnabled INTEGER DEFAULT 0"); } catch (e) { console.error('Migration pushEnabled failed:', e); }
    }
    if (!hasColumn('pushTime')) {
      try { db.exec("ALTER TABLE users ADD COLUMN pushTime TEXT DEFAULT '08:00'"); } catch (e) { console.error('Migration pushTime failed:', e); }
    }
    if (!hasColumn('pushSubscription')) {
      try { db.exec("ALTER TABLE users ADD COLUMN pushSubscription TEXT"); } catch (e) { console.error('Migration pushSubscription failed:', e); }
    }

    // Migration: add gamification columns if not exist
    if (!hasColumn('points')) {
      try { db.exec("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0"); } catch (e) { console.error('Migration points failed:', e); }
    }
    if (!hasColumn('currentStreak')) {
      try { db.exec("ALTER TABLE users ADD COLUMN currentStreak INTEGER DEFAULT 0"); } catch (e) { console.error('Migration currentStreak failed:', e); }
    }
    if (!hasColumn('longestStreak')) {
      try { db.exec("ALTER TABLE users ADD COLUMN longestStreak INTEGER DEFAULT 0"); } catch (e) { console.error('Migration longestStreak failed:', e); }
    }
    if (!hasColumn('badges')) {
      try { db.exec("ALTER TABLE users ADD COLUMN badges TEXT DEFAULT '[]'"); } catch (e) { console.error('Migration badges failed:', e); }
    }
    if (!hasColumn('streakRepairCards')) {
      try { db.exec("ALTER TABLE users ADD COLUMN streakRepairCards INTEGER DEFAULT 0"); } catch (e) { console.error('Migration streakRepairCards failed:', e); }
    }

    // Migration: create checkins table if not exist
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS checkins (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          checkinDate TEXT NOT NULL,
          points INTEGER DEFAULT 5,
          isRepair INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL,
          UNIQUE(userId, checkinDate)
        );
        CREATE INDEX IF NOT EXISTS idx_checkins_userId ON checkins(userId);
      `);
    } catch (e) { console.error('Migration checkins table failed:', e); }

    // Migration: create analytics events table if not exist
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          userId TEXT,
          eventType TEXT NOT NULL,
          eventData TEXT DEFAULT '{}',
          url TEXT,
          referrer TEXT,
          userAgent TEXT,
          createdAt TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId);
        CREATE INDEX IF NOT EXISTS idx_events_eventType ON events(eventType);
        CREATE INDEX IF NOT EXISTS idx_events_createdAt ON events(createdAt);
      `);
    } catch (e) { console.error('Migration events table failed:', e); }

    // Migration: create daily_questions table if not exist
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS daily_questions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          answerType TEXT NOT NULL,
          reportId TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_daily_questions_userId ON daily_questions(userId);
      `);
    } catch (e) { console.error('Migration daily_questions table failed:', e); }
  }
  return db;
}
