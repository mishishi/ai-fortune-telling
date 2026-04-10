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
    explanation?: string;
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
  mode: 'pvp' | 'practice' | 'async';
  activeSkillEffects: { double: boolean; noEnemySkill: boolean; swap: boolean; hintAvailable: boolean };
  eventActive: string | null;
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [skillMessage, setSkillMessage] = useState<string | null>(null);
  // 流式思考内容累积
  const [questionThinking, setQuestionThinking] = useState<{ narrative: string; text: string } | null>(null);

  // Async game state
  const [asyncRoom, setAsyncRoom] = useState<any | null>(null);
  const [lastAiResult, setLastAiResult] = useState<any | null>(null);
  const [lastXpGain, setLastXpGain] = useState<{ xpEarned: number; totalXp: number; tier: string; tierChanged: boolean } | null>(null);
  const [tierUp, setTierUp] = useState<string | null>(null);
  const [asyncGameOver, setAsyncGameOver] = useState<{ winner: string; finalScore: { player: number; ai: number } } | null>(null);
  const [seasonState, setSeasonState] = useState<{ season: any; stats: any } | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => console.log('[Socket] connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('[Socket] disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket] connection error:', err.message));
    socket.on('game_state', (state: GameState) => {
      console.log('[Socket] game_state received, phase:', state.phase);
      // Defer by one microtask so the loading UI (waitingForQuestion=true)
      // has a chance to paint before the question arrives
      queueMicrotask(() => setGameState(state));
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
    });
    // 流式思考：每块追加到累积文本
    socket.on('question_thinking', (data: { narrative?: string; chunk?: string }) => {
      setQuestionThinking(prev => ({
        narrative: data.narrative ?? prev?.narrative ?? '',
        text: (prev?.text ?? '') + (data.chunk ?? ''),
      }));
    });
    // 题目就绪，清除思考状态
    socket.on('question_ready', () => {
      setQuestionThinking(null);
    });

    // Season events
    socket.on('season_state', (data: { season: any; stats: any }) => {
      setSeasonState(data);
    });
    socket.on('tier_up', (data: { newTier: string }) => {
      setTierUp(data.newTier);
      setTimeout(() => setTierUp(null), 5000);
    });
    socket.on('xp_gained', (data: { xpEarned: number; totalXp: number; tier: string; tierChanged: boolean }) => {
      setLastXpGain(data);
    });

    // Async room events
    socket.on('async_room_state', (data: any) => {
      setAsyncRoom(data);
    });
    socket.on('ai_turn_result', (data: { turnCount: number; aiScore: number; aiAnswers: any[] }) => {
      setLastAiResult(data);
    });
    socket.on('async_game_over', (data: { winner: string; finalScore: { player: number; ai: number } }) => {
      setAsyncGameOver(data);
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

  const startAsyncGame = useCallback((maxTurns = 3) => {
    socketRef.current?.emit('start_async_game', { maxTurns });
  }, []);

  const submitAsyncTurn = useCallback((answers: any[]) => {
    socketRef.current?.emit('submit_async_turn', { answers });
  }, []);

  return { gameState, error, startGame, playCards, submitAnswer, useSkill, requestHint, hint, setHint, skillMessage, questionThinking, setQuestionThinking, startAsyncGame, submitAsyncTurn, asyncRoom, lastAiResult, lastXpGain, tierUp, asyncGameOver, seasonState, setAsyncGameOver };
}
