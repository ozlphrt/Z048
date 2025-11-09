import { describe, expect, it } from "vitest";
import { createGameState, hasAvailableMoves, move } from "./game";
import type { GameState, TileState } from "./types";

const mockRandom = (...sequence: number[]) => {
  let index = 0;
  return () => {
    const value = sequence[index % sequence.length];
    index += 1;
    return value;
  };
};

const createState = (tiles: TileState[]): GameState => ({
  size: 4,
  tiles,
  score: 0,
  moveCount: 0,
  status: "playing"
});

describe("game_core", () => {
  it("creates initial state with starting tiles", () => {
    const state = createGameState({
      size: 4,
      startingTileCount: 2,
      random: mockRandom(0, 0.9, 0.2)
    });
    expect(state.tiles.length).toBe(2);
    expect(state.status).toBe("playing");
  });

  it("merges tiles correctly and spawns a new tile", () => {
    const state = createState([
      { id: "a", value: 2, position: { row: 1, col: 0 } },
      { id: "b", value: 2, position: { row: 2, col: 0 } }
    ]);

    const random = mockRandom(0.1, 0.3, 0.5);
    const result = move(state, "up", { random });

    expect(result.summary.moved).toBe(true);
    expect(result.summary.scoreDelta).toBe(4);
    expect(result.state.score).toBe(4);
    expect(result.state.moveCount).toBe(1);
    expect(result.summary.mergedValues).toEqual([4]);
    const mergedTile = result.state.tiles.find((tile) => tile.value === 4);
    expect(mergedTile?.position).toEqual({ row: 0, col: 0 });
    expect(result.summary.spawnedTile).toBeDefined();
    expect(result.summary.spawnedTile?.isNew).toBe(true);
  });

  it("does not move tiles when blocked", () => {
    const state = createState([
      { id: "a", value: 2, position: { row: 0, col: 0 } },
      { id: "b", value: 4, position: { row: 0, col: 1 } },
      { id: "c", value: 8, position: { row: 0, col: 2 } },
      { id: "d", value: 16, position: { row: 0, col: 3 } }
    ]);

    const result = move(state, "left", { random: mockRandom(0.5) });
    expect(result.summary.moved).toBe(false);
    expect(result.state.tiles).toHaveLength(4);
    expect(result.state.moveCount).toBe(0);
  });

  it("detects when no moves are available", () => {
    const tiles: TileState[] = [];
    const values = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 64]
    ];
    values.forEach((rowValues, row) => {
      rowValues.forEach((value, col) => {
        tiles.push({
          id: `${row}-${col}`,
          value,
          position: { row, col }
        });
      });
    });

    const state = createState(tiles);
    expect(hasAvailableMoves(state)).toBe(false);
    const result = move(state, "up", { random: mockRandom(0.1) });
    expect(result.summary.moved).toBe(false);
    expect(result.state.status).toBe("lost");
  });
});

