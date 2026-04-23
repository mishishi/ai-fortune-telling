'use client';

interface ParticleEffectProps {
  count?: number;
}

export default function ParticleEffect({ count = 5 }: ParticleEffectProps) {
  return (
    <div
      className="particle-container"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="is-animating particle"
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            background: '#d4af37',
            borderRadius: '50%',
            top: `${10 + Math.random() * 30}%`,
            right: `${10 + Math.random() * 20}%`,
            animation: `shooting-star ${2 + Math.random() * 2}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}
