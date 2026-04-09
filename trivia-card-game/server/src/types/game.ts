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

export type HandCard =
  | { cardType: 'subject_level'; subjectId: string; levelId: string }
  | { cardType: 'skill'; skillId: string }
  | { cardType: 'event'; eventId: string };

export type GameMode = 'pvp' | 'practice';

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
  mode: GameMode;
  activeSkillEffects: {
    double: boolean;
    noEnemySkill: boolean;
    swap: boolean;
    hintAvailable: boolean;
  };
  eventActive: string | null;
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

export const SKILL_CARDS: SkillCard[] = [
  { id: 'skill_help',    type: 'skill', name: '求助',   description: 'AI给出提示（不说答案），本轮有效', maxUses: 2 },
  { id: 'skill_swap',   type: 'skill', name: '换题',   description: '本轮作废，重出同难度题', maxUses: 1 },
  { id: 'skill_double', type: 'skill', name: '双倍',   description: '本轮答对得2分', maxUses: 1 },
  { id: 'skill_skip',   type: 'skill', name: '跳过',   description: '跳过本轮，直接结束回合', maxUses: 0 },
  { id: 'skill_ban',    type: 'skill', name: '禁手',   description: '对方本回合不能使用技能', maxUses: 1 },
  { id: 'skill_first',  type: 'skill', name: '先手',   description: '本轮由你先答题', maxUses: 0 },
];

export const EVENT_CARDS: EventCard[] = [
  { id: 'event_flash',   type: 'event', name: '闪电快答', description: '必须在10秒内答完，超时算错' },
  { id: 'event_coop',    type: 'event', name: '双人合作', description: '两人各答一题，都对各+1' },
  { id: 'event_combo',   type: 'event', name: '知识连击', description: '必须连续答对2题才能得分' },
  { id: 'event_teach',   type: 'event', name: '错题讲堂', description: '答错后AI详细讲解（最长60秒）' },
];

export const WIN_SCORE_SIMPLE = 10;
export const WIN_SCORE_STANDARD = 20;
