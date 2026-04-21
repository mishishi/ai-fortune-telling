'use client';

import { useState, useEffect } from 'react';

interface Pillar {
  stem: string;
  branch: string;
  element: string;
}

interface BaziRingProps {
  birthData: {
    yearPillar: Pillar;
    monthPillar: Pillar;
    dayPillar: Pillar;
    hourPillar: Pillar;
  };
  size?: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: '#4ade80',
  fire: '#f87171',
  earth: '#fbbf24',
  metal: '#60a5fa',
  water: '#a78bfa',
};

// Ring segment configuration (Option C design)
const RING_SEGMENTS = [
  { position: 'top-right', angle: 0 },      // Segment 1: top-right quadrant
  { position: 'bottom-right', angle: 90 },  // Segment 2: bottom-right
  { position: 'bottom-left', angle: 180 },  // Segment 3: bottom-left
  { position: 'top-left', angle: 270 },     // Segment 4: top-left
];

export default function BaziRing({ birthData, size = 280 }: BaziRingProps) {
  const [effectiveSize, setEffectiveSize] = useState(280);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const getEffectiveSize = () => {
      if (window.innerWidth < 480) return 180;  // mobile
      if (window.innerWidth < 768) return 220;  // tablet
      return size;                               // desktop
    };
    const updateSize = () => {
      setEffectiveSize(getEffectiveSize());
      setIsMobile(window.innerWidth < 480);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  const center = effectiveSize / 2;
  const ringRadius = effectiveSize * 0.35;
  const segmentThickness = effectiveSize * 0.12;
  const innerRadius = ringRadius - segmentThickness;

  // Get all pillars for labels
  const pillars = [
    { key: 'year', label: '年', data: birthData.yearPillar, color: ELEMENT_COLORS[birthData.yearPillar.element] },
    { key: 'month', label: '月', data: birthData.monthPillar, color: ELEMENT_COLORS[birthData.monthPillar.element] },
    { key: 'day', label: '日', data: birthData.dayPillar, color: ELEMENT_COLORS[birthData.dayPillar.element] },
    { key: 'hour', label: '时', data: birthData.hourPillar, color: ELEMENT_COLORS[birthData.hourPillar.element] },
  ];

  // Day pillar branch (center text)
  const dayBranch = birthData.dayPillar.branch;

  // Helper to create arc path for a quadrant
  const createQuadrantPath = (startAngle: number, endAngle: number, r: number, inner: boolean) => {
    const start = inner ? { x: center + innerRadius * Math.cos(startAngle * Math.PI / 180), y: center + innerRadius * Math.sin(startAngle * Math.PI / 180) } : { x: center + r * Math.cos(startAngle * Math.PI / 180), y: center + r * Math.sin(startAngle * Math.PI / 180) };
    const end = inner ? { x: center + innerRadius * Math.cos(endAngle * Math.PI / 180), y: center + innerRadius * Math.sin(endAngle * Math.PI / 180) } : { x: center + r * Math.cos(endAngle * Math.PI / 180), y: center + r * Math.sin(endAngle * Math.PI / 180) };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    if (inner) {
      return `M ${start.x} ${start.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${end.x} ${end.y} L ${center + ringRadius * Math.cos(endAngle * Math.PI / 180)} ${center + ringRadius * Math.sin(endAngle * Math.PI / 180)} A ${ringRadius} ${ringRadius} 0 ${largeArc} 0 ${center + ringRadius * Math.cos(startAngle * Math.PI / 180)} ${center + ringRadius * Math.sin(startAngle * Math.PI / 180)} Z`;
    }
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <>
      <style jsx>{`
        @keyframes ringExpand {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-ring-in {
          animation: ringExpand 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-label-in {
          opacity: 0;
          animation: fadeIn 400ms ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center relative">
        {/* Outer glow effect */}
        <div
          className="absolute rounded-full glow-pulse"
          style={{
            width: effectiveSize + 60,
            height: effectiveSize + 60,
            top: -30,
            left: -30,
            background: `radial-gradient(circle, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Ring SVG */}
        <div className="relative">
          <svg
          width={effectiveSize}
          height={effectiveSize}
          viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
          className="animate-ring-in"
          style={{ filter: `drop-shadow(0 0 20px color-mix(in srgb, var(--color-accent) 30%, transparent))` }}
        >
          {/* Decorative outer ring - dashed */}
          <circle
            cx={center}
            cy={center}
            r={ringRadius + 15}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-spin glow-pulse"
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* Ring segments (4 quadrants with pillar elements) */}
          {/* Top-right quadrant: Year */}
          <path
            d={createQuadrantPath(0, 90, ringRadius, true)}
            fill={`${pillars[0].color}20`}
            stroke={pillars[0].color}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 6px ${pillars[0].color})` }}
          />
          {/* Bottom-right quadrant: Month */}
          <path
            d={createQuadrantPath(90, 180, ringRadius, true)}
            fill={`${pillars[1].color}20`}
            stroke={pillars[1].color}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 6px ${pillars[1].color})` }}
          />
          {/* Bottom-left quadrant: Day */}
          <path
            d={createQuadrantPath(180, 270, ringRadius, true)}
            fill={`${pillars[2].color}20`}
            stroke={pillars[2].color}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 6px ${pillars[2].color})` }}
          />
          {/* Top-left quadrant: Hour */}
          <path
            d={createQuadrantPath(270, 360, ringRadius, true)}
            fill={`${pillars[3].color}20`}
            stroke={pillars[3].color}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 6px ${pillars[3].color})` }}
          />

          {/* Outer ring border */}
          <circle
            cx={center}
            cy={center}
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {/* Inner ring border */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="rgba(10,14,39,0.98)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          
          {/* Small decorative symbols at cardinal points */}
          {effectiveSize > 220 && (
            <>
              {/* ☯ at top */}
              <text
                x={center}
                y={center - ringRadius - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize={10}
              >
                ☯
              </text>
              {/* ✦ at bottom */}
              <text
                x={center}
                y={center + ringRadius + 18}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize={10}
              >
                ✦
              </text>
            </>
          )}

          {/* Pillar stems at quadrant positions - hidden when ring size <= 180 (mobile only) */}
          {effectiveSize > 180 && (
            <>
              {/* Year (top-right, at 45°) */}
              <text
                x={center + ringRadius * 0.7}
                y={center - ringRadius * 0.7 + 8}
                textAnchor="middle"
                fill={pillars[0].color}
                fontSize={effectiveSize > 220 ? 14 : 12}
                fontWeight="bold"
                style={{ filter: `drop-shadow(0 0 4px ${pillars[0].color})` }}
              >
                {birthData.yearPillar.stem}
              </text>

              {/* Month (bottom-right, at 135°) */}
              <text
                x={center + ringRadius * 0.7}
                y={center + ringRadius * 0.7 + 8}
                textAnchor="middle"
                fill={pillars[1].color}
                fontSize={effectiveSize > 220 ? 14 : 12}
                fontWeight="bold"
                style={{ filter: `drop-shadow(0 0 4px ${pillars[1].color})` }}
              >
                {birthData.monthPillar.stem}
              </text>

              {/* Day (bottom-left, at 225°) */}
              <text
                x={center - ringRadius * 0.7}
                y={center + ringRadius * 0.7 + 8}
                textAnchor="middle"
                fill={pillars[2].color}
                fontSize={effectiveSize > 220 ? 14 : 12}
                fontWeight="bold"
                style={{ filter: `drop-shadow(0 0 4px ${pillars[2].color})` }}
              >
                {birthData.dayPillar.stem}
              </text>

              {/* Hour (top-left, at 315°) */}
              <text
                x={center - ringRadius * 0.7}
                y={center - ringRadius * 0.7 + 8}
                textAnchor="middle"
                fill={pillars[3].color}
                fontSize={effectiveSize > 220 ? 14 : 12}
                fontWeight="bold"
                style={{ filter: `drop-shadow(0 0 4px ${pillars[3].color})` }}
              >
                {birthData.hourPillar.stem}
              </text>
            </>
          )}
        </svg>

        {/* Center text: Day Branch (地支) */}
        <span
          className="absolute text-h2 font-bold"
          style={{
            color: 'var(--color-accent)',
            textShadow: '0 0 30px color-mix(in srgb, var(--color-accent) 80%, transparent)',
            filter: 'drop-shadow(0 0 10px color-mix(in srgb, var(--color-accent) 50%, transparent))',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          {dayBranch}
        </span>
        </div>

        {/* Labels below the ring */}
        {isMobile ? (
          // 2x2 grid layout for mobile (<480px)
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-6">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.key}
                className="text-center animate-label-in"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <div
                  className="text-base font-bold"
                  style={{
                    color: pillar.color,
                    textShadow: `0 0 10px ${pillar.color}50`,
                  }}
                >
                  {pillar.label}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {pillar.data.stem}{pillar.data.branch}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 4-column row for tablet/desktop
          <div className="flex justify-around w-full max-w-md mt-6">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.key}
                className="text-center animate-label-in"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <div
                  className="text-base font-bold"
                  style={{
                    color: pillar.color,
                    textShadow: `0 0 10px ${pillar.color}50`,
                  }}
                >
                  {pillar.label}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {pillar.data.stem}{pillar.data.branch}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export type { BaziRingProps, Pillar };
