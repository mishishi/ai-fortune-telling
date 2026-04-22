# 家庭成员云端同步设计

## 背景问题

当前家庭成员数据存储在 `localStorage`，换设备或清除浏览器数据后完全丢失。对于需要长期留存、跨设备访问的数据，云端同步是必需的。

## 设计目标

1. 家庭成员数据云端持久化，用户换设备不丢失
2. 与现有手机号认证体系打通（`fortune_user_id`）
3. 保持现有 localStorage 作为离线缓存（可选增强）
4. 家庭成员的分析报告通过 `memberId` 与成员关联

## 数据库设计

### 新建 `members` 表

```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,  -- 'male' | 'female'
  birthData TEXT NOT NULL,  -- JSON: {year, month, day, hour, minute, province, timeSegment}
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX idx_members_userId ON members(userId);
```

## API 设计

### `GET /api/members`
获取当前用户所有家庭成员。

**响应：**
```json
[
  { "id": "xxx", "name": "张三", "gender": "male", "birthData": {...}, "createdAt": "...", "updatedAt": "..." }
]
```

### `POST /api/members`
添加新成员。

**请求：**
```json
{ "name": "张三", "gender": "male", "birthData": { "year": 1990, "month": 1, "day": 1, "hour": 8, "minute": 0, "province": "北京", "timeSegment": "middle" } }
```

**响应：** `201 { "id": "xxx", ... }`

### `PUT /api/members/[id]`
更新成员信息。

**请求：**
```json
{ "name": "张三", "gender": "male", "birthData": {...} }
```

**响应：** `200 { "id": "xxx", ... }`

### `DELETE /api/members/[id]`
删除成员。删除前检查 `userId` 归属。

**响应：** `200 { "success": true }`

## 前端改动

### `src/app/profile/page.tsx`

**读取逻辑：**
1. 优先从 localStorage 读取（缓存，立即显示）
2. 同时从 `/api/members` 拉取最新数据
3. 若 API 数据比 localStorage 新，以 API 为准并更新 localStorage

**写入逻辑：**
1. 所有增/删/改操作通过 API
2. API 成功后同步更新 localStorage

### `src/components/HistoryList.tsx`

成员筛选逻辑不变（已在读取 localStorage），改为读取 API。

## 可选增强（本期不做）

- 离线支持（Service Worker + IndexedDB）
- 成员头像
- 冲突解决（多设备同时修改）

## 文件变更清单

| 文件 | 改动类型 |
|------|----------|
| `src/lib/db.ts` | 新增 `members` 建表语句 |
| `src/app/api/members/route.ts` | 新建 GET/POST |
| `src/app/api/members/[id]/route.ts` | 新建 PUT/DELETE |
| `src/app/profile/page.tsx` | 改用 API 读写成员，保留 localStorage 缓存 |
| `src/components/HistoryList.tsx` | 改用 API 读取成员列表 |
| `docs/superpowers/specs/2026-04-22-family-members-cloud-sync-design.md` | 本文档 |

## 验证标准

1. 添加/编辑/删除家庭成员后刷新页面，数据仍然存在
2. 在一台设备添加成员，在另一台设备登录同一账号能看到该成员
3. 成员生日信息完整保存且可正确回填
4. 原有 localStorage 数据平滑迁移（首次加载时写入 API）
