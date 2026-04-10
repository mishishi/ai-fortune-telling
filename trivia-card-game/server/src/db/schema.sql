CREATE TABLE IF NOT EXISTS game_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  player_score INTEGER NOT NULL DEFAULT 0,
  ai_score INTEGER NOT NULL DEFAULT 0,
  winner TEXT NOT NULL,
  subject_cards_used TEXT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME
);

CREATE TABLE IF NOT EXISTS questions_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  question_hash TEXT NOT NULL,
  result TEXT NOT NULL,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_log_room_id ON questions_log(room_id);

-- 赛季定义表
CREATE TABLE IF NOT EXISTS seasons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  is_active INTEGER DEFAULT 0
);

-- 玩家段位记录
CREATE TABLE IF NOT EXISTS player_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  season_id INTEGER NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, season_id)
);

-- 异步对局
CREATE TABLE IF NOT EXISTS async_rooms (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'waiting',
  player_answers TEXT NOT NULL DEFAULT '[]',
  ai_answers TEXT NOT NULL DEFAULT '[]',
  turn_count INTEGER NOT NULL DEFAULT 0,
  max_turns INTEGER NOT NULL DEFAULT 3,
  player_score INTEGER NOT NULL DEFAULT 0,
  ai_score INTEGER NOT NULL DEFAULT 0,
  winner TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Battle Pass 进度
CREATE TABLE IF NOT EXISTS battle_pass (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  season_id INTEGER NOT NULL,
  free_claimed TEXT NOT NULL DEFAULT '[]',
  unlocked_tiers TEXT NOT NULL DEFAULT '[]',
  UNIQUE(player_id, season_id)
);

CREATE INDEX IF NOT EXISTS idx_async_rooms_player_id ON async_rooms(player_id);
CREATE INDEX IF NOT EXISTS idx_async_rooms_state ON async_rooms(state);
CREATE INDEX IF NOT EXISTS idx_player_tiers_season ON player_tiers(season_id);
CREATE INDEX IF NOT EXISTS idx_player_tiers_rank ON player_tiers(rank);
