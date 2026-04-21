# UX 综合改进设计规范

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** 全面改进项目 UX，对标 8.5/10 分数

**Architecture:** 基于现有组件系统，统一设计语言，修复交互、无障碍、空状态问题

**Tech Stack:** React, Tailwind CSS, CSS Custom Properties

---

## 1. 问题清单

### 1.1 配色不一致
| 文件 | 问题 |
|------|------|
| `src/components/ui/Button.tsx` | 使用旧紫色 `#7b68ee`，应改为 `var(--color-primary)` |
| `src/components/ui/CustomDropdown.tsx` | 使用旧紫色 `#7b68ee` |
| `src/components/ReportContent.tsx` | 硬编码金色 `#f0c674`，应用 CSS 变量 |
| `src/components/HistoryList.tsx` | 需检查是否有硬编码颜色 |

### 1.2 交互动效不足
- Button: 缺少 hover/active 视觉反馈
- CustomDropdown: focus 状态不清晰
- BirthForm inputs: focus 状态可增强

### 1.3 信息分层
- 报告页一次性展示所有内容，缺少渐进引导
- 雷达图默认展开，信息密度过高

### 1.4 空状态覆盖不全
- HistoryList 已有空状态
- CustomDropdown 下拉框无"无结果"状态
- 表单提交后无成功/失败状态展示

### 1.5 无障碍问题
- focus ring 颜色不统一
- 部分按钮缺少 aria-label
- 对比度不足（灰色文字 #9ca3af 在深色背景上偏暗）

---

## 2. 设计改进方案

### 2.1 配色统一规范

所有颜色必须通过 CSS 变量引用：

```
正确: color: var(--color-primary)
错误: color: #c41e3a
错误: color: #7b68ee (旧紫色)
```

**颜色变量清单：**
- `--color-primary: #c41e3a` (朱红)
- `--color-primary-hover: #a01830` (深朱红)
- `--color-secondary: #1e3a5f` (墨蓝)
- `--color-accent: #d4af37` (金色)
- `--color-accent-hover: #c9a430` (深金)
- `--color-text: #ffffff`
- `--color-text-secondary: #e0e0e0` (改：原 #b0b0b0 对比度不足)
- `--color-text-muted: #a0a0a0` (改：原 #9ca3af 对比度不足)

### 2.2 交互动效规范

**Button 状态：**
- Default: 背景色 normal
- Hover: 背景色 hover + 轻微上移 (-2px) + 阴影加深
- Active: 缩小 (scale 0.97) + 颜色加深
- Focus: 外发光 ring (box-shadow)
- Disabled: 透明度 50% + 禁止光标

**Input/Dropdown 状态：**
- Default: 边框 `var(--color-border)`
- Focus: 边框变为 `var(--color-primary)` + 外发光
- Error: 边框变为 `var(--color-error)` + 红色 glow
- Disabled: 背景变暗 + 禁止输入

**动画时长：**
- 快速交互 (hover): 150ms
- 状态切换: 200ms
- 内容展开: 300ms

### 2.3 信息分层策略

**报告页结构优化：**
```
1. 概览区（始终可见）
   - 命盘标题 + 四柱摘要
   - 生肖 + 五行信息

2. 雷达图（默认折叠，用户主动展开）
   - 点击后再显示详细分数

3. 命盘解读（核心内容，分段展示）
   - 默认展开第一项（命局总评）
   - 其他项目折叠，用户点击查看

4. 大运时间轴（默认折叠）
```

**雷达图折叠原因：** 数据密集，优先展示文字解读

### 2.4 空状态设计

| 场景 | 空状态文案 | 视觉 |
|------|-----------|------|
| 历史记录为空 | 暂无命盘记录，开始解读你的命运 | 卷轴 SVG + 引导按钮 |
| 下拉框无选项 | 暂无可选项目 | 文案 + 图标 |
| 加载中 | 命运推演中... | 旋转命盘动画 |
| 提交成功 | 命盘已生成 | 勾选动画 + 自动跳转 |

### 2.5 无障碍增强

**对比度修复：**
- `--color-text-secondary`: #b0b0b0 → #e0e0e0
- `--color-text-muted`: #9ca3af → #a0a0a0

**焦点状态：**
```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary), 0 0 0 6px rgba(196, 30, 58, 0.2);
}
```

**ARIA 增强：**
- 所有图标按钮添加 aria-label
- 下拉框选项添加 aria-describedby 关联错误提示
- 模态框添加 aria-modal="true"

---

## 3. 实施任务

### Task 1: 配色统一
- [ ] 修复 Button.tsx 颜色变量
- [ ] 修复 CustomDropdown.tsx 颜色变量
- [ ] 修复 ReportContent.tsx 硬编码颜色
- [ ] 检查并修复其他文件硬编码颜色

### Task 2: 交互动效
- [ ] 为 Button 组件添加完整状态样式
- [ ] 为 CustomDropdown 增强 focus 状态
- [ ] 为 BirthForm inputs 增强 focus 状态
- [ ] 添加 hover-lift-fast 变体

### Task 3: 信息分层
- [ ] 雷达图默认折叠（Accordion defaultOpen={false} 已设置，确认即可）
- [ ] 命盘解读第一项默认展开
- [ ] 页面加载时内容分步渐入

### Task 4: 空状态增强
- [ ] CustomDropdown 无选项状态
- [ ] 表单提交加载状态
- [ ] 表单提交成功/失败 toast 反馈

### Task 5: 无障碍增强
- [ ] 修复文字对比度变量
- [ ] 统一 focus ring 样式
- [ ] 添加图标按钮 aria-label

### Task 6: 全局样式审查
- [ ] 审查 globals.css 中是否有遗漏的硬编码颜色
- [ ] 确认所有 CSS 变量正确定义

---

## 4. 验收标准

1. **颜色一致性** - 所有颜色使用 CSS 变量，无硬编码
2. **交互反馈** - 所有可交互元素有明确的 hover/focus/active 状态
3. **信息层次** - 报告页内容有清晰的信息层次，用户可选择性阅读
4. **空状态** - 所有列表/下拉框有空状态处理
5. **无障碍** - 对比度满足 WCAG AA，焦点状态清晰
