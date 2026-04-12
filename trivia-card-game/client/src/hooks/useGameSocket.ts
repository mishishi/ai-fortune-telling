import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Module-level singleton - single socket for entire app
let sharedSocket: Socket | null = null;
let socketListenersRegistered = false;

// Module-level state - shared across all hook instances
let sharedGameState: GameState | null = null;
let sharedAsyncRoom: any = null;
let sharedLastAiResult: any = null;
let sharedLastXpGain: { xpEarned: number; totalXp: number; tier: string; tierChanged: boolean } | null = null;
let sharedTierUp: string | null = null;
let sharedAsyncGameOver: { winner: string; finalScore: { player: number; ai: number } } | null = null;
let sharedSeasonState: { season: any; stats: any } | null = null;
let sharedAiThinking = false;
let sharedAiRevealedAnswers: any[] = [];
let sharedAsyncQuestions: any[] = [];

// Store forceUpdate functions from all hook instances to trigger re-renders
type ForceUpdate = () => void;
const forceUpdates: ForceUpdate[] = [];

const triggerReRender = () => {
  console.log('[Socket] triggerReRender called for', forceUpdates.length, 'instances');
  forceUpdates.forEach(fn => fn());
};

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

// Setters that update module-level state AND trigger re-renders
const setSharedGameState = (data: GameState | null) => {
  sharedGameState = data;
  triggerReRender();
};
const setAsyncRoom = (data: any) => {
  console.log('[Socket] setAsyncRoom called, data.state:', data?.state);
  sharedAsyncRoom = data;
  triggerReRender();
};
const setLastAiResult = (data: any) => {
  sharedLastAiResult = data;
  triggerReRender();
};
const setLastXpGain = (data: any) => {
  sharedLastXpGain = data;
  triggerReRender();
};
const setTierUp = (data: string | null) => {
  sharedTierUp = data;
  triggerReRender();
};
const setAsyncGameOver = (data: any) => {
  sharedAsyncGameOver = data;
  triggerReRender();
};
const setSeasonState = (data: any) => {
  sharedSeasonState = data;
  triggerReRender();
};
const setAiThinking = (data: boolean) => {
  sharedAiThinking = data;
  triggerReRender();
};
const setAiRevealedAnswers = (data: any[] | ((prev: any[]) => any[])) => {
  if (typeof data === 'function') {
    sharedAiRevealedAnswers = data(sharedAiRevealedAnswers);
  } else {
    sharedAiRevealedAnswers = data;
  }
  triggerReRender();
};
const setAsyncQuestions = (data: any[] | ((prev: any[]) => any[])) => {
  if (typeof data === 'function') {
    sharedAsyncQuestions = data(sharedAsyncQuestions);
  } else {
    sharedAsyncQuestions = data;
  }
  triggerReRender();
};

export function useGameSocket() {
  // Force this component to re-render using an incrementing counter
  const [, setRenderCount] = useState(0);

  // Register this instance's forceUpdate - runs once on mount, unmounts on unmount
  useEffect(() => {
    console.log('[Socket] registering forceUpdate for new hook instance, index:', forceUpdates.length);
    const updateFn = () => {
      console.log('[Socket] forceUpdate called');
      setRenderCount(c => c + 1);
    };
    forceUpdates.push(updateFn);
    return () => {
      const idx = forceUpdates.indexOf(updateFn);
      if (idx !== -1) forceUpdates.splice(idx, 1);
    };
  }, []); // Empty deps

  const socketRef = useRef<Socket | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [skillMessage, setSkillMessage] = useState<string | null>(null);
  const [questionThinking, setQuestionThinking] = useState<{ narrative: string; text: string } | null>(null);

  // Initialize socket once using module-level singleton
  useEffect(() => {
    // 获取或生成持久化的 playerClientId（页面刷新后不变）
    let playerClientId = localStorage.getItem('playerClientId');
    if (!playerClientId) {
      playerClientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('playerClientId', playerClientId);
    }

    // 如果已有 socket 且处于连接状态，则复用；否则创建新的
    if (sharedSocket && sharedSocket.connected) {
      socketRef.current = sharedSocket;
      console.log('[Socket] reusing existing connected socket:', sharedSocket.id);
      return;
    }

    // 清理旧的不连接的 socket，确保重新建立
    sharedSocket = null;
    socketListenersRegistered = false;

    console.log('[Socket] creating new socket connection, playerClientId:', playerClientId);
    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      auth: { playerClientId },
    });
    sharedSocket = socket;
    socketRef.current = socket;

    // Register listeners only once
    if (!socketListenersRegistered) {
      console.log('[Socket] registering listeners');
      socketListenersRegistered = true;

      socket.on('connect', () => {
        console.log('[Socket] connected:', socket.id);
        // Trigger re-render for all instances so they pick up sharedSocket.connected
        triggerReRender();
      });
      socket.on('disconnect', (reason) => {
        console.log('[Socket] disconnected:', reason);
        // Socket disconnected — on next connect we need fresh listeners
        socketListenersRegistered = false;
      });
      socket.on('connect_error', (err) => console.error('[Socket] connection error:', err.message));

      socket.on('game_state', (state: GameState) => {
        console.log('[Socket] game_state received, phase:', state.phase);
        setSharedGameState(state);
      });

      socket.on('error', (err: { message: string }) => {
        console.error('[Socket] error:', err.message);
        setError(err.message);
        setTimeout(() => setError(null), 3000);
      });

      socket.on('hint_received', (data: { hint: string }) => setHint(data.hint));

      socket.on('skill_activated', (data: { skillName: string; description: string }) => {
        setSkillMessage(`${data.skillName}已激活：${data.description}`);
        setTimeout(() => setSkillMessage(null), 3000);
      });

      socket.on('question_thinking', (data: { narrative?: string; chunk?: string }) => {
        setQuestionThinking(prev => ({
          narrative: data.narrative ?? prev?.narrative ?? '',
          text: (prev?.text ?? '') + (data.chunk ?? ''),
        }));
      });

      socket.on('question_ready', () => setQuestionThinking(null));

      socket.on('season_state', (data: { season: any; stats: any }) => {
        console.log('[Socket] season_state received');
        setSeasonState(data);
      });

      socket.on('tier_up', (data: { newTier: string }) => {
        console.log('[Socket] tier_up received');
        setTierUp(data.newTier);
        setTimeout(() => setTierUp(null), 5000);
      });

      socket.on('xp_gained', (data: { xpEarned: number; totalXp: number; tier: string; tierChanged: boolean }) => {
        console.log('[Socket] xp_gained received');
        setLastXpGain(data);
      });

      socket.on('async_room_state', (data: any) => {
        console.log('[Socket] async_room_state received:', data);
        setAsyncRoom(data);
      });

      socket.on('ai_turn_result', (data: { turnCount: number; aiScore: number; aiAnswers: any[] }) => {
        console.log('[Socket] ai_turn_result received');
        setLastAiResult(data);
      });

      socket.on('ai_thinking_start', () => {
        console.log('[Socket] ai_thinking_start received');
        setAiThinking(true);
        setAiRevealedAnswers([]);
      });

      socket.on('ai_answer_reveal', (data: { index: number; answer: any; total: number }) => {
        console.log('[Socket] ai_answer_reveal received, index:', data.index);
        setAiRevealedAnswers(prev => [...prev, data.answer]);
      });

      socket.on('ai_thinking_stop', () => {
        console.log('[Socket] ai_thinking_stop received');
        setAiThinking(false);
      });

      socket.on('async_game_over', (data: { winner: string; finalScore: { player: number; ai: number } }) => {
        console.log('[Socket] async_game_over received');
        setAsyncGameOver(data);
      });

      socket.on('game_abandoned', () => {
        console.log('[Socket] game_abandoned received');
        sharedAsyncRoom = null;
        sharedAsyncGameOver = null;
        triggerReRender();
      });

      socket.on('async_question_ready', (data: any) => {
        console.log('[Socket] async_question_ready received:', data);
        setAsyncQuestions(prev => [...prev, data]);
      });
    }

    return () => {
      console.log('[Socket] unmounting, keeping socket alive');
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (sharedSocket?.connected) {
      sharedSocket.emit(event, data);
    } else {
      console.error('[Socket] emit failed - socket not connected:', event);
    }
  }, []);

  const startGame = useCallback((winScore = 10) => {
    // Wait for socket to be connected before emitting
    const tryEmit = (attempts: number) => {
      if (sharedSocket?.connected) {
        console.log('[Socket] startGame emitting, socket:', sharedSocket.id);
        sharedSocket.emit('start_game', { winScore });
      } else if (attempts < 20) {
        setTimeout(() => tryEmit(attempts + 1), 100);
      } else {
        console.error('[Socket] startGame: socket never connected');
      }
    };
    tryEmit(0);
  }, []);

  const playCards = useCallback((cardIndex: number) => {
    emit('play_cards', { cardIndex });
  }, [emit]);

  const submitAnswer = useCallback((answer: string) => {
    emit('submit_answer', { answer });
  }, [emit]);

  const useSkill = useCallback((cardIndex: number) => {
    emit('use_skill', { cardIndex });
  }, [emit]);

  const requestHint = useCallback(() => {
    emit('request_hint');
  }, [emit]);

  const startAsyncGame = useCallback((maxTurns = 3) => {
    console.log('[Socket] start_async_game emit, socket:', sharedSocket?.id, 'connected:', sharedSocket?.connected);
    emit('start_async_game', { maxTurns });
  }, [emit]);

  const addAsyncQuestion = useCallback((subjectId: string, levelId: string) => {
    emit('add_async_question', { subjectId, levelId });
  }, [emit]);

  const submitAsyncTurn = useCallback((questions: any[]) => {
    emit('submit_async_turn', { questions });
  }, [emit]);

  const abandonAsyncGame = useCallback(() => {
    emit('abandon_async_game');
  }, [emit]);

  // Helper to update shared async questions
  const updateAsyncQuestions = useCallback((data: any[]) => {
    setAsyncQuestions(data);
  }, []);

  return {
    gameState: sharedGameState, error, startGame, playCards, submitAnswer, useSkill, requestHint,
    hint, setHint, skillMessage, questionThinking, setQuestionThinking,
    startAsyncGame, addAsyncQuestion, submitAsyncTurn, abandonAsyncGame,
    asyncRoom: sharedAsyncRoom,
    setAsyncRoom,
    lastAiResult: sharedLastAiResult,
    lastXpGain: sharedLastXpGain,
    tierUp: sharedTierUp,
    asyncGameOver: sharedAsyncGameOver,
    seasonState: sharedSeasonState,
    setAsyncGameOver: (data: any) => {
      sharedAsyncGameOver = data;
      triggerReRender();
    },
    aiThinking: sharedAiThinking,
    aiRevealedAnswers: sharedAiRevealedAnswers,
    asyncQuestions: sharedAsyncQuestions,
    setAsyncQuestions: updateAsyncQuestions,
  };
}
