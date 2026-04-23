# 游戏化系统设计

## 1. Concept & Vision

通过签到积分和徽章体系，激励用户每日回访，形成使用习惯。积分可解锁高级报告功能，将游戏化与核心业务价值结合，提升留存的同时促进付费转化。

## 2. 系统架构

### 2.1 数据模型

**数据库新增表：checkins**
```sql
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  checkinDate TEXT NOT NULL,  -- YYYY-MM-DD
  points INTEGER DEFAULT 5,
  createdAt TEXT NOT NULL,
  UNIQUE(userId, checkinDate)
);
```

**users 表扩展字段：**
- `points INTEGER DEFAULT 0` - 累计积分
- `currentStreak INTEGER DEFAULT 0` - 当前连续签到天数
- `longestStreak INTEGER DEFAULT 0` - 最长连续签到天数
- `badges TEXT DEFAULT '[]'` - 已获得徽章JSON数组

### 2.2 API 设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/gamification/checkin` | POST | 签到，返回积分和是否获得新徽章 |
| `/api/gamification/status` | GET | 获取当前积分、连续签到天数、徽章列表 |

#### POST /api/gamification/checkin

**请求：** 无需 body，通过 cookie 获取 userId

**响应：**
```json
{
  "success": true,
  "pointsEarned": 5,
  "totalPoints": 25,
  "currentStreak": 3,
  "newBadges": ["初来乍到"],
  "unlockedFeature": null
}
```

**逻辑：**
1. 检查今日是否已签到
2. 计算连续天数（昨日已签则+1，否则重置为1）
3. 增加积分
4. 检查是否有新徽章
5. 返回结果

#### GET /api/gamification/status

**响应：**
```json
{
  "points": 25,
  "currentStreak": 3,
  "longestStreak": 7,
  "badges": [
    { "id": "first_checkin", "name": "初来乍到", "icon": "🌱", "earnedAt": "2026-04-20" },
    { "id": "streak_7", "name": "坚持7天", "icon": "🔥", "earnedAt": "2026-04-23" }
  ],
  "todayCheckedIn": true,
  "canUnlockPremium": false
}
```

## 3. 徽章定义

| 徽章ID | 名称 | 图标 | 条件 | 奖励积分 |
|--------|------|------|------|----------|
| first_checkin | 初来乍到 | 🌱 | 完成首次签到 | 5 |
| streak_7 | 坚持7天 | 🔥 | 连续签到7天 | 20 |
| streak_30 | 恒心30天 | 💎 | 连续签到30天 | 50 |
| points_100 | 资深命理师 | ⭐ | 累计100积分 | 0 |

**特殊奖励：**
- streak_7: 解锁"坚持"徽章称号
- streak_30: 解锁高级报告功能
- points_100: 解锁"资深命理师"称号

## 4. UI 设计

### 4.1 签到入口

**位置：** 个人中心页面

```
┌─────────────────────────────────┐
│  🎯 每日签到                    │
│                                 │
│  连续签到 3 天                  │
│  本月已签到 12 次               │
│                                 │
│  [今日已签到 ✓]  (或 [签到+5分]) │
│                                 │
│  已获得徽章: 🌱 🔥              │
└─────────────────────────────────┘
```

### 4.2 签到成功弹窗

```
┌─────────────────────────────────┐
│                                 │
│         🎉                     │
│                                 │
│     签到成功！                   │
│     +5 积分                     │
│                                 │
│     连续签到 3 天               │
│                                 │
│     🏅 获得新徽章               │
│     🌱 初来乍到                 │
│                                 │
│        [太棒了]                 │
└─────────────────────────────────┘
```

### 4.3 徽章墙

展示所有已获得徽章，未获得的显示为锁定状态。

```
┌─────────────────────────────────┐
│  🏆 我的徽章                     │
│                                 │
│  🌱 初来乍到       🔒            │
│  (2026-04-20)    首次签到       │
│                                 │
│  🔥 坚持7天        🔒            │
│  (2026-04-23)    连续7天签到    │
│                                 │
│  💎 恒心30天       🔒           │
│  未解锁          连续30天签到    │
│                                 │
│  ⭐ 资深命理师     🔒            │
│  未解锁          累计100积分     │
└─────────────────────────────────┘
```

## 5. 错误处理

| 错误 | 处理 |
|------|------|
| 今日已签到 | 返回已有数据，提示"今日已签到" |
| 未登录 | 返回401，前端跳转登录 |
| 用户不存在 | 返回404 |

## 6. 部署说明

无需额外依赖，使用现有 SQLite 数据库。

---

## 7. Out of Scope（本期不做）

- 积分转让或交易
- 积分排行榜
- 签到补卡功能
- 积分商城/虚拟商品兑换
