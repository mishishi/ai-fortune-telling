import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDb } from './db/init';
import { generateQuestion } from './services/questionService';
import { judgeAnswer } from './services/judgeService';
import { Subject, Level } from './types/game';
import { setupGameHandlers } from './socket/gameHandler';
import { setupAsyncGameHandlers } from './socket/asyncGameHandler';
import { getActiveSeason, getLeaderboard, getPlayerRank, getOrCreatePlayerSeason } from './db/seasonDb';
import { getPlayerSeasonState } from './services/seasonService';
import { startContextCleanup } from './services/contextService';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

setupGameHandlers(io);
setupAsyncGameHandlers(io);

const PORT = parseInt(process.env.PORT || '3001');

async function start() {
  try {
    await initDb();

    // 启动低活跃上下文自动清理
    startContextCleanup();

    // Test routes for AI question generation
    app.get('/api/test-question', async (req, res) => {
      try {
        const subject = (req.query.subject as string) || '数学';
        const level = (req.query.level as string) || 'Lv2';
        const q = await generateQuestion(
          subject as any, level as any,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!
        );
        res.json(q);
      } catch (e) {
        res.status(500).json({ error: (e as Error).message });
      }
    });

    // Practice mode - generate question without joining a game room
    app.post('/api/practice-question', async (req, res) => {
      const { subject, level } = req.body;

      if (!subject || !level) {
        res.status(400).json({ error: 'Missing subject or level' });
        return;
      }

      try {
        const q = await generateQuestion(
          subject as Subject,
          level as Level,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!
        );
        res.json({ question: q });
      } catch (e) {
        res.status(500).json({ error: (e as Error).message });
      }
    });

    app.post('/api/judge', (req, res) => {
      const { playerAnswer, correctAnswer, subject } = req.body;
      const correct = judgeAnswer(playerAnswer, correctAnswer, subject);
      res.json({ correct });
    });

    // 获取当前赛季信息
    app.get('/api/season/current', (req, res) => {
      const season = getActiveSeason();
      if (!season) {
        res.status(404).json({ error: 'No active season' });
        return;
      }
      res.json({ season });
    });

    // 获取玩家赛季数据
    app.get('/api/player/:playerId/season-stats', (req, res) => {
      const { playerId } = req.params;
      const season = getActiveSeason();
      if (!season) {
        res.status(404).json({ error: 'No active season' });
        return;
      }
      const stats = getOrCreatePlayerSeason(playerId, season.id);
      const rank = getPlayerRank(playerId, season.id);
      res.json({ stats: { ...stats, rank } });
    });

    // 获取排行榜
    app.get('/api/leaderboard', (req, res) => {
      const season = getActiveSeason();
      if (!season) {
        res.json({ entries: [], playerRank: 0 });
        return;
      }
      const limit = parseInt(req.query.limit as string) || 20;
      const entries = getLeaderboard(season.id, limit);
      res.json({ entries, seasonId: season.id });
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

start();
