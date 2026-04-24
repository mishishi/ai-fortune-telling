import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'fortune.db');

let db: Database.Database;

// ============================================================
// Migration System
// ============================================================

interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  // Version 1: Initial schema (reports, users, members tables)
  {
    version: 1,
    name: 'initial_schema',
    up: (db) => {
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
    },
  },

  // Version 2: Add push columns to users
  {
    version: 2,
    name: 'add_push_columns',
    up: (db) => {
      const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
      const hasColumn = (name: string) => cols.some(c => c.name === name);

      if (!hasColumn('pushEnabled')) {
        db.exec("ALTER TABLE users ADD COLUMN pushEnabled INTEGER DEFAULT 0");
      }
      if (!hasColumn('pushTime')) {
        db.exec("ALTER TABLE users ADD COLUMN pushTime TEXT DEFAULT '08:00'");
      }
      if (!hasColumn('pushSubscription')) {
        db.exec("ALTER TABLE users ADD COLUMN pushSubscription TEXT");
      }
    },
  },

  // Version 3: Add gamification columns to users
  {
    version: 3,
    name: 'add_gamification_columns',
    up: (db) => {
      const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
      const hasColumn = (name: string) => cols.some(c => c.name === name);

      if (!hasColumn('points')) {
        db.exec("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0");
      }
      if (!hasColumn('currentStreak')) {
        db.exec("ALTER TABLE users ADD COLUMN currentStreak INTEGER DEFAULT 0");
      }
      if (!hasColumn('longestStreak')) {
        db.exec("ALTER TABLE users ADD COLUMN longestStreak INTEGER DEFAULT 0");
      }
      if (!hasColumn('badges')) {
        db.exec("ALTER TABLE users ADD COLUMN badges TEXT DEFAULT '[]'");
      }
      if (!hasColumn('streakRepairCards')) {
        db.exec("ALTER TABLE users ADD COLUMN streakRepairCards INTEGER DEFAULT 0");
      }
    },
  },

  // Version 4: Create checkins table
  {
    version: 4,
    name: 'create_checkins_table',
    up: (db) => {
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
    },
  },

  // Version 5: Create events table
  {
    version: 5,
    name: 'create_events_table',
    up: (db) => {
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
    },
  },

  // Version 6: Create daily_questions table
  {
    version: 6,
    name: 'create_daily_questions_table',
    up: (db) => {
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
    },
  },

  // Version 7: Create predictions table
  {
    version: 7,
    name: 'create_predictions_table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS predictions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          report_id TEXT NOT NULL,
          dimension TEXT NOT NULL CHECK(dimension IN ('career','love','wealth','health','mentor')),
          prediction TEXT NOT NULL,
          timeframe_start TEXT NOT NULL,
          timeframe_end TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accurate','inaccurate')),
          feedback_note TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (report_id) REFERENCES reports(id)
        );
      `);
    },
  },

  // Version 8: Create user_prediction_profiles table
  {
    version: 8,
    name: 'create_user_prediction_profiles_table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_prediction_profiles (
          user_id TEXT PRIMARY KEY,
          career_accuracy REAL DEFAULT 0,
          love_accuracy REAL DEFAULT 0,
          wealth_accuracy REAL DEFAULT 0,
          health_accuracy REAL DEFAULT 0,
          mentor_accuracy REAL DEFAULT 0,
          total_predictions INTEGER DEFAULT 0,
          last_feedback_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
    },
  },

  // Version 9: Add isRepair column to checkins (backfill existing rows)
  {
    version: 9,
    name: 'add_isRepair_to_checkins',
    up: (db) => {
      const cols = db.prepare("PRAGMA table_info(checkins)").all() as { name: string }[];
      const hasColumn = (name: string) => cols.some(c => c.name === name);

      if (!hasColumn('isRepair')) {
        db.exec("ALTER TABLE checkins ADD COLUMN isRepair INTEGER DEFAULT 0");
      }
    },
  },
];

function ensureMigrationsTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

function getAppliedMigrations(db: Database.Database): Set<number> {
  const rows = db.prepare('SELECT version FROM _migrations').all() as { version: number }[];
  return new Set(rows.map(r => r.version));
}

function runMigrations(db: Database.Database) {
  ensureMigrationsTable(db);
  const applied = getAppliedMigrations(db);

  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      console.log(`[Migration ${migration.version}] ${migration.name}: running...`);
      try {
        migration.up(db);
        db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name);
        console.log(`[Migration ${migration.version}] ${migration.name}: completed`);
      } catch (error) {
        console.error(`[Migration ${migration.version}] ${migration.name}: FAILED -`, error);
        throw error;
      }
    }
  }
}

// ============================================================
// Database Initialization
// ============================================================

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec('PRAGMA foreign_keys = ON;');
    runMigrations(db);
  }
  return db;
}
