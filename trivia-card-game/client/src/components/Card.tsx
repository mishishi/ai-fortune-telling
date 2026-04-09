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
  selected?: boolean;
  timeLimit?: number;
  onClick?: () => void;
  disabled?: boolean;
  description?: string;
}

const TYPE_META: Record<string, { accentColor: string }> = {
  subject: { accentColor: '#00f5ff' },
  skill:   { accentColor: '#c084fc' },
  event:   { accentColor: '#ff00aa' },
  level:   { accentColor: '#ffe600' },
};

function CardIcon({ type, subjectId, skillId, eventId }: Pick<CardProps, 'type' | 'subjectId' | 'skillId' | 'eventId'>) {
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
  return null;
}

export const Card: React.FC<CardProps> = ({
  type, name, color, icon, subjectId, skillId, eventId,
  selected, timeLimit, onClick, disabled, description
}) => {
  const meta = TYPE_META[type] || TYPE_META.subject;

  return (
    <div
      className={`h-card ${type}-card${selected ? ' h-selected' : ''}${disabled ? ' h-disabled' : ''}`}
      style={{ '--card-accent': meta.accentColor, '--card-glow': `${meta.accentColor}60` } as React.CSSProperties}
      onClick={disabled ? undefined : onClick}
    >
      {/* Dot-matrix background */}
      <div className="h-card__dots" aria-hidden="true" />

      {/* Colored strip */}
      <div className="h-card__strip" style={{ background: meta.accentColor }} />

      {/* Type badge (hexagon) */}
      <div className="h-card__badge" style={{ background: meta.accentColor }} aria-hidden="true" />

      {/* Corner brackets */}
      <div className="h-card__corner h-card__corner--tl" aria-hidden="true" />
      <div className="h-card__corner h-card__corner--tr" aria-hidden="true" />
      <div className="h-card__corner h-card__corner--bl" aria-hidden="true" />
      <div className="h-card__corner h-card__corner--br" aria-hidden="true" />

      {/* Shimmer */}
      <div className="h-card__shimmer" aria-hidden="true" />

      {/* SVG Icon — always rendered via ID lookup, not the icon prop */}
      <div className="h-card__icon-wrap" aria-hidden="true">
        <CardIcon type={type} subjectId={subjectId} skillId={skillId} eventId={eventId} />
      </div>

      {/* Fallback icon text (only when no SVG ID) */}
      {icon && !subjectId && !skillId && !eventId && (
        <div className="h-card__icon-fallback">{icon}</div>
      )}

      {/* Name — split subject from level */}
      <div className="h-card__name" style={{ color: meta.accentColor }}>
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

      {/* Bottom glyph */}
      <div className="h-card__glyph" aria-hidden="true" />
    </div>
  );
};
