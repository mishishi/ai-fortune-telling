import fs from 'fs';
import path from 'path';
import { initSqlDb, saveDb } from './sqlite';
import { readFileSync } from 'fs';

export async function initDb() {
  const dataDir = path.join(__dirname, '../../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const db = await initSqlDb();
  const schema = readFileSync(path.join(__dirname, '../../src/db/schema.sql'), 'utf-8');
  db.run(schema);
  saveDb();
  console.log('Database initialized');
}

initDb().catch(console.error);
