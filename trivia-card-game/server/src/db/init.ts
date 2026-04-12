import path from 'path';
import fs, { readFileSync } from 'fs';
import { initSqlDb, saveDb } from './sqlite';

export async function initDb() {
  const dataDir = path.join(__dirname, '../../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const db = await initSqlDb();
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);

  // 检查是否存在 active season，不存在则创建
  const activeSeason = db.exec("SELECT id FROM seasons WHERE is_active = 1");
  if (activeSeason.length === 0) {
    // 创建第一个赛季，持续 8 周
    const now = new Date();
    const end = new Date(now.getTime() + 8 * 7 * 24 * 60 * 60 * 1000);
    db.run(
      "INSERT INTO seasons (name, start_at, end_at, is_active) VALUES (?, ?, ?, 1)",
      ['S1 2026', now.toISOString(), end.toISOString()]
    );
  }
  saveDb();
  console.log('Database initialized');
}
