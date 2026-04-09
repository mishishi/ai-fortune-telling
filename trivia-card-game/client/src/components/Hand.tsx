import React from 'react';
import { Card } from './Card';

// 复用 server/src/types/game.ts 的数据
// 由于是 monorepo，可以直接从 server 目录导入
// 或者在 client 中重新定义一份（保持独立）
const SUBJECT_CARDS = [
  { id: 'sub_yuwen',    name: '语文',   color: '#ff6b6b', icon: '📜' },
  { id: 'sub_math',     name: '数学',   color: '#4ecdc4', icon: '📐' },
  { id: 'sub_english',  name: '英语',   color: '#a8e6cf', icon: '🔤' },
  { id: 'sub_science',  name: '科学',   color: '#f7dc6f', icon: '🔬' },
  { id: 'sub_history',  name: '历史',   color: '#bb8fce', icon: '📜' },
  { id: 'sub_geography',name: '地理',   color: '#86b3d1', icon: '🌍' },
  { id: 'sub_biology',  name: '生物',   color: '#82e0aa', icon: '🧬' },
  { id: 'sub_daofa',    name: '道法',   color: '#f1948a', icon: '⚖️'  },
];

const LEVEL_CARDS = [
  { id: 'lv_1', name: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', name: 'Lv2', timeLimit: 12 },
  { id: 'lv_3', name: 'Lv3', timeLimit: 10 },
  { id: 'lv_4', name: 'Lv4', timeLimit: 8 },
];

interface HandProps {
  subjectIds: string[];
  levelIds: string[];
  selectedSubject: string | null;
  selectedLevel: string | null;
  onSelectSubject: (id: string) => void;
  onSelectLevel: (id: string) => void;
  disabled?: boolean;
}

export const Hand: React.FC<HandProps> = ({
  subjectIds, levelIds,
  selectedSubject, selectedLevel,
  onSelectSubject, onSelectLevel,
  disabled
}) => {
  // filter(Boolean) removes undefined entries for subject IDs that don't exist in SUBJECT_CARDS.
// The ! assertion is a fallback - filter(Boolean) is the real safeguard.
const subjects = subjectIds.map(id => SUBJECT_CARDS.find(c => c.id === id)!).filter(Boolean);
  const levels = levelIds.map(id => LEVEL_CARDS.find(c => c.id === id)!).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div className="label" style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>
          ▶ 学科卡
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {subjects.map(card => (
            <Card
              key={card.id}
              type="subject"
              name={card.name}
              color={card.color}
              icon={card.icon}
              selected={selectedSubject === card.id}
              onClick={() => onSelectSubject(card.id)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="label" style={{ color: 'var(--neon-yellow)', marginBottom: '8px' }}>
          ▶ 难度卡
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {levels.map(card => (
            <Card
              key={card.id}
              type="level"
              name={card.name}
              color="var(--neon-yellow)"
              icon="⚡"
              selected={selectedLevel === card.id}
              onClick={() => onSelectLevel(card.id)}
              timeLimit={card.timeLimit}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
