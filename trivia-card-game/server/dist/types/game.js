"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIN_SCORE_STANDARD = exports.WIN_SCORE_SIMPLE = exports.LEVEL_CARDS = exports.SUBJECT_CARDS = void 0;
exports.SUBJECT_CARDS = [
    { id: 'sub_yuwen', type: 'subject', name: '语文', color: '#ff6b6b', icon: '📜' },
    { id: 'sub_math', type: 'subject', name: '数学', color: '#4ecdc4', icon: '📐' },
    { id: 'sub_english', type: 'subject', name: '英语', color: '#a8e6cf', icon: '🔤' },
    { id: 'sub_science', type: 'subject', name: '科学', color: '#f7dc6f', icon: '🔬' },
    { id: 'sub_history', type: 'subject', name: '历史', color: '#bb8fce', icon: '📜' },
    { id: 'sub_geography', type: 'subject', name: '地理', color: '#86b3d1', icon: '🌍' },
    { id: 'sub_biology', type: 'subject', name: '生物', color: '#82e0aa', icon: '🧬' },
    { id: 'sub_daofa', type: 'subject', name: '道法', color: '#f1948a', icon: '⚖️' },
];
exports.LEVEL_CARDS = [
    { id: 'lv_1', type: 'level', level: 'Lv1', timeLimit: 15 },
    { id: 'lv_2', type: 'level', level: 'Lv2', timeLimit: 12 },
    { id: 'lv_3', type: 'level', level: 'Lv3', timeLimit: 10 },
    { id: 'lv_4', type: 'level', level: 'Lv4', timeLimit: 8 },
];
exports.WIN_SCORE_SIMPLE = 10;
exports.WIN_SCORE_STANDARD = 20;
