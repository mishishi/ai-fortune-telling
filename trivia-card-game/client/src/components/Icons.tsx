import React from 'react';

/* =====================================================
   TRIVIA CARD GAME — CUSTOM SVG ICON SYSTEM
   All icons: 48×48 viewBox, stroke-based, colorable
   ===================================================== */

/* ---------- SUBJECT ICONS ---------- */

// 语文 — 书法毛笔字「文」，笔触遒劲
export const IconYuwen = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 砚台 */}
    <ellipse cx="8" cy="38" rx="6" ry="3" stroke="currentColor" strokeWidth="1.5"/>
    {/* 墨迹晕染 */}
    <ellipse cx="8" cy="38" rx="3" ry="1.5" fill="currentColor" opacity="0.3"/>
    {/* 毛笔杆 */}
    <line x1="12" y1="8" x2="28" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* 笔锋 */}
    <path d="M28 38C29 40 30 41 30 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 「文」字装饰 */}
    <path d="M20 18L28 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 14L24 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 22L28 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 26L26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* 飞白效果 */}
    <path d="M16 15L18 17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <path d="M30 30L31 32" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// 数学 — 精密圆规与几何线条
export const IconMath = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 圆规脚 */}
    <line x1="12" y1="40" x2="22" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 圆规针脚 */}
    <circle cx="12" cy="40" r="2.5" fill="currentColor"/>
    {/* 圆规画笔脚 */}
    <line x1="22" y1="16" x2="36" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 旋转轴 */}
    <circle cx="22" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    {/* 画出的圆弧 */}
    <circle cx="12" cy="40" r="16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
    {/* 圆心标记 */}
    <circle cx="12" cy="40" r="1" fill="currentColor"/>
    {/* 刻度线 */}
    <line x1="8" y1="32" x2="10" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="36" x2="10" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="40" x2="10" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* π符号 */}
    <line x1="32" y1="10" x2="40" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="34" y1="10" x2="34" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="38" y1="10" x2="38" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// 英语 — 26字母中的「Aa」造型，优雅斜体
export const IconEnglish = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 大写A */}
    <path d="M24 8L34 36H30L27.5 28H20.5L18 36H14L24 8Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
    <line x1="20.5" y1="28" x2="27.5" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 小写a */}
    <ellipse cx="34" cy="26" rx="5" ry="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M34 22V30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    {/* 装饰性引号 */}
    <path d="M12 12L14 8L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 12L20 8L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* 底部分隔线 */}
    <line x1="14" y1="40" x2="40" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 科学 — 原子模型，电子轨道环绕
export const IconScience = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 原子核 */}
    <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="24" r="2" fill="currentColor"/>
    {/* 轨道1 — 水平椭圆 */}
    <ellipse cx="24" cy="24" rx="18" ry="7" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
    {/* 轨道2 — 倾斜椭圆 */}
    <ellipse cx="24" cy="24" rx="18" ry="7" stroke="currentColor" strokeWidth="1.5" opacity="0.7" transform="rotate(60 24 24)"/>
    {/* 轨道3 — 倾斜椭圆 */}
    <ellipse cx="24" cy="24" rx="18" ry="7" stroke="currentColor" strokeWidth="1.5" opacity="0.7" transform="rotate(-60 24 24)"/>
    {/* 电子1 */}
    <circle cx="42" cy="24" r="2.5" fill="currentColor"/>
    {/* 电子2 */}
    <circle cx="13" cy="13.5" r="2.5" fill="currentColor"/>
    {/* 电子3 */}
    <circle cx="13" cy="34.5" r="2.5" fill="currentColor"/>
  </svg>
);

// 历史 — 青铜鼎，镇国之宝，厚重古朴
export const IconHistory = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 鼎身 */}
    <path d="M10 20C10 18 11 16 14 16H34C37 16 38 18 38 20V36C38 38 37 40 34 40H14C11 40 10 38 10 36V20Z" stroke="currentColor" strokeWidth="2.2"/>
    {/* 鼎口沿 */}
    <path d="M8 20H40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* 鼎耳 */}
    <path d="M10 16C10 14 10 12 12 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 16C38 14 38 12 36 12H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 鼎足 */}
    <path d="M16 40V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 40V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M32 40V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* 鼎面纹饰 — 饕餮纹简化 */}
    <path d="M18 26C18 23 20 22 24 22C28 22 30 23 30 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="30" r="2" stroke="currentColor" strokeWidth="1.5"/>
    {/* 横线纹饰 */}
    <line x1="16" y1="34" x2="32" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 地理 — 立体方格地形图，山脉等高线
export const IconGeography = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 圆形外框 */}
    <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2"/>
    {/* 等高线1 — 外层大山 */}
    <path d="M12 30C12 26 16 23 20 22C24 21 28 24 30 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* 等高线2 */}
    <path d="M16 30C16 27 19 25 22 24C25 23 27 26 28 29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* 等高线3 — 峰顶 */}
    <path d="M20 28C20 26 21 25 23 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* 最高峰三角 */}
    <path d="M22 24L25 30H19L22 24Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* 峰顶标记 */}
    <circle cx="23" cy="24" r="1.5" fill="currentColor"/>
    {/* 纬线装饰 */}
    <line x1="5" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="40" y1="24" x2="43" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24" y1="5" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24" y1="40" x2="24" y2="43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* 指北针标记 N */}
    <path d="M38 10L40 14L36 14Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

// 生物 — 细胞剖面图，细胞膜+细胞核+线粒体
export const IconBiology = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 细胞膜 */}
    <ellipse cx="24" cy="24" rx="18" ry="14" stroke="currentColor" strokeWidth="2"/>
    {/* 细胞质纹理 */}
    <ellipse cx="24" cy="24" rx="18" ry="14" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.4"/>
    {/* 细胞核 */}
    <circle cx="24" cy="24" r="7" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="24" r="3" fill="currentColor"/>
    {/* 核糖体点 */}
    <circle cx="18" cy="20" r="1" fill="currentColor" opacity="0.7"/>
    <circle cx="30" cy="20" r="1" fill="currentColor" opacity="0.7"/>
    <circle cx="17" cy="28" r="1" fill="currentColor" opacity="0.7"/>
    <circle cx="31" cy="27" r="1" fill="currentColor" opacity="0.7"/>
    {/* 线粒体1 */}
    <ellipse cx="14" cy="30" rx="4" ry="2" stroke="currentColor" strokeWidth="1.5" transform="rotate(-20 14 30)"/>
    <line x1="11" y1="30" x2="17" y2="30" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    {/* 线粒体2 */}
    <ellipse cx="34" cy="18" rx="4" ry="2" stroke="currentColor" strokeWidth="1.5" transform="rotate(30 34 18)"/>
    <line x1="31" y1="18" x2="37" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    {/* 内质网曲线 */}
    <path d="M32 30C34 32 36 30 38 32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// 道法 — 天平与法槌，代表公平与法治
export const IconDaofa = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 天平横梁 */}
    <line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* 天平支柱 */}
    <line x1="24" y1="18" x2="24" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* 天平底座 */}
    <line x1="16" y1="42" x2="32" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* 天平顶装饰 */}
    <circle cx="24" cy="18" r="2.5" fill="currentColor"/>
    {/* 左托盘 */}
    <line x1="6" y1="18" x2="6" y2="28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M2 28H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 右托盘（略高，表示不平衡以引人注目） */}
    <line x1="42" y1="18" x2="42" y2="26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M38 26H46" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 法槌/木槌 */}
    <rect x="38" y="30" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="41" y1="38" x2="41" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* 「法」字小装饰 */}
    <path d="M10 36L14 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="34" x2="12" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* 装饰天平准星 */}
    <circle cx="24" cy="18" r="1" fill="currentColor"/>
  </svg>
);

/* ---------- SKILL ICONS ---------- */

export const IconHelp = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chat bubble */}
    <path d="M8 12C8 10.9 8.9 10 10 10H38C39.1 10 40 10.9 40 12V30C40 31.1 39.1 32 38 32H20L14 40V32H10C8.9 32 8 31.1 8 30V12Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Dot dot dot */}
    <circle cx="17" cy="21" r="2" fill="currentColor"/>
    <circle cx="24" cy="21" r="2" fill="currentColor"/>
    <circle cx="31" cy="21" r="2" fill="currentColor"/>
    {/* Question mark in bubble */}
    <path d="M20 26C20 24.3 21.3 43 24 43" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="28" r="1.5" fill="currentColor"/>
  </svg>
);

export const IconSwap = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Two arrows swapping */}
    <path d="M10 18H30L24 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 18V26C10 28.2 11.8 30 14 30H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M38 30H18L24 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M38 30V22C38 19.8 36.2 18 34 18H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Swap symbol */}
    <path d="M32 16L36 20M36 20L32 24M36 20H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconDouble = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* "×2" stylized */}
    <text x="8" y="28" fontFamily="Orbitron, monospace" fontSize="16" fontWeight="900" fill="currentColor">×</text>
    <text x="20" y="36" fontFamily="Orbitron, monospace" fontSize="22" fontWeight="900" fill="currentColor">2</text>
    {/* Lightning bolt */}
    <path d="M30 10L18 26H26L22 38L36 20H28L30 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    {/* Stars */}
    <path d="M38 12L39.5 14L41.5 14L40 15.5L40.5 17.5L38 16L35.5 17.5L36 15.5L34.5 14L36.5 14Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

export const IconSkip = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Skip/fast-forward arrow */}
    <path d="M14 12L30 24L14 36V12Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <line x1="34" y1="12" x2="34" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Circle slash (cancel) */}
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
    <line x1="12" y1="36" x2="36" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconBan = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hand blocking */}
    <path d="M14 32V20C14 17.8 15.8 16 18 16H22C24.2 16 26 17.8 26 20V26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 22L30 18C31.5 16.5 33 17 34 18.5L38 24C39.5 26 38.5 28 36.5 29L32 31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Ban circle */}
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2.5"/>
    <line x1="12" y1="36" x2="36" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const IconFirst = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Number 1 with star crown */}
    <line x1="24" y1="16" x2="24" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <line x1="18" y1="24" x2="30" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M14 14L18 8L24 12L30 8L34 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Star below */}
    <path d="M24 38L25.5 41H28L26 43L27 46L24 44L21 46L22 43L20 41H22.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

/* ---------- EVENT ICONS ---------- */

export const IconFlash = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lightning bolt */}
    <path d="M28 8L14 28H24L20 40L36 18H26L28 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Speed lines */}
    <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="26" x2="12" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="40" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="40" y1="30" x2="36" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Timer ring */}
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
  </svg>
);

export const IconCoop = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Two overlapping user icons */}
    {/* Left user */}
    <circle cx="18" cy="16" r="5" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M8 34C8 28.5 12.5 24 18 24C23.5 24 28 28.5 28 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Right user */}
    <circle cx="30" cy="16" r="5" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M20 34C20 28.5 24.5 24 30 24C35.5 24 40 28.5 40 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Plus in middle */}
    <line x1="24" y1="22" x2="24" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="20" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Shared underline */}
    <line x1="14" y1="38" x2="34" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconCombo = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chain links representing combo */}
    <ellipse cx="14" cy="18" rx="6" ry="4" stroke="currentColor" strokeWidth="2.5"/>
    <ellipse cx="26" cy="18" rx="6" ry="4" stroke="currentColor" strokeWidth="2.5"/>
    <ellipse cx="38" cy="18" rx="6" ry="4" stroke="currentColor" strokeWidth="2.5"/>
    {/* Connection bars */}
    <line x1="20" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <line x1="32" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    {/* Second row */}
    <ellipse cx="20" cy="30" rx="6" ry="4" stroke="currentColor" strokeWidth="2.5"/>
    <ellipse cx="32" cy="30" rx="6" ry="4" stroke="currentColor" strokeWidth="2.5"/>
    {/* Stars for "correct" */}
    <path d="M14 36L14.8 37.8L16.8 38L15.4 39.2L15.7 41.2L14 40L12.3 41.2L12.6 39.2L11.2 38L13.2 37.8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M26 36L26.8 37.8L28.8 38L27.4 39.2L27.7 41.2L26 40L24.3 41.2L24.6 39.2L23.2 38L25.2 37.8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

export const IconTeach = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Open book with light rays */}
    <path d="M6 14C6 14 12 12 24 12C36 12 42 14 42 14V34C42 34 36 32 24 32C12 32 6 34 6 34V14Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <line x1="24" y1="12" x2="24" y2="32" stroke="currentColor" strokeWidth="2"/>
    {/* Light bulb above */}
    <circle cx="24" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
    <line x1="24" y1="4" x2="24" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="5" x2="18" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="28" y1="5" x2="30" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Light rays */}
    <line x1="24" y1="14" x2="24" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    <line x1="18" y1="15" x2="15" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    <line x1="30" y1="15" x2="33" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    {/* Text lines in book */}
    <line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="26" x2="18" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="27" y1="18" x2="38" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="27" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="27" y1="26" x2="33" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* ---------- GAME LOGO ---------- */

export const GameLogo = () => (
  <svg viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left card */}
    <g transform="translate(10, 10)">
      <rect width="50" height="65" rx="6" stroke="#00f5ff" strokeWidth="2" fill="rgba(0,245,255,0.05)"/>
      <rect x="3" y="3" width="44" height="59" rx="4" stroke="#00f5ff" strokeWidth="1" fill="none" opacity="0.4"/>
      <text x="25" y="38" fontFamily="Orbitron, monospace" fontSize="20" fontWeight="900" fill="#00f5ff" textAnchor="middle">知</text>
      <text x="25" y="54" fontFamily="Orbitron, monospace" fontSize="10" fill="#00f5ff" textAnchor="middle" opacity="0.6">识</text>
    </g>

    {/* Middle card (center, slightly in front) */}
    <g transform="translate(95, 0)">
      <rect width="50" height="65" rx="6" stroke="#c084fc" strokeWidth="2.5" fill="rgba(192,132,252,0.08)"/>
      <rect x="3" y="3" width="44" height="59" rx="4" stroke="#c084fc" strokeWidth="1" fill="none" opacity="0.4"/>
      <text x="25" y="38" fontFamily="Orbitron, monospace" fontSize="20" fontWeight="900" fill="#c084fc" textAnchor="middle">对</text>
      <text x="25" y="54" fontFamily="Orbitron, monospace" fontSize="10" fill="#c084fc" textAnchor="middle" opacity="0.6">战</text>
    </g>

    {/* Right card */}
    <g transform="translate(180, 10)">
      <rect width="50" height="65" rx="6" stroke="#ff00aa" strokeWidth="2" fill="rgba(255,0,170,0.05)"/>
      <rect x="3" y="3" width="44" height="59" rx="4" stroke="#ff00aa" strokeWidth="1" fill="none" opacity="0.4"/>
      <text x="25" y="38" fontFamily="Orbitron, monospace" fontSize="20" fontWeight="900" fill="#ff00aa" textAnchor="middle">卡</text>
      <text x="25" y="54" fontFamily="Orbitron, monospace" fontSize="10" fill="#ff00aa" textAnchor="middle" opacity="0.6">牌</text>
    </g>

    {/* Connecting lines / circuit traces */}
    <line x1="60" y1="42" x2="95" y2="42" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
    <line x1="145" y1="42" x2="180" y2="42" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>

    {/* Decorative dots at circuit endpoints */}
    <circle cx="60" cy="42" r="2.5" fill="#c084fc" opacity="0.6"/>
    <circle cx="145" cy="42" r="2.5" fill="#c084fc" opacity="0.6"/>
  </svg>
);

export const IconPlayer = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield outline */}
    <path d="M24 6L38 12V24C38 33.94 32.22 42.74 24 46C15.78 42.74 10 33.94 10 24V12L24 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Inner shield */}
    <path d="M24 12L32 16V24C32 30.08 28.62 35.38 24 37.5C19.38 35.38 16 30.08 16 24V16L24 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Person silhouette */}
    <circle cx="24" cy="22" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 34C18 30.7 20.7 28 24 28C27.3 28 30 30.7 30 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconAI = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Robot head */}
    <rect x="10" y="14" width="28" height="24" rx="5" stroke="currentColor" strokeWidth="2.5"/>
    {/* Antenna */}
    <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="24" cy="6" r="2.5" fill="currentColor"/>
    {/* Eyes */}
    <circle cx="18" cy="24" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="30" cy="24" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="24" r="1" fill="currentColor"/>
    <circle cx="30" cy="24" r="1" fill="currentColor"/>
    {/* Mouth */}
    <line x1="18" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="20" y1="32" x2="20" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24" y1="32" x2="24" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="28" y1="32" x2="28" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Ears/bolts */}
    <rect x="6" y="22" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="38" y="22" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/* ---------- CARD TYPE BADGE ICONS ---------- */

export const IconSubject = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="16,8 24,13 24,19 16,24 8,19 8,13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="16" cy="16" r="3" fill="currentColor"/>
  </svg>
);

export const IconSkill = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M16 8L20 14H26L21 18L23 25L16 21L9 25L11 18L6 14H12L16 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const IconEvent = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M18 8L10 20H16L14 26L24 14H18L18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

/* ---------- ICON MAP ---------- */

export const SUBJECT_ICONS: Record<string, React.FC> = {
  sub_yuwen:    IconYuwen,
  sub_math:     IconMath,
  sub_english:  IconEnglish,
  sub_science:  IconScience,
  sub_history:  IconHistory,
  sub_geography:IconGeography,
  sub_biology:  IconBiology,
  sub_daofa:    IconDaofa,
};

export const SKILL_ICONS: Record<string, React.FC> = {
  skill_help:   IconHelp,
  skill_swap:   IconSwap,
  skill_double: IconDouble,
  skill_skip:   IconSkip,
  skill_ban:    IconBan,
  skill_first:  IconFirst,
};

export const EVENT_ICONS: Record<string, React.FC> = {
  event_flash:  IconFlash,
  event_coop:   IconCoop,
  event_combo:  IconCombo,
  event_teach:  IconTeach,
};
