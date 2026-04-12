import React, { useEffect, useRef } from 'react';
import { GameLogo } from './Icons';

/* =====================================================
   ANIMATED GRID BACKGROUND
   Refined: subtle dot grid with ambient glows
   ===================================================== */
const AnimatedGrid: React.FC = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden',
    background: 'linear-gradient(180deg, #060912 0%, #080b15 50%, #060912 100%)',
  }}>
    {/* Primary ambient glow - cyan */}
    <div style={{
      position: 'absolute', top: '15%', left: '20%',
      width: '600px', height: '400px',
      background: 'radial-gradient(ellipse, rgba(0, 229, 255, 0.06) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(60px)',
    }} />
    {/* Secondary ambient glow - pink */}
    <div style={{
      position: 'absolute', bottom: '20%', right: '15%',
      width: '500px', height: '350px',
      background: 'radial-gradient(ellipse, rgba(255, 45, 149, 0.05) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(60px)',
    }} />
    {/* Subtle purple accent */}
    <div style={{
      position: 'absolute', top: '60%', left: '10%',
      width: '300px', height: '300px',
      background: 'radial-gradient(circle, rgba(184, 127, 255, 0.04) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(40px)',
    }} />
  </div>
);

/* =====================================================
   FLOATING PARTICLES
   Minimal, elegant particle system
   ===================================================== */
const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }> = [];

    const colors = ['0, 229, 255', '255, 45, 149', '255, 224, 102'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
    }} />
  );
};

/* =====================================================
   MODE CARD
   Refined: clean, minimal, elegant hover states
   ===================================================== */
interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  glowRgb: string;
  onClick: () => void;
  delay: number;
}

const ModeCard: React.FC<ModeCardProps> = ({
  icon, title, subtitle, description, accentColor, glowRgb, onClick, delay
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-in-up"
      style={{
        animationDelay: `${delay}s`,
        position: 'relative',
        background: hovered
          ? `linear-gradient(145deg, rgba(${glowRgb},0.1) 0%, rgba(${glowRgb},0.03) 100%)`
          : 'rgba(10, 15, 28, 0.8)',
        border: `1px solid ${hovered ? accentColor : `rgba(${glowRgb},0.2)`}`,
        borderRadius: '16px',
        padding: '32px 28px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: accentColor,
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        width: '220px',
        minHeight: '280px',
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.4), 0 0 30px rgba(${glowRgb},0.15)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${accentColor} 50%, transparent)`,
        opacity: hovered ? 0.8 : 0,
        transition: 'opacity 0.35s',
      }} />

      {/* Icon container */}
      <div style={{
        width: '56px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `rgba(${glowRgb},0.08)`,
        borderRadius: '14px',
        border: `1px solid rgba(${glowRgb},0.15)`,
        transition: 'all 0.35s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        color: accentColor,
      }}>
        {icon}
      </div>

      {/* Title block */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: accentColor,
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.62rem',
          fontWeight: 500,
          letterSpacing: '2px',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}>
          {subtitle}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: '32px', height: '1px',
        background: `linear-gradient(90deg, transparent, rgba(${glowRgb},0.3), transparent)`,
        transition: 'all 0.35s',
        transform: hovered ? 'scaleX(1.5)' : 'scaleX(1)',
      }} />

      {/* Description */}
      <div style={{
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 1.5,
        textAlign: 'center',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {description}
      </div>
    </button>
  );
};

/* =====================================================
   ICONS
   ===================================================== */
const IconPlayer: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconClock: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconBook: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

/* =====================================================
   MAIN MODE SELECT COMPONENT
   ===================================================== */
interface ModeSelectProps {
  onSelect: (mode: 'pvp' | 'practice' | 'async') => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelect }) => {
  const [year] = React.useState(new Date().getFullYear());

  return (
    <div style={{
      position: 'relative', zIndex: 2,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      padding: '48px 24px',
    }}>
      <AnimatedGrid />
      <Particles />

      {/* Logo section */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '20px',
      }}>
        {/* Ambient glow behind logo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px', height: '280px',
          background: 'radial-gradient(ellipse, rgba(184, 127, 255, 0.08) 0%, rgba(0, 229, 255, 0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: -1,
        }} />

        <div
          className="animate-fade-in-up"
          style={{ width: '420px', maxWidth: '90vw' }}
        >
          <GameLogo />
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        position: 'relative', zIndex: 3,
        textAlign: 'center', marginBottom: '56px',
      }}>
        <p className="animate-fade-in-up delay-1" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.72rem',
          letterSpacing: '4px',
          color: 'rgba(0, 229, 255, 0.6)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          Cyberpunk · Knowledge Battle
        </p>
        <p className="animate-fade-in-up delay-2" style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.82rem',
          letterSpacing: '0.5px',
        }}>
          先得10分获胜 · 赛季排位等你挑战
        </p>
      </div>

      {/* Mode Cards */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', gap: '20px',
        flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'stretch',
      }}>
        <ModeCard
          icon={<IconPlayer />}
          title="快速对战"
          subtitle="PVP · AI对手"
          description="与AI实时对战，先得10分获胜，考验你的知识储备和反应速度"
          accentColor="#00e5ff"
          glowRgb="0, 229, 255"
          onClick={() => onSelect('pvp')}
          delay={0.3}
        />
        <ModeCard
          icon={<IconBook />}
          title="练习模式"
          subtitle="Practice"
          description="自由出题，无压力练习，熟悉各学科题型和难度梯度"
          accentColor="#b87fff"
          glowRgb="184, 127, 255"
          onClick={() => onSelect('practice')}
          delay={0.4}
        />
        <ModeCard
          icon={<IconClock />}
          title="异步对战"
          subtitle="Ranked · 48H"
          description="48小时回合制，排位赛季积分挑战，冲击钻石段位"
          accentColor="#ffe066"
          glowRgb="255, 224, 102"
          onClick={() => onSelect('async')}
          delay={0.5}
        />
      </div>

      {/* Footer */}
      <div className="animate-fade-in-up delay-5" style={{
        position: 'relative', zIndex: 3,
        marginTop: '64px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.15)',
        fontSize: '0.65rem',
        letterSpacing: '3px',
        fontFamily: 'var(--font-display)',
      }}>
        Trivia Card Game · {year}
      </div>
    </div>
  );
};
