import React from 'react';
import { SUBJECT_ICONS, SKILL_ICONS, EVENT_ICONS } from './Icons';

interface CardProps {
  type: 'subject' | 'level' | 'skill' | 'event';
  name: string;
  color: string;
  /** pass empty string '' when using subjectId/skillId/eventId (SVG icon is rendered by those IDs) */
  icon: string;
  subjectId?: string;
  skillId?: string;
  eventId?: string;
  levelId?: string;
  selected?: boolean;
  timeLimit?: number;
  onClick?: () => void;
  disabled?: boolean;
  description?: string;
}

const TYPE_META: Record<string, { accentColor: string; glowRgb: string }> = {
  subject: { accentColor: '#00e5ff', glowRgb: '0, 229, 255' },
  skill:   { accentColor: '#b87fff', glowRgb: '184, 127, 255' },
  event:   { accentColor: '#ff2d95', glowRgb: '255, 45, 149' },
  level:   { accentColor: '#ffe066', glowRgb: '255, 224, 102' },
};

/* Difficulty bars — 1–4 bars, each level lights up more */
const DifficultyBars: React.FC<{ level: number; color: string }> = ({ level, color }) => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
    {[1, 2, 3, 4].map(i => (
      <rect
        key={i}
        x={(i - 1) * 9}
        y={28 - i * 7}
        width="6"
        height={i * 7 - 4}
        rx="2"
        fill={i <= level ? color : 'transparent'}
        stroke={i <= level ? color : 'rgba(255,255,255,0.15)'}
        strokeWidth="1.2"
        opacity={i <= level ? 1 : 0.3}
        style={{
          filter: i <= level ? `drop-shadow(0 0 4px ${color})` : 'none',
          transition: 'all 0.3s ease',
        }}
      />
    ))}
  </svg>
);

function CardIcon({ type, subjectId, skillId, eventId, levelId }: Pick<CardProps, 'type' | 'subjectId' | 'skillId' | 'eventId'> & { levelId?: string }) {
  if (type === 'subject' && subjectId) {
    const Comp = SUBJECT_ICONS[subjectId];
    return Comp ? <Comp /> : null;
  }
  if (type === 'skill' && skillId) {
    const Comp = SKILL_ICONS[skillId];
    return Comp ? <Comp /> : null;
  }
  if (type === 'event' && eventId) {
    const Comp = EVENT_ICONS[eventId];
    return Comp ? <Comp /> : null;
  }
  if (type === 'level' && levelId) {
    const lvNum = parseInt(levelId.replace('lv_', ''), 10);
    if (!isNaN(lvNum)) return <DifficultyBars level={lvNum} color={TYPE_META.level.accentColor} />;
  }
  return null;
}

export const Card: React.FC<CardProps> = ({
  type, name, icon, subjectId, skillId, eventId, levelId,
  selected, timeLimit, onClick, disabled, description
}) => {
  const meta = TYPE_META[type] || TYPE_META.subject;

  return (
    <div
      className={`h-card ${type}-card${selected ? ' h-selected' : ''}${disabled ? ' h-disabled' : ''}`}
      style={{
        '--card-accent': meta.accentColor,
        '--card-glow-rgb': meta.glowRgb,
      } as React.CSSProperties}
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-pressed={selected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Corner brackets */}
      <div className="h-card__corner h-card__corner--tl" />
      <div className="h-card__corner h-card__corner--tr" />
      <div className="h-card__corner h-card__corner--bl" />
      <div className="h-card__corner h-card__corner--br" />

      {/* Icon with pulse ring */}
      <div className="h-card__icon-wrap" aria-hidden="true">
        <span className="ring" />
        <CardIcon type={type} subjectId={subjectId} skillId={skillId} eventId={eventId} levelId={levelId} />
      </div>

      {/* Fallback icon text (only when no SVG ID) */}
      {icon && !subjectId && !skillId && !eventId && (
        <div className="h-card__icon-fallback">{icon}</div>
      )}

      {/* Name */}
      <div className="h-card__name">
        {name}
      </div>

      {/* Timer pill */}
      {timeLimit !== undefined && (
        <div className="h-card__timer">
          <span>⏱</span>
          <span>{timeLimit}s</span>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="h-card__desc">{description}</div>
      )}
    </div>
  );
};
