'use client';

interface GlowEffectProps {
  color?: string;
  size?: number;
}

export default function GlowEffect({ color = '#d4af37', size = 240 }: GlowEffectProps) {
  return (
    <div
      className="glow-effect is-animating"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        animation: 'pulse 2s ease-in-out infinite',
        pointerEvents: 'none',
      }}
    />
  );
}
