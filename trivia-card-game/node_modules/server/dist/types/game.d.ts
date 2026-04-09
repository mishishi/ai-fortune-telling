export type Subject = '语文' | '数学' | '英语' | '科学' | '历史' | '地理' | '生物' | '道法';
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
export type GamePhase = 'idle' | 'play_card' | 'answering' | 'result' | 'game_over';
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
export declare const SUBJECT_CARDS: SubjectCard[];
export declare const LEVEL_CARDS: LevelCard[];
export declare const WIN_SCORE_SIMPLE = 10;
export declare const WIN_SCORE_STANDARD = 20;
