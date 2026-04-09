import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDb } from './db/init';
import { generateQuestion } from './services/questionService';
import { judgeAnswer } from './services/judgeService';
import { setupGameHandlers } from './socket/gameHandler';

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

const PORT = parseInt(process.env.PORT || '3001');

async function start() {
  try {
    await initDb();

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

    app.post('/api/judge', (req, res) => {
      const { playerAnswer, correctAnswer, subject } = req.body;
      const correct = judgeAnswer(playerAnswer, correctAnswer, subject);
      res.json({ correct });
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
