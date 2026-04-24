# 补签提醒推送 系统设计

> 创建时间：2026/04/24

## 1. Concept & Vision

当用户连续签到面临中断风险时，通过 Web Push 推送提醒用户及时签到或使用补签卡修复。核心价值：保护用户连续签到成果，降低流失率，配合游戏化机制提升整体留存。

---

## 2. 系统架构

### 2.1 现有基础设施复用

- **推送渠道**：Web Push + Service Worker（已有）
- **数据库**：users 表已有 `streakRepairCards`、`currentStreak` 字段
- **每日 Cron**：已有的 `/api/push/send` 定时任务

### 2.2 新增推送类型

| 类型 | 触发条件 | 内容 |
|------|----------|------|
| `streak_warning` | 连续签到 ≥3天，明天不签到会中断 | "明天记得签到哦" |
| `streak_broken` | 用户漏签当天 | "连续签到已中断，使用补签卡修复" |

---

## 3. 触发逻辑

### 3.1 连续签到状态检测

```typescript
interface StreakStatus {
  currentStreak: number;      // 当前连续天数
  lastCheckinDate: string;   // 最近签到日期 YYYY-MM-DD
  hasRepairCards: number;     // 补签卡数量
}

// 判断明天是否会中断
function willBreakStreak(status: StreakStatus): boolean {
  const today = getDateStr();
  const yesterday = getDateStr(-1);
  const dayBeforeYesterday = getDateStr(-2);

  // 如果昨天已签到，今天还没签 → 今天必须签
  // 如果昨天没签到，前天已签 → 今天断了，用补签卡可以救
  // 如果连续断了2天 → 补签卡也无法修复

  const lastCheckin = status.lastCheckinDate;
  const daysSinceLastCheckin = daysBetween(lastCheckin, today);

  if (daysSinceLastCheckin === 0) {
    // 今天已签到，检查明天会不会断
    return true; // 明天需要提醒
  } else if (daysSinceLastCheckin === 1) {
    // 昨天签到，今天没签 → 可以用补签卡
    return status.hasRepairCards > 0;
  } else {
    // 断了2天以上，无法修复
    return false;
  }
}
```

### 3.2 发送时机

| 场景 | 发送时间 | 推送类型 |
|------|----------|----------|
| 连续签到 ≥3 天，今天已签到 | 每天 20:00 | `streak_warning` |
| 用户漏签当天检测到 | 每天 20:00 | `streak_broken` |

**为什么选 20:00？**
- 用户白天工作，晚上20点左右放松刷手机
- 看到提醒后还有时间当天补签
- 配合每日运势推送（用户习惯这个时间）

### 3.3 补签卡修复窗口

- 漏签后 **次日 24:00 前** 可用补签卡修复
- 修复后连续天数连续计算（不断）
- 补签卡余额不退还

---

## 4. API 设计

### 4.1 GET /api/push/check-streak

**用途**：内部接口，由 Cron 触发，检测需要发送补签提醒的用户

**认证**：`Authorization: Bearer <CRON_SECRET>`

**响应**：
```json
{
  "warnings": [
    { "userId": "xxx", "currentStreak": 5, "type": "streak_warning" }
  ],
  "broken": [
    { "userId": "yyy", "currentStreak": 7, "hasRepairCard": true, "type": "streak_broken" }
  ]
}
```

### 4.2 复用现有 /api/push/send

扩展现有的 `/api/push/send`，增加 `streak_warning` 和 `streak_broken` 消息类型。

---

## 5. 推送文案

### 5.1 streak_warning（提前提醒）

```
标题：🔥 连续签到别断了！
正文：明天记得签到，你的连续 5 天就要达成了～
```

### 5.2 streak_broken（中断提醒）

```
标题：💔 连续签到已中断
正文：别灰心，你还有 1 张补签卡，点击修复连续签到
```

### 5.3 点击行为

- `streak_warning` 点击 → 跳转到 App 首页
- `streak_broken` 点击 → 跳转到 Profile 页面签到卡片

---

## 6. 数据模型

### 6.1 users 表字段（已有）

| 字段 | 类型 | 说明 |
|------|------|------|
| currentStreak | INTEGER | 当前连续天数 |
| longestStreak | INTEGER | 最长连续天数 |
| streakRepairCards | INTEGER | 补签卡数量 |

### 6.2 checkins 表字段（已有）

| 字段 | 类型 | 说明 |
|------|------|------|
| checkinDate | TEXT | 签到日期 YYYY-MM-DD |
| isRepair | INTEGER | 是否补签 (0/1) |

---

## 7. 检测算法

### 7.1 每日20:00执行

```typescript
async function checkStreaks() {
  const db = getDb();
  const today = getDateStr();
  const yesterday = getDateStr(-1);

  // 获取所有有连续签到的用户（currentStreak >= 3）
  const users = db.prepare(`
    SELECT id, currentStreak, lastLoginAt, streakRepairCards
    FROM users
    WHERE currentStreak >= 3
  `).all() as User[];

  const warnings: User[] = [];
  const broken: User[] = [];

  for (const user of users) {
    // 获取用户最近2次签到记录
    const recentCheckins = db.prepare(`
      SELECT checkinDate, isRepair
      FROM checkins
      WHERE userId = ?
      ORDER BY checkinDate DESC
      LIMIT 2
    `).all(user.id) as Checkin[];

    if (recentCheckins.length === 0) continue;

    const lastCheckin = recentCheckins[0].checkinDate;

    // 场景1：今天已签到，但明天可能断
    if (lastCheckin === today) {
      // 检查后天是否已签（间接判断明天会不会签）
      const dayAfterTomorrow = getDateStr(1);
      const hasTomorrowCheckin = recentCheckins.some(c => c.checkinDate === dayAfterTomorrow);
      if (!hasTomorrowCheckin && user.currentStreak >= 3) {
        warnings.push(user);
      }
    }

    // 场景2：昨天签到，今天没签（今天断了）
    if (lastCheckin === yesterday) {
      if (user.streakRepairCards > 0) {
        broken.push(user);
      }
    }
  }

  return { warnings, broken };
}
```

---

## 8. 补签卡修复流程

### 8.1 使用条件

1. 用户持有补签卡（streakRepairCards > 0）
2. 漏签当天或次日24点前
3. 连续签到最多断裂1天

### 8.2 修复API（复用现有 /api/gamification/checkin）

扩展现有签到API，检测用户是否漏签、是否有补签卡，自动使用：

```typescript
// 在 /api/gamification/checkin 中新增逻辑
async function handleCheckin(userId: string) {
  const today = getDateStr();
  const yesterday = getDateStr(-1);

  const lastCheckin = getLastCheckinDate(userId);

  // 正常签到流程
  if (lastCheckin === yesterday || lastCheckin === today) {
    return normalCheckin(userId);
  }

  // 漏签检测
  if (lastCheckin === getDateStr(-2) && user.streakRepairCards > 0) {
    // 使用补签卡修复
    return repairCheckin(userId);
  }

  // 超过修复窗口
  throw new Error('连续签到已中断，无法签到');
}
```

---

## 9. 里程碑配合

| 里程碑 | 奖励 | 提醒时机 |
|--------|------|----------|
| 连续7天 | 补签卡 x1 | 漏签时提醒可用 |
| 连续30天 | 高级报告解锁券 x1 | 提醒提前积累 |

---

## 10. UI 入口

在 **Profile 页面 → 签到卡片** 中显示补签卡余额和提醒状态：

```
┌─────────────────────────────────┐
│  连续签到 🔥 5 天               │
│                                 │
│  ┌─ 补签卡 ─────────────────┐  │
│  │  你有 1 张补签卡          │  │
│  │  明天不签到会自动使用      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 11. 技术实现

### 11.1 新增文件

- `src/app/api/push/check-streak/route.ts` - 检测需要提醒的用户

### 11.2 修改文件

- `src/app/api/push/send/route.ts` - 支持 streak_warning 和 streak_broken 类型
- `src/app/api/gamification/checkin/route.ts` - 增加补签卡自动使用逻辑

### 11.3 Cron 任务调整

```
# 每天 20:00 执行
0 20 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/push/check-streak
```

---

## 12. 里程碑

| 阶段 | 功能 | 优先级 |
|------|------|--------|
| P0 | 检测漏签用户 + 发送 streak_broken 推送 | 必须有 |
| P0 | 签到API自动使用补签卡修复 | 必须有 |
| P1 | streak_warning 提前提醒 | 可选，后续加 |

---

## 13. Out of Scope（本期不做）

- 微信/短信补签提醒
- 补签卡购买
- 补签历史记录展示
