export type Subject =
  | '语文' | '数学' | '英语'
  | '科学' | '历史' | '地理'
  | '生物' | '道法';

export type Level = 'Lv1' | 'Lv2' | 'Lv3' | 'Lv4';

export interface SubjectCard {
  id: string;
  type: 'subject';
  name: Subject;
  color: string;
  icon: string;
}

export interface LevelCard {
  id: string;
  type: 'level';
  level: Level;
  timeLimit: number;
}

export interface SkillCard {
  id: string;
  type: 'skill';
  name: '求助' | '换题' | '双倍' | '跳过' | '禁手' | '先手';
  description: string;
  maxUses: number;
}

export interface EventCard {
  id: string;
  type: 'event';
  name: '闪电快答' | '双人合作' | '知识连击' | '错题讲堂';
  description: string;
}

export type GameCardType = 'subject' | 'level' | 'skill' | 'event';

export interface GameCard {
  id: string;
  cardType: GameCardType;
  data: SubjectCard | LevelCard | SkillCard | EventCard;
}

export type GamePhase =
  | 'idle'
  | 'play_card'
  | 'answering'
  | 'result'
  | 'game_over';

export interface Question {
  id: string;
  subject: Subject;
  level: Level;
  narrative: string;
  question: string;
  answer: string;
  timeLimit: number;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  playerScore: number;
  aiScore: number;
  currentQuestion: Question | null;
  usedSubjectLevels: string[];
  winner: 'player' | 'ai' | null;
}

export const SUBJECT_CARDS: SubjectCard[] = [
  { id: 'sub_yuwen',    type: 'subject', name: '语文',   color: '#ff6b6b', icon: '📜' },
  { id: 'sub_math',     type: 'subject', name: '数学',   color: '#4ecdc4', icon: '📐' },
  { id: 'sub_english',  type: 'subject', name: '英语',   color: '#a8e6cf', icon: '🔤' },
  { id: 'sub_science',  type: 'subject', name: '科学',   color: '#f7dc6f', icon: '🔬' },
  { id: 'sub_history',  type: 'subject', name: '历史',   color: '#bb8fce', icon: '📜' },
  { id: 'sub_geography',type:'subject', name: '地理',   color: '#86b3d1', icon: '🌍' },
  { id: 'sub_biology',  type: 'subject', name: '生物',   color: '#82e0aa', icon: '🧬' },
  { id: 'sub_daofa',    type: 'subject', name: '道法',   color: '#f1948a', icon: '⚖️'  },
];

export const LEVEL_CARDS: LevelCard[] = [
  { id: 'lv_1', type: 'level', level: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', type: 'level', level: 'Lv2', timeLimit: 25 },
  { id: 'lv_3', type: 'level', level: 'Lv3', timeLimit: 35 },
  { id: 'lv_4', type: 'level', level: 'Lv4', timeLimit: 45 },
];

export const WIN_SCORE_SIMPLE = 10;
export const WIN_SCORE_STANDARD = 20;
