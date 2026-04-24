'use client';

import { useState, useEffect, useRef } from 'react';

interface WuXingCompassProps {
  currentDimension?: string;  // 当前分析维度
  completedDimensions: string[];  // 已完成的维度
  size?: number;
}

const WU_XING = [
  { key: 'career', label: '金', element: '事业', angle: 90, color: '#e74c3c' },
  { key: 'love', label: '木', element: '感情', angle: 162, color: '#e91e63' },
  { key: 'wealth', label: '水', element: '财运', angle: 234, color: '#f1c40f' },
  { key: 'health', label: '火', element: '健康', angle: 306, color: '#2ecc71' },
  { key: 'mentor', label: '土', element: '贵人', angle: 18, color: '#3498db' },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export default function WuXingCompass({ currentDimension, completedDimensions = [], size = 200 }: WuXingCompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = outerRadius * 0.35;
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);
  const prevCompletedRef = useRef<string[]>([]);

  // Detect newly completed dimensions for glow burst
  useEffect(() => {
    const prev = prevCompletedRef.current;
    const newCompleted = completedDimensions.find(d => !prev.includes(d));
    if (newCompleted) {
      setRecentlyCompleted(newCompleted);
      const timer = setTimeout(() => setRecentlyCompleted(null), 600);
      return () => clearTimeout(timer);
    }
    prevCompletedRef.current = completedDimensions;
  }, [completedDimensions]);

  // Calculate pointer angle
  const currentWuXing = WU_XING.find(w => w.key === currentDimension);
  const pointerAngle = currentWuXing ? currentWuXing.angle : -1;

  // Generate pointer coordinates
  const pointerLength = outerRadius * 0.5;
  const pointerTip = polarToCartesian(cx, cy, pointerLength, pointerAngle);
  const pointerBase1 = polarToCartesian(cx, cy, pointerLength * 0.3, pointerAngle - 90);
  const pointerBase2 = polarToCartesian(cx, cy, pointerLength * 0.3, pointerAngle + 90);

  // Grid circles
  const gridCircles = [0.33, 0.66, 1].map(scale => (
    <circle
      key={scale}
      cx={cx}
      cy={cy}
      r={innerRadius + (outerRadius - innerRadius) * scale}
      fill="none"
      stroke="rgba(255,255,255,0.08)"
      strokeWidth="1"
    />
  ));

  // Axis lines
  const axisLines = WU_XING.map(dim => {
    const point = polarToCartesian(cx, cy, outerRadius, dim.angle);
    return { x1: cx, y1: cy, x2: point.x, y2: point.y, dim };
  });

  // Wuxing positions with completion glow
  const wuXingNodes = WU_XING.map(dim => {
    const pos = polarToCartesian(cx, cy, outerRadius * 0.85, dim.angle);
    const isCompleted = completedDimensions.includes(dim.key);
    const isRecentlyCompleted = recentlyCompleted === dim.key;
    const isCurrent = currentDimension === dim.key;

    return (
      <g key={dim.key}>
        {/* Completion burst glow */}
        {isRecentlyCompleted && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r="24"
            fill={dim.color}
            opacity="0.6"
            style={{
              animation: 'completionBurst 0.6s ease-out forwards',
            }}
          />
        )}
        {/* Glow effect for completed */}
        {isCompleted && !isRecentlyCompleted && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r="16"
            fill={dim.color}
            opacity="0.3"
            style={{ filter: `blur(4px)` }}
          />
        )}
        {/* Node circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={isCurrent ? 14 : 10}
          fill={isCompleted ? dim.color : 'rgba(255,255,255,0.1)'}
          stroke={dim.color}
          strokeWidth="2"
          style={{
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: isCurrent ? `drop-shadow(0 0 8px ${dim.color})` : 'none',
          }}
        />
        {/* Element label */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isCompleted ? '#fff' : 'rgba(255,255,255,0.5)'}
          fontSize="10"
          fontWeight="bold"
          style={{ transition: 'fill 0.4s ease-out' }}
        >
          {dim.label}
        </text>
      </g>
    );
  });

  // Pointer with inertia overshoot
  const pointer = pointerAngle >= 0 && (
    <g
      style={{
        transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: `${cx}px ${cy}px`,
        transform: `rotate(${pointerAngle}deg)`,
      }}
    >
      <polygon
        points={`${pointerTip.x},${pointerTip.y} ${pointerBase1.x},${pointerBase1.y} ${pointerBase2.x},${pointerBase2.y}`}
        fill="url(#pointerGradient)"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.8))',
        }}
      />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={size} height={size} fill="rgba(26,21,37,0.8)" rx="8" />

      {/* Grid circles */}
      {gridCircles}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Wuxing nodes */}
      {wuXingNodes}

      {/* Pointer */}
      {pointer}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r="8" fill="rgba(212, 175, 55, 0.3)" stroke="#d4af37" strokeWidth="2" />

      {/* CSS Animations */}
      <style>{`
        @keyframes completionBurst {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </svg>
  );
}
