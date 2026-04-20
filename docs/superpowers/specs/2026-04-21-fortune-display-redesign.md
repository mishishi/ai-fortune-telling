# 命理报告展示界面设计规范

> **目标：** 将 AI 算命应用的命理报告展示从当前紫色宇宙风升级为东方命理奢华美学

---

## 设计方向

| 维度 | 选择 | 说明 |
|------|------|------|
| 配色 | 朱砂方案 | 朱红 `#c41e3a` + 藏青 + 金色 `#d4af37`，中国传统色谱 |
| 装饰 | 完整仪式感 | 书法笔画 + 金色分割线 + 水墨纹理 + 印章感 |
| 布局 | 对比+呼吸 | 大字标题「命✦运」+ 大量留白 + 渐变分割线 |
| 动效 | 神秘光效 | 光晕脉动 + 星辰闪烁 + 呼吸发光 |

---

## 配色方案

### 主色板

```css
--color-cinnabar: #c41e3a;        /* 朱红 - 主强调色 */
--color-cinnabar-light: #ff6b6b;  /* 浅朱红 */
--color-gold: #d4af37;            /* 金色 - 标题/装饰 */
--color-gold-muted: #8b6914;      /* 暗金 */
--color-navy: #0f0f1a;            /* 墨蓝 - 深色背景 */
--color-navy-light: #1a1525;      /* 浅墨蓝 */
```

### 功能色板

```css
--color-dimension-career: #c41e3a;   /* 事业 - 朱红 */
--color-dimension-love: #6b5b95;     /* 感情 - 藏青紫 */
--color-dimension-wealth: #d4af37;   /* 财运 - 金色 */
--color-dimension-health: #2d6a4f;   /* 健康 - 墨绿 */
--color-dimension-mentor: #1e3a5f;  /* 贵人 - 深蓝 */
```

### 背景层次

```css
--bg-primary: #0f0f1a;      /* 主背景 - 深墨蓝 */
--bg-secondary: #1a1525;    /* 卡片背景 - 浅墨蓝 */
--bg-glass: rgba(26, 31, 58, 0.4); /* 玻璃态 */
```

---

## 装饰元素

### 书法笔画装饰
- 使用 SVG 曲线模拟毛笔走势
- 金色渐变 (`#d4af37` → `#f5e6c4` → `#d4af37`)
- 用于标题下方和分割线

### 金色分割线
```css
background: linear-gradient(90deg, transparent, #d4af37, transparent);
height: 1px;
```

### 水墨晕染背景
- SVG 径向渐变模拟水墨在宣纸上的晕染
- 位置：卡片/模块角落

### 完整仪式感组合
1. 标题：毛笔笔画底纹 + 金色渐变文字
2. 分割线：金色渐变横线
3. 角落：水墨晕染光效
4. 符号：✦ ◈ ◇ 等点缀

---

## 布局结构：「对比+呼吸」

### 八字命盘展示 (BaziRing)
- 中心：`日` 支大字 (如 "子"、"丑")
- 四象限：年、月、日、时 柱
- 五行配色对应关系
- 外环：装饰性虚线 + 微弱呼吸光晕

### 命局总评区块
```
     命
    ✦
     运
────────── (金色渐变分割线)
命主如龙，腾云驾雾...
```

### 分区设计
- 各维度（事业、感情、财运、健康）分块清晰
- 大量留白 (padding: 20-30px)
- 圆角卡片 + 微妙边框光晕

---

## 动效设计：「神秘光效」

### 光晕脉动
```css
@keyframes glowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
/* 用于外环光晕、选中态 */
```

### 星辰闪烁
```css
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
/* 用于装饰符号 ✦ ◈ 等 */
```

### 渐入动画
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 用于标签依次渐入 */
```

---

## 组件改造清单

### 1. BaziRing.tsx
- 外环光晕颜色改为 `rgba(196,30,58,0.15)`
- 文字颜色调整为金色系
- 添加水墨晕染角落效果

### 2. FortuneDisplay.tsx
- 玻璃态卡片加金色边框
- 标题「命局总评」使用书法风格
- 展开收起动画配合光晕

### 3. globals.css
- 添加朱砂配色 CSS 变量
- 添加书法笔画 SVG 装饰
- 添加水墨晕染工具类

---

## 实现优先级

1. **P0** - 配色变量 + 全局样式
2. **P0** - BaziRing 改色 + 光晕效果
3. **P1** - FortuneDisplay 玻璃态 + 边框
4. **P1** - 装饰元素（书法笔画、分割线）
5. **P2** - 动效微调

---

## 参考文件

- `src/components/BaziRing.tsx` - 八字环组件
- `src/components/FortuneDisplay.tsx` - 命理报告显示
- `src/app/globals.css` - 全局样式
