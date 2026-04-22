# 年度运势追踪 设计规范

## 1. Concept & Vision

让用户每年回来都能看到自己运势的变化轨迹。核心不是"新的预测"，而是"与自己对比"——把历史报告串联成一条命盘成长线，让用户看到去年到今年的进退起伏。数据越多，价值越大。

目标：驱动用户年度回访，把产品从"一次性工具"变成"持续性陪伴"。

---

## 2. Feature Overview

### 2.1 运势仪表盘 (Fortune Dashboard)

**位置：** 独立页面 `/dashboard`，或在 `/history` 页面顶部加 Tab 切换

**核心功能：**
- **我的运势时间线** — 展示用户所有历史报告，按时间排列
- **年度对比卡片** — 选择两个报告并排对比雷达图 + 差异高亮
- **今年运势摘要** — 最新报告的流年分析 + 五维评分
- **运势趋势箭头** — 每个维度显示 ↑↓→ 变化指示

### 2.2 雷达图年度对比

**交互：**
- 选择两份报告（默认最新 vs 去年，或任意两份）
- 双雷达图并排显示，相同维度用虚线连接
- 差异 >15% 的维度高亮标注（绿色涨/红色跌）

**数据来源：**
- `radarScores`: `{ career, love, wealth, health, mentor }` — 每次报告都有
- `createdAt` — 用于确定报告年份

### 2.3 流年运势解读

**内容：**
- AI 生成的上一年 vs 今年运势简报（来自 `aiAnalysis.yearly`）
- 今年重点注意事项（从 `aiAnalysis.health`, `aiAnalysis.career` 等提取关键词）
- 与去年相比的总体运势走向（由 `FortuneLine` 当前阶段 + 年度变化趋势推导）

---

## 3. Data Architecture

### 3.1 现有数据结构

每份报告已包含：
```typescript
interface Report {
  id: string;
  userId: string;
  name: string;
  gender: string;
  birthData: string;     // { year, month, day, hour, minute, province, timeSegment }
  baziData: string;      // { bazi, fortuneLines, yearlyFortune, ... }
  aiAnalysis: string;    // { overall, career, love, wealth, health, yearly, ... }
  radarScores: string;    // { career, love, wealth, health, mentor } — 0-100
  createdAt: string;     // ISO date
}
```

### 3.2 新增字段（可选扩展）

暂不需要修改数据库。现有 `reports` 表已支持多报告存储（按 `userId` 索引）。

如需更精细的年度追踪，可在 `reports` 表新增：
```sql
ALTER TABLE reports ADD COLUMN reportYear INTEGER;  -- 手动指定报告所属年份
```

---

## 4. Component Design

### 4.1 FortuneDashboard 页面

**路由：** `/dashboard` 或 `/history?tab=fortune`

**子组件：**
- `FortuneTimeline` — 横向滚动时间线（基于现有 Timeline 改造）
- `RadarCompareView` — 双雷达图并排 + 差异高亮
- `YearlySummary` — 今年运势摘要卡
- `TrendArrows` — 五维趋势指示器

### 4.2 FortuneTimeline（改造自 Timeline）

**变化：**
- 现有 Timeline 展示"大运"（10年为单位）
- 新版同时展示：每个历史报告的"流年运势"（单年）
- 逻辑：同一用户所有 `createdAt` 的报告 → 按年份分组
- 年份标签显示在时间线节点上

### 4.3 RadarCompareView

**布局：**
```
[2024年报告]    [2025年报告]
   雷达图          雷达图
   (实线)          (实线+透明叠层)
```

**差异高亮规则：**
| 差值 | 显示 |
|------|------|
| > +15 | 绿色 ↑ 涨 |
| < -15 | 红色 ↓ 跌 |
| ±15以内 | 灰色 → 持平 |

### 4.4 YearlySummary

**卡片内容：**
- 今年综合运势评分（基于 radarScores 综合计算）
- 流年关键词（从 `aiAnalysis.yearly` 提取）
- 今年重点关注维度（得分最高 + 得分最低）

---

## 5. Interaction Flow

### 5.1 用户路径

```
用户打开 /dashboard
  → 看到自己的报告时间线（从新到旧排列）
  → 默认展示最新报告的年度摘要
  → 点击"对比"按钮选择第二份报告
  → 展示双雷达图对比 + 差异分析
```

### 5.2 引导回访

- 报告生成完成后，显示"已保存到你的运势仪表盘"
- 每年第一次打开时，提示"看看你今年的运势 vs 去年"

---

## 6. Technical Approach

### 6.1 API

现有 API 已支持，无需新增：

- `GET /api/reports?userId=xxx` — 获取用户所有报告（已按 `createdAt DESC` 返回）
- 每个报告自带 `radarScores` + `createdAt`，足够做年度对比

### 6.2 前端路由

两种方案：
- **方案A（推荐）：** 在 `/history` 页面加 Tab 切换（历史列表 / 运势追踪）
- **方案B：** 独立页面 `/dashboard`

推荐方案A，减少页面数量，共享用户数据。

### 6.3 组件列表

| 组件 | 说明 |
|------|------|
| `FortuneDashboard` | 主容器，含 Tab 切换 |
| `FortuneTimeline` | 改造自 Timeline，支持按报告节点点击 |
| `RadarCompareView` | 双雷达图并排对比 |
| `TrendArrows` | 五维趋势箭头 |
| `YearlySummary` | 年度摘要卡 |

---

## 7. Implementation Order

1. **FortuneDashboard 页面框架** — `/history` 加 Tab
2. **FortuneTimeline** — 改造 Timeline，按报告年份展示
3. **RadarCompareView** — 双雷达图 + 差异计算
4. **YearlySummary** — 最新报告的摘要展示
5. **TrendArrows** — 五维趋势指示

---

## 8. Out of Scope（本期不做）

- 风水/卦象/手相扩展
- 订阅制
- 分享功能
- 农历节气日历
- 多用户家庭视图（member 管理已在上期做完）
