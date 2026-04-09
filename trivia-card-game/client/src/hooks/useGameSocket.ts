import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface GameState {
  roomId: string;
  phase: string;
  playerScore: number;
  aiScore: number;
  currentQuestion: {
    id: string;
    narrative: string;
    question: string;
    answer: string;
    options: string[];
    timeLimit: number;
  } | null;
  hand: Array<{
    cardType: 'subject_level' | 'skill' | 'event';
    subjectId?: string;
    levelId?: string;
    skillId?: string;
    eventId?: string;
  }>;
  deckCount: number;
  discardCount: number;
  winner: 'player' | 'ai' | null;
  mode: 'pvp' | 'practice';
  activeSkillEffects: { double: boolean; noEnemySkill: boolean; swap: boolean; hintAvailable: boolean };
  eventActive: string | null;
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [skillMessage, setSkillMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => console.log('[Socket] connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('[Socket] disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket] connection error:', err.message));
    socket.on('game_state', (state: GameState) => {
      console.log('[Socket] game_state received, phase:', state.phase);
      setGameState(state);
    });
    socket.on('error', (err: { message: string }) => {
      console.error('[Socket] error:', err.message);
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    });
    socket.on('hint_received', (data: { hint: string }) => {
      setHint(data.hint);
    });
    socket.on('skill_activated', (data: { skillName: string; description: string }) => {
      setSkillMessage(`${data.skillName}已激活：${data.description}`);
      setTimeout(() => setSkillMessage(null), 3000);
    });
    socket.on('explanation', (data: { explanation: string }) => {
      console.log('[Socket] explanation:', data.explanation);
      // Could show explanation in a modal/toast
    });

    return () => { socket.disconnect(); };
  }, []);

  const startGame = useCallback((winScore = 10) => {
    socketRef.current?.emit('start_game', { winScore });
  }, []);

  const playCards = useCallback((cardIndex: number) => {
    socketRef.current?.emit('play_cards', { cardIndex });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    socketRef.current?.emit('submit_answer', { answer });
  }, []);

  const useSkill = useCallback((cardIndex: number) => {
    socketRef.current?.emit('use_skill', { cardIndex });
  }, []);

  const requestHint = useCallback(() => {
    socketRef.current?.emit('request_hint');
  }, []);

  return { gameState, error, startGame, playCards, submitAnswer, useSkill, requestHint, hint, setHint, skillMessage };
}
