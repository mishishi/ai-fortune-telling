# P2-1 分享卡片升级 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 升级分享卡片，支持3套视觉模板（星河命盘/山水意境/极简霓虹），增加动态效果和水印系统

**Architecture:** 
- 新建 ShareCard/ 组件目录，包含模板组件和效果组件
- 复用现有 html-to-image 图片生成逻辑
- 通过 CSS 类切换实现模板选择和动态效果

**Tech Stack:** React, TypeScript, html-to-image (已安装), CSS动画

---

## Task 1: 创建类型定义

**Files:**
- Create: `src/components/ShareCard/types.ts`

```typescript
export type TemplateType = 'starfield' | 'landscape' | 'neon';

export interface ShareCardData {
  name: string;
  gender: string;
  birthYear?: number;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  overall?: string;
  zodiac?: string;
  element?: string;
  createdAt: string;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
}
```

---

## Task 2: 实现效果组件

**Files:**
- Create: `src/components/ShareCard/effects/GlowEffect.tsx`
- Create: `src/components/ShareCard/effects/ParticleEffect.tsx`

### GlowEffect.tsx - 雷达图光晕效果
### ParticleEffect.tsx - 流星粒子效果

---

## Task 3: 实现模板A：星河命盘（核心模板）

**Files:**
- Create: `src/components/ShareCard/templates/StarfieldTemplate.tsx`

内容：
- 深紫渐变背景 (#1a1525 → #2d1f3d)
- SVG雷达图（复用现有SvgRadarChart）
- 五维进度条（金色渐变）
- 运势摘要卡片
- 水印（右下角品牌 + 左下角模板名）
- GlowEffect + ParticleEffect

---

## Task 4: 实现模板B：山水意境

**Files:**
- Create: `src/components/ShareCard/templates/LandscapeTemplate.tsx`

内容：
- 米白背景 (#f5f5f0)
- 墨色主调 (#2c2c2c)
- 简洁五边形雷达图轮廓
- 细横线进度条
- 大量留白

---

## Task 5: 实现模板C：极简霓虹

**Files:**
- Create: `src/components/ShareCard/templates/NeonTemplate.tsx`

内容：
- 深黑背景 (#0a0a0f)
- 霓虹线条（青色/品红/黄色）
- 发光效果
- 几何线条装饰

---

## Task 6: 创建分享弹窗 + 模板选择器

**Files:**
- Create: `src/components/ShareCard/ShareReportModal.tsx`

功能：
- 模板切换（3选1）
- 实时预览
- 复制链接按钮
- 生成分享图片按钮

---

## Task 7: 更新 ShareReport 使用新组件

**Files:**
- Modify: `src/components/ShareReport.tsx`

更新内容：
- 导入新的 ShareReportModal
- 传递模板数据
- 添加CSS动画样式

---

## Task 8: 清理和测试

验证：
- 三个模板都能正常渲染
- 切换模板时预览实时更新
- 动态效果在截图时保留
- 水印正确显示
- 移动端 Web Share API 正常

