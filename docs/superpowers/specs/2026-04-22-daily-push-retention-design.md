# 每日推送与用户留存 系统设计

## 1. Concept & Vision

让用户每天打开App，形成使用习惯。通过每日运势推送，在用户与产品之间建立"每日连接"，把产品从"一次性工具"变成"日常陪伴"。核心价值：降低回访成本，让用户在不知不觉中形成习惯。

---

## 2. 系统架构

### 2.1 推送渠道

**Web Push API + Service Worker**
- 标准浏览器通知方案，兼容 Chrome/Firefox/Safari
- 前端注册 Service Worker 监听 push 事件
- 权限同意后订阅信息存储到服务端

### 2.2 推送触发

**定时 Cron 任务**
- 每天用户设定的时间触发推送
- 使用外部 cron 服务（如 UptimeRobot、cron-job.org）调用 API
- 或使用 GitHub Actions 定时触发

### 2.3 数据存储

**数据库新增字段**
```sql
ALTER TABLE users ADD COLUMN pushEnabled INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN pushTime TEXT DEFAULT '08:00';
ALTER TABLE users ADD COLUMN pushSubscription TEXT;
```

---

## 3. 分阶段实现

### 第一阶段：轻量级每日推送

**目标：** 快速上线验证，收集用户反馈

**功能：**
1. 前端请求通知权限，用户同意后保存 subscription
2. 每日固定时间推送，内容基于日期生成（非AI）
3. Profile 页面管理推送设置（开关 + 时间选择）

**推送内容：**
- 标题：「今日运势：大吉」
- 正文：「事业+财富双旺，适合洽谈合作」
- 点击跳转到 App 首页今日运势弹窗

**API：**
- `POST /api/push/subscribe` - 保存/更新订阅
- `DELETE /api/push/unsubscribe` - 取消订阅
- `POST /api/push/send` - 内部接口，cron 触发

**前端：**
- `public/sw.js` - Service Worker 处理 push 事件
- `src/components/PushPermissionModal.tsx` - 权限请求弹窗
- `src/app/profile/page.tsx` - 添加推送设置区块

**限制：**
- 推送内容统一生成，不调用 AI
- 所有订阅用户收到相同内容

---

### 第二阶段：AI 个性化摘要

**目标：** 提升推送价值，差异化付费用户

**新增功能：**
1. 每日推送时，付费用户调用 AI 生成个性化摘要
2. 结合用户八字、流年数据生成专属内容
3. 免费用户继续收到统一内容

**API：**
- `POST /api/push/send-personalized` - AI 生成 + 发送

**成本控制：**
- AI 生成使用流式输出，减少 token 消耗
- 每日最多生成 N 次（可配置）

---

### 第三阶段：周报 + 月度总结

**新增功能：**
1. **每周一**推送周报摘要
2. **每月初**推送月报预测
3. **节气前一天**自动推送转换提醒

**数据聚合：**
- 周报：汇总本周运势数据，生成趋势分析
- 月报：基于月运势给出关键日期提示

---

## 4. 数据模型

### 4.1 User 表扩展

```typescript
interface User {
  id: string;
  phone: string;
  pushEnabled: boolean;      // 是否开启推送
  pushTime: string;          // 推送时间，格式 "HH:mm"，默认 "08:00"
  pushSubscription: string;   // PushSubscription JSON
  createdAt: string;
  lastLoginAt: string;
}
```

### 4.2 推送记录（可选）

```typescript
interface PushRecord {
  id: string;
  userId: string;
  sentAt: string;
  content: string;
  type: 'daily' | 'weekly' | 'monthly' | 'solar-term';
  success: boolean;
}
```

---

## 5. API 设计

### 5.1 POST /api/push/subscribe

**请求：**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": { "p256dh": "...", "auth": "..." }
  },
  "pushTime": "08:00"
}
```

**响应：**
```json
{ "success": true }
```

**逻辑：**
1. 验证 subscription 格式
2. 将 subscription 和 pushTime 存入 users 表
3. 设置 pushEnabled = 1

### 5.2 DELETE /api/push/unsubscribe

**响应：**
```json
{ "success": true }
```

**逻辑：**
1. 将 pushEnabled 设为 0
2. 保留 subscription（方便重新开启）

### 5.3 POST /api/push/send

**认证：** 内部接口，使用 secret token 验证
**Header：** `Authorization: Bearer <CRON_SECRET>`

**逻辑：**
1. 查询所有 pushEnabled=1 的用户
2. 按 pushTime 分组
3. 对每个用户发送对应时间的推送
4. 记录发送结果

**推送内容生成（基于日期）：**
```typescript
function generateDailyContent(date: Date): { title: string; body: string } {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const fortunes = ['大吉', '吉', '平', '凶'];
  const fortuneIdx = dayOfYear % fortunes.length;
  const fortune = fortunes[fortuneIdx];
  const tips = [
    '今日宜主动出击，把握机会',
    '今日财运平稳，谨慎投资',
    '今日贵人运旺，多与人交流',
    '今日注意调节情绪，保持平和',
  ];
  const tipIdx = (dayOfYear + fortuneIdx) % tips.length;
  return {
    title: `☀️ 今日运势：${fortune}`,
    body: tips[tipIdx],
  };
}
```

---

## 6. Service Worker 设计

### 6.1 sw.js

**位置：** `public/sw.js`

**功能：**
1. 注册 push 事件监听
2. 收到 push 后显示通知
3. 点击通知跳转到 App

```javascript
// 简化版逻辑
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: { url: data.url || '/' },
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### 6.2 前端注册

**时机：** 用户在 TodayFortuneModal 中点击"开启每日提醒"时

**代码：**
```typescript
async function subscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Browser does not support push');
  }
  const registration = await navigator.serviceWorker.register('/sw.js');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permission denied');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY,
  });
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription }),
  });
}
```

---

## 7. UI 设计

### 7.1 今日运势弹窗 - 提醒开启入口

在 TodayFortuneModal 底部添加：

```
┌─────────────────────────────────┐
│  [今日运势弹窗原有内容]          │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔔 开启每日推送           │  │
│  │    每天准时收到运势提醒    │  │
│  │    [开启提醒]             │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 7.2 Profile 页面 - 设置管理

```
┌─────────────────────────────────┐
│  每日运势提醒                    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 提醒开关           [开关]  │  │
│  └───────────────────────────┘  │
│                                 │
│  提醒时间                       │
│  ┌───────────────────────────┐  │
│  │ ○ 06:00  ○ 07:00         │  │
│  │ ● 08:00  ○ 09:00         │  │
│  │ ○ 10:00                  │  │
│  └───────────────────────────┘  │
│                                 │
│  状态：已开启 · 每天 08:00 推送  │
└─────────────────────────────────┘
```

### 7.3 推送通知样式

```
┌─────────────────────────────┐
│ ☀️ 今日运势：大吉           │
│                             │
│ 今日宜主动出击，把握机会     │
│                             │
│ 点击查看详情                 │
└─────────────────────────────┘
```

---

## 8. 错误处理

### 8.1 常见错误

| 错误 | 处理方式 |
|------|----------|
| 浏览器不支持 Push | 隐藏开启按钮，显示"您的浏览器不支持推送" |
| 用户拒绝通知权限 | 不再主动请求，显示提示引导用户在设置中开启 |
| Subscription 失效 | 发送时检测到 410 Gone，自动取消订阅 |
| Cron 服务失败 | 记录错误，下次成功时补发 |
| 网络超时 | 重试 3 次，仍失败则跳过 |

### 8.2 发送失败处理

```typescript
async function sendPush(subscription: PushSubscription, payload: object) {
  try {
    await fetch(subscription.endpoint, {
      method: 'POST',
      headers: subscription.options.headers,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error.status === 410 || error.status === 404) {
      // Subscription 不再有效，删除
      await deleteSubscription(subscription);
    }
    throw error;
  }
}
```

---

## 9. 安全考虑

### 9.1 VAPID 认证

- 使用 VAPID（Voluntary Application Server Identification）
- 公钥存储在前端环境变量
- 私钥仅存储在服务端

### 9.2 Cron 接口保护

- 使用 Bearer Token 认证
- Token 存储在 cron 服务配置中
- 不暴露给前端

### 9.3 数据安全

- Subscription 数据加密存储
- 不在日志中打印 subscription 内容

---

## 10. 部署说明

### 10.1 Cron 触发方案

**推荐：cron-job.org（免费）**
1. 注册 cron-job.org
2. 创建 GET 请求到 `https://your-domain.com/api/push/send?secret=<CRON_SECRET>`
3. 设置每日 08:00 执行

**备选：GitHub Actions**
```yaml
name: Daily Push
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 0点 = 北京时间 8点
```

### 10.2 环境变量

```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
CRON_SECRET=...
NEXT_PUBLIC_VAPID_KEY=...
```

---

## 11. 里程碑

| 阶段 | 功能 | 优先级 |
|------|------|--------|
| P0 | Service Worker + 订阅 API + 轻量推送 | 必须有 |
| P1 | Profile 设置管理 | 必须有 |
| P2 | AI 个性化摘要（付费用户） | 可选 |
| P3 | 周报/月报/节气提醒 | 可选 |

---

## 12. Out of Scope（本期不做）

- 微信/短信/邮件推送
- 推送点击率/转化率分析
- A/B 测试推送内容
- 用户画像分析
- 多语言支持
