import React, { useEffect, useRef } from 'react';
import { GameLogo, IconPlayer, IconAI } from './Icons';

/* =====================================================
   ANIMATED GRID BACKGROUND
   ===================================================== */
const AnimatedGrid: React.FC = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden',
    background: 'linear-gradient(180deg, #060912 0%, #0a0f1e 50%, #060912 100%)',
  }}>
    {/* Radial glow left */}
    <div style={{
      position: 'absolute', top: '20%', left: '-10%',
      width: '500px', height: '500px',
      background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(40px)',
    }} />
    {/* Radial glow right */}
    <div style={{
      position: 'absolute', bottom: '10%', right: '-5%',
      width: '400px', height: '400px',
      background: 'radial-gradient(circle, rgba(255,0,170,0.07) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(40px)',
    }} />
    {/* Grid lines */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
    }} />
  </div>
);

/* =====================================================
   FLOATING PARTICLES
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

    const colors = ['0,245,255', '255,0,170', '255,230,0', '192,132,252'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
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
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
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
   ===================================================== */
interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  glowColor: string;
  onClick: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ icon, title, subtitle, description, accentColor, glowColor, onClick }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered
          ? `linear-gradient(135deg, rgba(${glowColor},0.12) 0%, rgba(${glowColor},0.05) 100%)`
          : 'rgba(13,18,36,0.7)',
        border: `1.5px solid ${hovered ? accentColor : `rgba(${glowColor},0.25)`}`,
        borderRadius: '20px',
        padding: '36px 32px 28px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        color: accentColor,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        minWidth: '220px',
        boxShadow: hovered
          ? `0 0 30px rgba(${glowColor},0.25), 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
          : '0 8px 32px rgba(0,0,0,0.3)',
        outline: 'none',
      }}
    >
      {/* Animated top line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: hovered ? 0.8 : 0,
        transition: 'opacity 0.3s',
        borderRadius: '2px',
      }} />

      {/* Icon */}
      <div style={{
        width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `rgba(${glowColor},0.1)`,
        borderRadius: '14px',
        border: `1px solid rgba(${glowColor},0.2)`,
        transition: 'all 0.3s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        boxShadow: hovered ? `0 0 20px rgba(${glowColor},0.3)` : 'none',
      }}>
        {icon}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.9rem',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: accentColor,
        textShadow: hovered ? `0 0 20px rgba(${glowColor},0.5)` : 'none',
      }}>
        {title}
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.65rem',
        fontWeight: 400,
        letterSpacing: '2px',
        color: 'rgba(200,208,232,0.6)',
        textTransform: 'uppercase',
      }}>
        {subtitle}
      </div>

      {/* Divider */}
      <div style={{
        width: '40px', height: '1px',
        background: `linear-gradient(90deg, transparent, rgba(${glowColor},0.4), transparent)`,
      }} />

      {/* Description */}
      <div style={{
        fontSize: '0.75rem',
        color: 'rgba(200,208,232,0.5)',
        letterSpacing: '0.5px',
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        {description}
      </div>

      {/* Hover arrow */}
      <div style={{
        position: 'absolute', bottom: '16px', right: '16px',
        opacity: hovered ? 0.8 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'all 0.3s',
        fontSize: '0.8rem',
      }}>
        →
      </div>
    </button>
  );
};

/* =====================================================
   MAIN MODE SELECT COMPONENT
   ===================================================== */
interface ModeSelectProps {
  onSelect: (mode: 'pvp' | 'practice' | 'async') => void;
}

const IconClock: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconBook: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelect }) => {
  const [year] = React.useState(new Date().getFullYear());

  return (
    <div style={{
      position: 'relative', zIndex: 2,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
    }}>
      <AnimatedGrid />
      <Particles />

      {/* Logo */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '20px',
        animation: 'fadeInUp 0.8s ease-out',
      }}>
        {/* Glow behind logo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px', height: '120px',
          background: 'radial-gradient(ellipse, rgba(0,245,255,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
          zIndex: -1,
        }} />
        <div style={{ width: '280px', height: '90px', filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.4))' }}>
          <GameLogo />
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        position: 'relative', zIndex: 3,
        textAlign: 'center', marginBottom: '56px',
        animation: 'fadeInUp 0.8s ease-out 0.15s both',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          letterSpacing: '4px',
          color: 'rgba(0,245,255,0.7)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          CYBERPUNK · KNOWLEDGE BATTLE
        </p>
        <p style={{
          color: 'rgba(200,208,232,0.5)',
          fontSize: '0.75rem',
          letterSpacing: '1px',
        }}>
          先得10分获胜 · 赛季排位等你挑战
        </p>
      </div>

      {/* Mode Cards */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', gap: '24px',
        flexWrap: 'wrap', justifyContent: 'center',
        animation: 'fadeInUp 0.8s ease-out 0.3s both',
      }}>
        <ModeCard
          icon={<IconPlayer />}
          title="快速对战"
          subtitle="PVP · AI对手"
          description="与AI实时对战，先得10分获胜，考验你的知识储备和反应速度"
          accentColor="#00f5ff"
          glowColor="0,245,255"
          onClick={() => onSelect('pvp')}
        />
        <ModeCard
          icon={<IconBook />}
          title="练习模式"
          subtitle="PRACTICE"
          description="自由出题，无压力练习，熟悉各学科题型和难度梯度"
          accentColor="#c084fc"
          glowColor="192,132,252"
          onClick={() => onSelect('practice')}
        />
        <ModeCard
          icon={<IconClock />}
          title="异步对战"
          subtitle="RANKED · 48H"
          description="48小时回合制，排位赛季积分挑战，冲击钻石段位"
          accentColor="#ffe600"
          glowColor="255,230,0"
          onClick={() => onSelect('async')}
        />
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative', zIndex: 3,
        marginTop: '64px',
        textAlign: 'center',
        color: 'rgba(200,208,232,0.2)',
        fontSize: '0.65rem',
        letterSpacing: '2px',
        fontFamily: 'var(--font-display)',
        animation: 'fadeInUp 0.8s ease-out 0.5s both',
      }}>
        TRIVIA CARD GAME · {year}
      </div>
    </div>
  );
};
