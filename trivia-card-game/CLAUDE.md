# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trivia Card Game — a cyberpunk-themed knowledge battle card game with PvP vs AI and practice modes. Players use subject+level combo cards to request questions, skill cards for advantages, and event cards for global effects.

## Dev Commands

```bash
# Install dependencies (from repo root)
npm install

# Start both server (port 3001) and client (port 5173) concurrently
npm run dev

# Server only
npm run dev:server

# Client only
npm run dev:client

# Client build
npm run build --workspace=client
```

**Environment variables** (server `.env`):
```
# DeepSeek (优先使用，如果配置了DeepSeek则忽略MiniMax)
DEEPSEEK_API_KEY=your_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# MiniMax (向后兼容，如果未配置DeepSeek则使用)
MINIMAX_API_KEY=your_key
MINIMAX_BASE_URL=https://api.minimaxi.com/v1
MINIMAX_MODEL=MiniMax-M2.7
```

## Architecture

### Monorepo Structure
```
trivia-card-game/
├── client/          # React 18 + Vite + Socket.io-client
└── server/           # Node.js + Express + Socket.io
    └── src/
        ├── socket/gameHandler.ts     # Core game logic + Socket.io events
        ├── services/questionService.ts  # AI question generation (Minimax API)
        ├── services/judgeService.ts     # Answer matching with alias groups
        ├── db/sqlite.ts              # SQLite persistence
        └── types/game.ts            # All type definitions + card constants
```

### Game State Machine

Server-side `room.state.phase` drives the flow:

```
idle → play_card → answering → result → (back to play_card or game_over)
```

- **play_card**: Player selects a card from hand (subject+level combo, skill, or event)
- **answering**: Question is displayed, timer running, waiting for answer submission
- **result**: Answer correctness shown, explanation displayed
- **game_over**: Winner declared when a player reaches WIN_SCORE (10)

### Question Format (Plain Text, Parsed Server-Side)

AI generates questions in plain text format (not JSON). The `parseTextFormat()` in `questionService.ts` parses this output:

```
题目：XXX
A. XXX
B. XXX
C. XXX
D. XXX
答案：X
解析：XXX
```

- `answer` stays as single letter A/B/C/D
- `explanation` stores the 解析 text
- `options` is an array of `"A. XXX"` strings
- Falls back to "备选项" if AI doesn't provide 4 options

### Answer Matching (judgeService.ts)

Uses alias groups for smart matching — `李世民` equals `唐太宗` equals `太宗`. 100+ alias groups for historical figures, literary works, and scientific terms. Also supports token coverage (80% overlap) for long answers.

### Card Icon System

All card SVGs are defined in `client/src/components/Icons.tsx` as SVG strings in `SUBJECT_ICONS`, `SKILL_ICONS`, `EVENT_ICONS` record maps. Cards pass `icon=""` and the SVG is looked up by `subjectId`/`skillId`/`eventId`. SVG color inherits from `--card-accent` CSS variable on the parent.

### Socket.io Game State

`client/src/hooks/useGameSocket.ts` owns WebSocket connection. Server emits `game_state` on every phase change. Client also uses local `waitingForQuestion` state for loading UX while AI generates.

### HandCard Discriminated Union

```typescript
type HandCard =
  | { cardType: 'subject_level'; subjectId: string; levelId: string }
  | { cardType: 'skill'; skillId: string }
  | { cardType: 'event'; eventId: string };
```

## Key Files

| File | Purpose |
|------|---------|
| `server/src/socket/gameHandler.ts` | Room management, phase transitions, skill/event effects, AI opponent logic |
| `server/src/services/questionService.ts` | AI question generation (DeepSeek优先，MiniMax向后兼容), system prompt, `parseTextFormat()` plain-text parser |
| `server/src/services/judgeService.ts` | `judgeAnswer()` with alias groups + token coverage matching |
| `server/src/types/game.ts` | All types: `Question`, `HandCard`, `GamePhase`, card constants (`SUBJECT_CARDS`, `SKILL_CARDS`, `EVENT_CARDS`) |
| `client/src/components/GameBoard.tsx` | Main game UI state machine, renders phase-appropriate panels |
| `client/src/components/Icons.tsx` | All 20+ custom SVG icons as string maps |
| `client/src/hooks/useGameSocket.ts` | Socket.io client hook, emits `start_game`/`play_cards`/`submit_answer`/`use_skill` |

## Common Tasks

**Add a new skill**: Define in `SKILL_CARDS` (server/types/game.ts), add handler in `gameHandler.ts` `use_skill` case, add SVG icon in `Icons.tsx`.

**Add a new subject**: Add to `SUBJECT_CARDS` (server/types/game.ts) and `SUBJECT_ICONS` in `Icons.tsx`.

**Modify answer matching**: Edit `ALIAS_GROUPS` array in `judgeService.ts`.

**Change AI question format**: Edit `systemPrompt` in `questionService.ts` — keep the plain text 6-line output format and update `parseTextFormat()` if changing line structure.
