# 学科知识对战卡牌 · Phase 3 设计文档

> 版本：v1.0 | 日期：2026-04-10 | 状态：已批准

---

## 一、设计目标

Phase 3 实现排位与赛季系统，包含：
1. **异步对战模式** — 48小时回合制，玩家 vs AI（AI 代打）
2. **Battle Pass 基础框架** — 赛季通行证免费路线
3. **赛季积分与段位系统** — 青铜→白银→黄金→铂金→钻石

---

## 二、技术选型

- **数据库**：继续使用 SQLite（Phase 4 升级 PostgreSQL）
- **AI 代打策略**：固定概率模型（不调用额外 API）
  - Lv1: 90% 正确率
  - Lv2: 75% 正确率
  - Lv3: 55% 正确率
  - Lv4: 40% 正确率
- **Battle Pass**：Phase 3 完整实现免费路线，高级路线界面占位显示"即将上线"

---

## 三、数据模型

### 3.1 新增数据库表

```sql
-- 赛季定义表
CREATE TABLE seasons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,          -- 如 "S1 2026"
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT FALSE
);

-- 玩家段位记录
CREATE TABLE player_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  season_id INTEGER NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',  -- bronze/silver/gold/platinum/diamond
  xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, season_id)
);

-- 异步对局
CREATE TABLE async_rooms (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'waiting',  -- waiting/playing/completed/expired
  player_answers TEXT NOT NULL DEFAULT '[]',  -- JSON array
  ai_answers TEXT NOT NULL DEFAULT '[]',      -- JSON array
  turn_count INTEGER NOT NULL DEFAULT 0,
  max_turns INTEGER NOT NULL DEFAULT 3,
  player_score INTEGER NOT NULL DEFAULT 0,
  ai_score INTEGER NOT NULL DEFAULT 0,
  winner TEXT,  -- player/ai/expired
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Battle Pass 进度
CREATE TABLE battle_pass (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  season_id INTEGER NOT NULL,
  free_claimed TEXT NOT NULL DEFAULT '[]',    -- JSON array of claimed tier ids
  premium_claimed TEXT NOT NULL DEFAULT '[]', -- JSON array
  unlocked_tiers TEXT NOT NULL DEFAULT '[]',   -- JSON array of unlocked tier ids
  UNIQUE(player_id, season_id)
);
```

### 3.2 新增类型定义

```typescript
type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface Season {
  id: number;
  name: string;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
}

interface PlayerSeasonStats {
  playerId: string;
  seasonId: number;
  tier: Tier;
  xp: number;
  rank: number;
  totalGames: number;
  wins: number;
}

interface AsyncRoom {
  id: string;
  playerId: string;
  state: 'waiting' | 'playing' | 'completed' | 'expired';
  playerAnswers: AsyncAnswer[];
  aiAnswers: AsyncAnswer[];
  turnCount: number;
  maxTurns: number;
  playerScore: number;
  aiScore: number;
  winner: 'player' | 'ai' | 'expired' | null;
  expiresAt: Date;
}

interface AsyncAnswer {
  subject: string;
  level: string;
  questionId: string;
  answer: string;
  correct: boolean;
  xpEarned: number;
}

const TIER_THRESHOLDS: Record<Tier, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
  diamond: 5000,
};

const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

const BP_FREE_REWARDS = [
  { tier: 'bronze', type: 'card_back', name: 'S1 青铜卡背', claimed: false },
  { tier: 'silver', type: 'card_back', name: 'S1 白银卡背', claimed: false },
  { tier: 'gold', type: 'title', name: 'S1 黄金称号', claimed: false },
  { tier: 'platinum', type: 'card_back', name: 'S1 铂金卡背', claimed: false },
  { tier: 'diamond', type: 'title', name: 'S1 钻石称号', claimed: false },
];
```

---

## 四、API 设计

### 4.1 WebSocket 事件

| 客户端发送 | 说明 | 参数 |
|-----------|------|------|
| `start_async_game` | 开始异步对战 | `{ maxTurns?: number }` |
| `submit_async_turn` | 提交本回合答题 | `{ answers: [{ subjectId, levelId, questionId, answer }] }` |

| 服务器推送 | 说明 | 负载 |
|-----------|------|------|
| `async_room_state` | 异步房间状态更新 | `AsyncRoom` |
| `ai_turn_result` | AI 代打结果 | `{ turnCount, aiScore, aiAnswers }` |
| `xp_gained` | 本回合 XP 变化 | `{ xpEarned, totalXp, tier, tierChanged }` |
| `tier_up` | 段位晋升 | `{ newTier }` |
| `async_game_over` | 对局结束 | `{ winner, finalScore }` |
| `season_state` | 当前赛季状态推送 | `{ season, playerStats }` |

### 4.2 REST API

```
GET  /api/season/current
  Response: { season: Season } | { error: "No active season" }

GET  /api/player/:playerId/season-stats
  Response: { stats: PlayerSeasonStats }

GET  /api/leaderboard?limit=20&around=5
  Response: { entries: PlayerSeasonStats[], playerRank: number }

GET  /api/async-room/:roomId
  Response: { room: AsyncRoom }
```

---

## 五、核心流程

### 5.1 异步对战完整流程

```
1. 玩家发起 start_async_game
   → 创建 async_room，state='waiting'，expires_at = now + 48h
   → 推送 async_room_state

2. 玩家提交 submit_async_turn({ answers: [...] })
   answers 数组包含本回合所有作答

3. 服务器立即处理：
   a. 判定玩家答案（使用 judgeService）
   b. 计算本回合 XP
   c. AI 代打：每题按等级固定概率掷骰决定对错
   d. 更新 playerScore / aiScore
   e. turnCount++
   f. 检查胜负条件（达到 maxTurns 或 48h 超时）
   g. 若未结束：重置 expires_at
   h. 推送 async_room_state + ai_turn_result + xp_gained

4. 48h 超时触发 expired：
   → winner='expired'，推送 async_game_over

5. 对局结束：
   → 写入 game_records
   → 更新 player_tiers（XP 累加，段位重计算）
   → 更新 battle_pass
   → 推送 season_state
```

### 5.2 XP 计算规则

每答对1题：
- 基础 +3 XP
- Lv4 额外 +2 XP，Lv3 +1 XP
- 本回合100%正确率额外 +5 XP
- 本回合用时 < 50% 时限额外 +3 XP

示例：Lv4 全对（<50%时限）= 3 + 2 + 5 + 3 = 13 XP/题

### 5.3 AI 代打策略

对于每个 AI 回答的题目，按难度掷骰：
- Lv1: 90% 概率 correct=true
- Lv2: 75% 概率 correct=true
- Lv3: 55% 概率 correct=true
- Lv4: 40% 概率 correct=true

AI 不调用 Minimax API，纯本地随机模拟。

### 5.4 段位晋升

赛季 XP 达到阈值即晋升：
- 青铜(0) → 白银(500) → 黄金(1500) → 铂金(3000) → 钻石(5000)
- 无降级机制
- 晋升时推送 `tier_up` 事件

### 5.5 Battle Pass 免费路线

每个段位解锁对应 tier 奖励：
- 青铜 tier 解锁 → 青铜奖励可领取
- 达到对应段位后奖励自动发放（无需手动领取）

免费奖励内容（S1示例）：
- 青铜卡背：赛博朋克霓虹主题卡背
- 白银卡背：进阶霓虹主题卡背
- 黄金称号："黄金黑客"
- 铂金卡背：高阶霓虹主题卡背
- 钻石称号："钻石骑士"

高级路线：界面显示灰掉按钮 + "即将上线"

---

## 六、前端改动

### 6.1 新增页面/组件

```
client/src/components/
  AsyncGameBoard.tsx   # 异步对战主界面
  SeasonPanel.tsx      # 赛季状态面板（当前段位+XP进度条）
  Leaderboard.tsx      # 排行榜
  BattlePassPanel.tsx  # Battle Pass 界面
  ModeSelect.tsx       # 改动：增加异步对战入口
```

### 6.2 useGameSocket 新增事件

```typescript
// 赛季状态
socket.on('season_state', (data: { season: Season; stats: PlayerSeasonStats }) => {...});
socket.on('tier_up', (data: { newTier: Tier }) => {...});
socket.on('xp_gained', (data: { xpEarned: number; totalXp: number; tier: Tier }) => {...});

// 异步对战
socket.on('async_room_state', (data: AsyncRoom) => {...});
socket.on('ai_turn_result', (data: { turnCount: number; aiScore: number; aiAnswers: AsyncAnswer[] }) => {...});
socket.on('async_game_over', (data: { winner: string; finalScore: { player: number; ai: number } }) => {...});

// 新增 emit
startAsyncGame: (maxTurns?: number) => socket.emit('start_async_game', { maxTurns }),
submitAsyncTurn: (answers: AnswerSubmission[]) => socket.emit('submit_async_turn', { answers }),
```

---

## 七、后端改动

### 7.1 新增文件

```
server/src/
  socket/asyncGameHandler.ts   # 异步对战 WebSocket 处理
  services/seasonService.ts    # 赛季 XP/段位计算
  services/aiStrategyService.ts # AI 代打策略
  db/seasonDb.ts                # 赛季相关数据库操作
```

### 7.2 赛季自动管理

服务器启动时检查是否存在 active season，若无则创建第一个赛季（8周）。

---

## 八、自检清单

- [ ] AI 代打不调用 Minimax API，纯本地随机
- [ ] SQLite 继续使用，不升级 PostgreSQL
- [ ] Battle Pass 免费路线完整，高级路线仅占位
- [ ] 48小时超时自动判负
- [ ] 每回合最多3题
- [ ] XP 计算规则完整
- [ ] 段位达到阈值自动晋升
- [ ] 赛季结束自动创建新赛季（8周循环）
