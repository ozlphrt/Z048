import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import {
  createGameState,
  deserializeGameState,
  move,
  serializeGameState,
  type GameState,
  type MoveDirection,
  type MoveResult,
  type MoveSummary,
  type SerializedGameState
} from "@modern2048/game_core";
import {
  HISTORY_LIMIT,
  loadPersistedState,
  savePersistedState
} from "./persistence";

interface GameContextValue {
  state: GameState;
  lastSummary: MoveSummary | null;
  move: (direction: MoveDirection) => void;
  reset: () => void;
  undo: () => void;
  canAcceptInput: boolean;
  canUndo: boolean;
  bestScore: number;
}

const GameContext = createContext<GameContextValue | null>(null);

const BOARD_SIZE = 4;
export const GameProvider = ({ children }: PropsWithChildren) => {
  const initializationRef = useRef(false);
  const persistedRef = useRef<ReturnType<typeof loadPersistedState> | null>(null);

  if (!initializationRef.current) {
    initializationRef.current = true;
    persistedRef.current = loadPersistedState();
  }

  const historyRef = useRef<SerializedGameState[]>(
    persistedRef.current?.history ?? []
  );

  const [state, setState] = useState<GameState>(() =>
    persistedRef.current?.state ?? createGameState({ size: BOARD_SIZE })
  );
  const [lastSummary, setLastSummary] = useState<MoveSummary | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [bestScore, setBestScore] = useState<number>(
    persistedRef.current?.bestScore ?? state.score
  );
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAnimationWindow = useCallback(() => {
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
    setIsAnimating(true);
    animationTimeout.current = setTimeout(() => {
      setIsAnimating(false);
      animationTimeout.current = null;
    }, 180);
  }, []);

  const handleMoveResult = useCallback(
    (result: MoveResult, previous: GameState) => {
      setLastSummary(result.summary);
      if (!result.summary.moved) {
        return previous;
      }
      scheduleAnimationWindow();
      return result.state;
    },
    [scheduleAnimationWindow]
  );

  const performMove = useCallback((direction: MoveDirection) => {
    setState((previous) => {
      const snapshot = serializeGameState(previous);
      const result = move(previous, direction);
      const nextState = handleMoveResult(result, previous);
      if (result.summary.moved) {
        const updatedHistory = [...historyRef.current, snapshot];
        historyRef.current =
          updatedHistory.length > HISTORY_LIMIT
            ? updatedHistory.slice(updatedHistory.length - HISTORY_LIMIT)
            : updatedHistory;
        setBestScore((current) =>
          Math.max(current, result.state.score)
        );
      }
      return nextState;
    });
  }, [handleMoveResult]);

  const reset = useCallback(() => {
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
    setIsAnimating(false);
    setState(createGameState({ size: BOARD_SIZE }));
    setLastSummary(null);
    historyRef.current = [];
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) {
      return;
    }
    const history = [...historyRef.current];
    const snapshot = history.pop();
    historyRef.current = history;
    if (!snapshot) {
      return;
    }
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
    setIsAnimating(false);
    setState(deserializeGameState(snapshot));
    setLastSummary(null);
  }, []);

  const canUndoFlag = historyRef.current.length > 0;

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      lastSummary,
      move: performMove,
      reset,
      undo,
      canAcceptInput: !isAnimating && state.status !== "lost",
      canUndo: canUndoFlag,
      bestScore
    }),
    [bestScore, canUndoFlag, isAnimating, lastSummary, performMove, reset, state, undo]
  );

  useEffect(() => {
    persistedRef.current = null;
  }, []);

  useEffect(() => {
    savePersistedState(state, [...historyRef.current], bestScore);
  }, [state, bestScore]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside a GameProvider.");
  }
  return context;
};

