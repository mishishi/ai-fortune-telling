import React from 'react';
import { Card } from './Card';

const SUBJECT_CARDS = [
  { id: 'sub_yuwen',    name: '语文',   color: '#00e5e5', icon: '📜' },
  { id: 'sub_math',     name: '数学',   color: '#00c9a7', icon: '📐' },
  { id: 'sub_english',  name: '英语',   color: '#7bed9f', icon: '🔤' },
  { id: 'sub_science',  name: '科学',   color: '#ffd93d', icon: '🔬' },
  { id: 'sub_history',  name: '历史',   color: '#c97bff', icon: '📚' },
  { id: 'sub_geography',name: '地理',   color: '#74b9ff', icon: '🌍' },
  { id: 'sub_biology',  name: '生物',   color: '#55efc4', icon: '🧬' },
  { id: 'sub_daofa',    name: '道法',   color: '#fd79a8', icon: '⚖️'  },
];

const LEVEL_CARDS = [
  { id: 'lv_1', name: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', name: 'Lv2', timeLimit: 25 },
  { id: 'lv_3', name: 'Lv3', timeLimit: 35 },
  { id: 'lv_4', name: 'Lv4', timeLimit: 45 },
];

const SKILL_CARDS = [
  { id: 'skill_help',    name: '求助',   description: 'AI给出提示（不说答案），本轮有效' },
  { id: 'skill_swap',   name: '换题',   description: '本轮作废，重出同难度题' },
  { id: 'skill_double', name: '双倍',   description: '本轮答对得2分' },
  { id: 'skill_skip',   name: '跳过',   description: '跳过本轮，直接结束回合' },
  { id: 'skill_ban',    name: '禁手',   description: '对方本回合不能使用技能' },
  { id: 'skill_first',  name: '先手',   description: '本轮由你先答题' },
];

const EVENT_CARDS = [
  { id: 'event_flash',   name: '闪电快答', description: '必须在10秒内答完' },
  { id: 'event_coop',    name: '双人合作', description: '两人各答一题，都对各+1' },
  { id: 'event_combo',   name: '知识连击', description: '必须连续答对2题才能得分' },
  { id: 'event_teach',   name: '错题讲堂', description: '答错后AI详细讲解' },
];

interface HandProps {
  hand: Array<{
    cardType: 'subject_level' | 'skill' | 'event';
    subjectId?: string;
    levelId?: string;
    skillId?: string;
    eventId?: string;
  }>;
  selectedIndex: number | null;
  onSelectCard: (index: number) => void;
  onUseSkill: (index: number) => void;
  disabled?: boolean;
}

export const Hand: React.FC<HandProps> = ({
  hand = [], selectedIndex, onSelectCard, onUseSkill, disabled
}) => {
  const getCardInfo = (card: HandProps['hand'][0]) => {
    if (card.cardType === 'skill') {
      const skill = SKILL_CARDS.find(s => s.id === card.skillId);
      return {
        type: 'skill' as const,
        name: skill?.name ?? '',
        color: '#c084fc',
        icon: skill?.name ?? '',
        subjectId: undefined,
        skillId: card.skillId,
        eventId: undefined,
        description: skill?.description,
      };
    }
    if (card.cardType === 'event') {
      const event = EVENT_CARDS.find(e => e.id === card.eventId);
      return {
        type: 'event' as const,
        name: event?.name ?? '',
        color: '#ff00aa',
        icon: event?.name ?? '',
        subjectId: undefined,
        skillId: undefined,
        eventId: card.eventId,
        description: event?.description,
      };
    }
    // subject_level
    const sub = SUBJECT_CARDS.find(c => c.id === card.subjectId);
    const lv = LEVEL_CARDS.find(c => c.id === card.levelId);
    return {
      type: 'subject' as const,
      name: `${sub?.name} ${lv?.name}`,
      color: sub?.color ?? '#00f5ff',
      icon: '',
      subjectId: card.subjectId,
      skillId: undefined,
      eventId: undefined,
      timeLimit: lv?.timeLimit,
    };
  };

  return (
    <div>
      <div className="hand-label">选择出牌</div>
      <div className="hand-cards">
        {hand.map((card, idx) => {
          const info = getCardInfo(card);
          const isSelected = selectedIndex === idx;

          return (
            <div key={`card_${idx}`}>
              <Card
                type={info.type}
                name={info.name}
                color={info.color}
                icon={info.icon}
                subjectId={info.subjectId}
                skillId={info.skillId}
                eventId={info.eventId}
                selected={isSelected}
                disabled={disabled}
                timeLimit={info.timeLimit}
                description={info.description}
                onClick={() => {
                  if (card.cardType === 'skill') {
                    onUseSkill(idx);
                  } else {
                    onSelectCard(idx);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
