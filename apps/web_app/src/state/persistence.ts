import {
  deserializeGameState,
  serializeGameState,
  type GameState,
  type SerializedGameState
} from "@modern2048/game_core";

const STORAGE_KEY = "modern2048.game.v1";
export const HISTORY_LIMIT = 16;

export interface PersistedPayload {
  game: SerializedGameState;
  history?: SerializedGameState[];
  bestScore?: number;
}

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const clampHistory = (history: SerializedGameState[]): SerializedGameState[] => {
  if (history.length <= HISTORY_LIMIT) {
    return history;
  }
  return history.slice(history.length - HISTORY_LIMIT);
};

export const savePersistedState = (state: GameState, history: SerializedGameState[], bestScore: number) => {
  if (!isBrowser()) {
    return;
  }
  try {
    const payload: PersistedPayload = {
      game: serializeGameState(state),
      history: clampHistory(history),
      bestScore
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to persist game state", error);
  }
};

export const loadPersistedState = (): {
  state: GameState;
  history: SerializedGameState[];
  bestScore: number;
} | null => {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedPayload;
    return {
      state: deserializeGameState(parsed.game),
      history: clampHistory(parsed.history ?? []),
      bestScore: parsed.bestScore ?? 0
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load persisted game state", error);
    return null;
  }
};

export const clearPersistedState = () => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};


