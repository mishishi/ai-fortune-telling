# 学科知识对战 — Trivia Card Game

> 赛博空间主题的知识对战卡牌游戏，支持 PvP 对战与练习模式。

## 游戏预览

![Cyberpunk UI](https://img.shields.io/badge/aesthetic-cyberpunk-00f5ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![Socket.io](https://img.shields.io/badge/Socket.io-4A4A4A?style=flat-square&logo=socket.io)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square)

## 功能特性

### 游戏模式

| 模式 | 说明 |
|------|------|
| **快速对战** | 与 AI 对战，先得 10 分获胜 |
| **练习模式** | 自由选择学科和难度，无压力练习 |

### 牌组系统

游戏使用混合牌堆，包含以下三类卡牌：

#### 学科卡（32 张）
| 学科 | 描述 |
|------|------|
| 语文 | 中国传统书法 — 砚台毛笔 |
| 数学 | 精密几何 — 圆规与制图 |
| 英语 | 字母核心 — Aa 字母造型 |
| 科学 | 原子物理 — 轨道电子模型 |
| 历史 | 青铜方鼎 — 饕餮纹古器 |
| 地理 | 立体地形 — 等高线山峰 |
| 生物 | 细胞结构 — 细胞膜与线粒体 |
| 道法 | 公平正义 — 天平法槌 |

每学科 4 种难度等级（Lv1~Lv4），每组合 1 张，共 32 张。

#### 技能卡（12 张，每种 2 张）

| 技能 | 效果 | 每局上限 |
|------|------|---------|
| **求助** | 请求 AI 提示（不说答案） | 2 次 |
| **换题** | 本轮作废，重出同难度题 | 1 次 |
| **双倍** | 本轮答对得 2 分 | 1 次 |
| **跳过** | 直接结束回合 | 无上限 |
| **禁手** | 对方本回合不能使用技能 | 1 次 |
| **先手** | 本轮由你先答题 | 无上限 |

#### 事件卡（4 张，每种 1 张）
抽到时自动触发全局效果：

| 事件 | 效果 |
|------|------|
| **闪电快答** | 当前题目时限强制 10 秒 |
| **双人合作** | 双方各答一题，都对各 +1 分 |
| **知识连击** | 必须连续答对 2 题才能得分 |
| **错题讲堂** | 答错后 AI 详细讲解（最长 60 秒） |

### 智能答案匹配

支持多种等效答案识别，无需完全精确匹配：

- **别名映射**：`李世民` = `唐太宗` = `太宗`
- **包含匹配**：`唐太宗李世民` 包含 `李世民`
- **分词覆盖**：正确答案 80% token 被回答覆盖即正确
- **历史人物别名**：嬴政/秦始皇、刘邦/汉高祖、武则天/武周 等 100+ 组

## 技术架构

```
trivia-card-game/
├── client/                 # React 18 + Vite 前端
│   └── src/
│       ├── components/     # React 组件
│       │   ├── GameBoard.tsx    # 主游戏面板
│       │   ├── Hand.tsx        # 手牌管理
│       │   ├── Card.tsx        # 统一卡牌组件
│       │   ├── Icons.tsx       # 20+ 自定义 SVG 图标
│       │   ├── ModeSelect.tsx  # 模式选择
│       │   ├── PracticeBoard.tsx # 练习模式
│       │   ├── QuestionPanel.tsx # 答题面板
│       │   ├── ScoreBoard.tsx  # 分数板
│       │   └── Timer.tsx       # 计时器
│       ├── hooks/
│       │   └── useGameSocket.ts # Socket.io 客户端
│       └── styles/
│           └── cyberpunk.css   # 全套赛博朋克 CSS
│
└── server/                 # Node.js + Express + Socket.io 后端
    └── src/
        ├── socket/
        │   └── gameHandler.ts  # 核心游戏逻辑
        ├── services/
        │   ├── questionService.ts  # AI 出题 (Minimax API)
        │   └── judgeService.ts     # 智能答案判定
        ├── db/
        │   └── sqlite.ts       # SQLite 数据库
        └── types/
            └── game.ts        # 类型定义
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
# 克隆仓库
git clone https://github.com/mishishi/trivia-card-game.git
cd trivia-card-game

# 安装依赖
cd server && npm install
cd ../client && npm install
```

### 配置环境变量

```bash
# server/.env
# DeepSeek (优先使用，如果配置了DeepSeek则忽略MiniMax)
# DEEPSEEK_API_KEY=your_deepseek_api_key_here
# DEEPSEEK_BASE_URL=https://api.deepseek.com
# DEEPSEEK_MODEL=deepseek-chat

# MiniMax (向后兼容，如果未配置DeepSeek则使用)
MINIMAX_API_KEY=your_api_key_here
MINIMAX_BASE_URL=https://api.minimaxi.com/v1
MINIMAX_MODEL=MiniMax-M2.7
```

### 启动

```bash
# 终端 1 — 启动后端 (端口 3001)
cd server && npm run dev

# 终端 2 — 启动前端 (端口 5173)
cd client && npm run dev
```

打开 http://localhost:5173 即可游玩。

## 数据库

SQLite 数据库 `data/game.db` 自动创建，包含以下表：

```sql
-- 题目记录
CREATE TABLE questions_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT, subject TEXT, level TEXT,
  question_hash TEXT, result TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 对局记录
CREATE TABLE game_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT, player_score INTEGER, ai_score INTEGER,
  winner TEXT, subject_cards_used TEXT, finished_at DATETIME
);
```

## API 设计

### WebSocket 事件

| 客户端发送 | 说明 | 参数 |
|-----------|------|------|
| `start_game` | 开始新游戏 | `{ winScore?: number; mode?: 'pvp' \| 'practice' }` |
| `play_cards` | 出牌开始答题 | `{ cardIndex: number }` |
| `submit_answer` | 提交答案 | `{ answer: string }` |
| `use_skill` | 使用技能卡 | `{ cardIndex: number }` |
| `request_hint` | 请求提示 | — |

| 服务器推送 | 说明 |
|-----------|------|
| `game_state` | 完整游戏状态（含手牌、分数、阶段等） |
| `error` | 错误信息（3 秒自动清除） |
| `hint_received` | AI 提示内容 |
| `skill_activated` | 技能激活确认 |
| `explanation` | AI 错题讲解 |

### REST API

```
POST /api/practice-question
  Body: { subject: string; level: string }
  Response: { question: Question }
```

## 游戏流程

```
选择模式
    │
    ▼
开始游戏 ──────────────────────────────────┐
    │                                         │
    ▼                                         │
出牌阶段（play_card）                         │
    │                                         │
    ├─ 学科+等级组合卡 ──→ play_cards         │
    ├─ 技能卡 ──────────→ use_skill          │
    └─ 事件卡 ──(自动触发)─→ 等待事件效果      │
                                            │
    ▼                                         │
答题阶段（answering）◄──────────┐              │
    │                           │              │
    │  计时器倒计时 ──────────→ 超时 → __TIMEOUT__
    │                           │              │
    ▼                           │              │
答案判定（智能匹配）              │              │
    │                           │              │
    ├─ 正确 ──→ 得分 ──→ 检查胜负条件           │
    │                                         │
    ├─ 事件处理（连击/合作/讲堂）              │
    │                                         │
    └─ 错误 ──→ 显示正确答案                   │
                                             │
    └────────────── ← ─ ─ ─ ─ ─ ─ ─ ┘
    │
    ▼
game_over / 重新开始
```

## 开发指南

### 添加新技能

1. 在 `server/src/types/game.ts` 的 `SKILL_CARDS` 添加定义
2. 在 `server/src/socket/gameHandler.ts` 的 `use_skill` handler 添加效果逻辑
3. 在 `client/src/components/Icons.tsx` 添加对应的 SVG 图标

### 添加新学科

1. 在 `server/src/types/game.ts` 的 `SUBJECT_CARDS` 添加定义
2. 在 `client/src/components/Icons.tsx` 的 `SUBJECT_ICONS` 添加 SVG 图标

### 修改答案匹配规则

所有逻辑在 `server/src/services/judgeService.ts`，修改 `ALIAS_GROUPS` 数组即可添加新别名映射。

## 许可证

MIT
