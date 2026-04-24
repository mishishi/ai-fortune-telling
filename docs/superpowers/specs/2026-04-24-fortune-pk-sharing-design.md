# 运势PK分享 系统设计

> 创建时间：2026/04/24

## 1. Concept & Vision

用户可以将自己的运势报告分享给好友发起PK挑战，好友无需注册，填写生日即可生成报告并对比。通过"碾压"、"完胜"等金句制造话题性，提升分享率和回流率。整体体验：分享卡片 → 扫码参与 → 生成对比结果。

---

## 2. 系统架构

### 2.1 核心流程

```
用户A分享 → PK挑战卡片图片 → 用户B扫码/点链接
  → 填写生日生成报告 → 查看PK结果（雷达图叠加 + 胜负金句）
```

### 2.2 技术方案

- **分享形式**：链接邀请 PK（好友无需注册，填生日即可）
- **对比维度**：五维分别对比（事业/感情/财运/健康/贵人）
- **结果展示**：胜负总结 + 雷达图并排
- **数据传递**：URL 参数 `?from=userId_A`（复用现有报告数据）

---

## 3. 页面设计

### 3.1 路由

| 页面 | 路径 | 说明 |
|------|------|------|
| PK 挑战页 | `/pk?from=userId` | 展示 PK 卡片，等待对手 |
| PK 结果页 | `/pk/result?from=userId_A&opponent=reportId_B` | 展示对战结果 |

### 3.2 PK 挑战卡片

```
┌─────────────────────────────────────┐
│                                     │
│     🎯 运势PK挑战                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [用户A头像/名字]         │   │
│  │      事业: 85  财运: 72      │   │
│  │      感情: 60  健康: 90      │   │
│  │      贵人: 78               │   │
│  └─────────────────────────────┘   │
│                                     │
│     VS                              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   ??? 等待对手入场           │   │
│  │   扫码参与运势PK             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [生成我的运势报告]                 │
│                                     │
└─────────────────────────────────────┘
```

### 3.3 PK 结果页

```
┌─────────────────────────────────────┐
│                                     │
│   🏆 你的事业运碾压对方！            │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │  你      │ VS │  对方    │      │
│  │ [雷达图] │    │ [雷达图] │      │
│  │ 事业 85  │    │ 事业 62  │      │
│  │ 感情 60  │    │ 感情 71  │      │
│  │ 财运 72  │    │ 财运 68  │      │
│  │ 健康 90  │    │ 健康 55  │      │
│  │ 贵人 78  │    │ 贵人 45  │      │
│  └──────────┘    └──────────┘      │
│                                     │
│   事业: +23 │ 感情: -11 │ 胜3项     │
│                                     │
│  [我也发起PK挑战]  [返回首页]       │
│                                     │
└─────────────────────────────────────┘
```

---

## 4. API 设计

### 4.1 创建PK挑战

**GET /api/pk/create?userId=xxx**

返回用户报告数据和 PK 分享链接。

```json
{
  "userId": "xxx",
  "name": "张三",
  "radarScores": { "career": 85, "love": 60, "wealth": 72, "health": 90, "mentor": 78 },
  "shareUrl": "/pk?from=xxx",
  "shareImageUrl": "/api/pk/image?userId=xxx"
}
```

### 4.2 生成PK分享图片

**GET /api/pk/image?userId=xxx**

返回 PK 挑战卡片图片（html-to-image 渲染）。

### 4.3 提交对手报告并显示结果

**GET /api/pk/result?from=userId_A&birthdate=1990-01-01&gender=male**

```json
{
  "challenger": {
    "name": "张三",
    "radarScores": { "career": 85, "love": 60, "wealth": 72, "health": 90, "mentor": 78 }
  },
  "opponent": {
    "name": "好友",
    "birthYear": 1990,
    "gender": "male",
    "radarScores": { "career": 62, "love": 71, "wealth": 68, "health": 55, "mentor": 45 }
  },
  "result": {
    "winner": "challenger",
    "winDimensions": ["career", "wealth", "health"],
    "loseDimensions": ["love", "mentor"],
    "summary": "你的事业运碾压对方！"
  }
}
```

---

## 5. 数据模型

### 5.1 复用现有数据

- 用户报告数据：已有 `reports` 表，包含 radarScores
- 用户信息：已有 `users` 表

### 5.2 新增表（可选，用于记录PK历史）

```sql
CREATE TABLE pk_records (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL,
  opponent_name TEXT,
  opponent_birthdate TEXT,
  opponent_gender TEXT,
  opponent_scores TEXT,  -- JSON
  winner TEXT,  -- 'challenger' | 'opponent'
  created_at TEXT,
  result_summary TEXT
);
```

---

## 6. 胜负判断逻辑

```typescript
function calculatePKResult(a: RadarScores, b: RadarScores) {
  const dimensions = ['career', 'love', 'wealth', 'health', 'mentor'];
  let winCountA = 0, winCountB = 0;
  const winDimensionsA: string[] = [];
  const winDimensionsB: string[] = [];

  for (const dim of dimensions) {
    if (a[dim] > b[dim]) {
      winCountA++;
      winDimensionsA.push(dim);
    } else if (b[dim] > a[dim]) {
      winCountB++;
      winDimensionsB.push(dim);
    }
  }

  const winner = winCountA > winCountB ? 'challenger' : 'opponent';
  const summary = generateSummary(winner, winDimensionsA, winDimensionsB);

  return { winner, winDimensionsA, winDimensionsB, summary };
}

function generateSummary(winner: string, winA: string[], winB: string[]) {
  const dimNames: Record<string, string> = {
    career: '事业运', love: '感情运', wealth: '财运',
    health: '健康运', mentor: '贵人运'
  };

  if (winA.length === 5) return `全面碾压，你的运势无人能敌！`;
  if (winB.length === 5) return `对方完胜，这次运气不在你这边～`;

  const myWinDims = winner === 'challenger' ? winA : winB;
  const bestDim = myWinDims.sort((a, b) =>
    (winner === 'challenger' ? a : b) as any
  )[0];

  return `你的${dimNames[bestDim]}碾压对方！`;
}
```

---

## 7. UI 组件

### 7.1 新增组件

| 组件 | 路径 | 说明 |
|------|------|------|
| PKChallengeCard | `src/components/PKChallengeCard.tsx` | PK挑战卡片（含对手占位） |
| PKResultCard | `src/components/PKResultCard.tsx` | PK结果展示 |
| RadarChart | `src/components/RadarChart.tsx` | 雷达图（已存在ShareReportCard中，需提取） |

### 7.2 复用组件

- `ShareReportCard` 中的 `SvgRadarChart` 需提取为独立组件
- 复用 `toast` 提示组件

---

## 8. 分享图片生成

复用现有 `html-to-image` 方案，新增 PK 专用卡片样式：

```typescript
// PK卡片尺寸：420x600（竖长卡片）
// 顶部：发起者信息
// 中间：VS
// 底部：对手占位 + 二维码
```

---

## 9. 埋点与数据

- PK 挑战发起数
- PK 挑战被接受数
- PK 结果页浏览数
- 各维度胜率统计

---

## 10. 技术实现文件

### 10.1 新增文件

- `src/app/api/pk/create/route.ts` — 创建PK挑战
- `src/app/api/pk/result/route.ts` — 计算PK结果
- `src/app/api/pk/image/route.ts` — 生成PK分享图片
- `src/app/pk/page.tsx` — PK挑战等待页
- `src/app/pk/result/page.tsx` — PK结果页
- `src/components/PKChallengeCard.tsx` — PK挑战卡片
- `src/components/PKResultCard.tsx` — PK结果卡片
- `src/components/RadarChart.tsx` — 提取的雷达图组件

### 10.2 修改文件

- `src/components/ShareReportCard.tsx` — 提取 RadarChart
- `src/components/ShareReport.tsx` — 增加"发起PK"按钮
- `src/app/page.tsx` — PK入口

---

## 11. Out of Scope（本期不做）

- PK 历史排行榜
- 好友对战记录保存（需登录）
- 微信/短信邀请
- PK 战绩分享卡片

---

## 12. 里程碑

| 阶段 | 功能 | 优先级 |
|------|------|--------|
| P0 | PK 挑战卡片生成 + 分享 | 必须有 |
| P0 | 对手生成报告 + 结果对比 | 必须有 |
| P1 | PK 结果页胜负金句 | 可选 |
| P1 | PK 历史记录 | 可选 |
