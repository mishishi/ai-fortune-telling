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
    timeLimit: number;
  } | null;
  handSubjects: string[];
  handLevels: string[];
  deckCount: number;
  discardCount: number;
  winner: 'player' | 'ai' | null;
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    return () => { socket.disconnect(); };
  }, []);

  const startGame = useCallback((winScore = 10) => {
    socketRef.current?.emit('start_game', { winScore });
  }, []);

  const playCards = useCallback((subjectCardId: string, levelCardId: string) => {
    socketRef.current?.emit('play_cards', { subjectCardId, levelCardId });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    socketRef.current?.emit('submit_answer', { answer });
  }, []);

  return { gameState, error, startGame, playCards, submitAnswer };
}
