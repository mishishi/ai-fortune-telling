import React from 'react';
import { Card } from './Card';

const SUBJECT_CARDS = [
  { id: 'sub_yuwen',    name: '语文',   color: '#ff6b6b', icon: '📜' },
  { id: 'sub_math',     name: '数学',   color: '#4ecdc4', icon: '📐' },
  { id: 'sub_english',  name: '英语',   color: '#a8e6cf', icon: '🔤' },
  { id: 'sub_science',  name: '科学',   color: '#f7dc6f', icon: '🔬' },
  { id: 'sub_history',  name: '历史',   color: '#bb8fce', icon: '📚' },
  { id: 'sub_geography',name: '地理',   color: '#86b3d1', icon: '🌍' },
  { id: 'sub_biology',  name: '生物',   color: '#82e0aa', icon: '🧬' },
  { id: 'sub_daofa',    name: '道法',   color: '#f1948a', icon: '⚖️'  },
];

const LEVEL_CARDS = [
  { id: 'lv_1', name: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', name: 'Lv2', timeLimit: 25 },
  { id: 'lv_3', name: 'Lv3', timeLimit: 35 },
  { id: 'lv_4', name: 'Lv4', timeLimit: 45 },
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

/**
 * Hand displays cards in rows of subject+level PAIRS.
 * A row represents one playable combination from the user's actual hand.
 * Clicking any card in a row selects the whole pair.
 */
export const Hand: React.FC<HandProps> = ({
  subjectIds, levelIds,
  selectedSubject, selectedLevel,
  onSelectSubject, onSelectLevel,
  disabled
}) => {
  // Each index is one card pair: subjects[i] + levels[i]
  const pairs = subjectIds
    .map((subId, idx) => {
      const lvId = levelIds[idx];
      const sub = SUBJECT_CARDS.find(c => c.id === subId);
      const lv = LEVEL_CARDS.find(c => c.id === lvId);
      return { sub, lv, idx };
    })
    .filter(p => p.sub && p.lv);

  const isRowSelected = (subId: string, lvId: string) =>
    selectedSubject === subId && selectedLevel === lvId;

  return (
    <div>
      <div className="label" style={{ color: 'var(--neon-cyan)', marginBottom: '12px' }}>
        ▶ 选择一张学科+难度组合出牌
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pairs.map(({ sub, lv, idx }) => {
          const subId = sub!.id;
          const lvId = lv!.id;
          const selected = isRowSelected(subId, lvId);
          return (
            <div
              key={`pair_${idx}`}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '12px',
                border: selected ? '2px solid var(--neon-pink)' : '2px solid transparent',
                background: selected ? 'rgba(255,0,170,0.1)' : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: selected ? '0 0 15px rgba(255,0,170,0.4)' : 'none',
              }}
              onClick={() => {
                if (disabled) return;
                onSelectSubject(subId);
                onSelectLevel(lvId);
              }}
            >
              <Card
                type="subject"
                name={sub!.name}
                color={sub!.color}
                icon={sub!.icon}
                selected={selected}
                disabled={disabled}
              />
              <div style={{ color: '#555', fontSize: '1.2rem' }}>＋</div>
              <Card
                type="level"
                name={lv!.name}
                color="var(--neon-yellow)"
                icon="⚡"
                selected={selected}
                onClick={() => {}}
                timeLimit={lv!.timeLimit}
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
