import { nanoid } from "nanoid";
import {
  buildGridFromTiles,
  cloneGameState,
  clonePosition,
  cloneTile,
  computeFarthestPosition,
  flattenGrid,
  generateTile,
  normalizedOptions,
  positionsEqual,
  traverseOrder,
  withinBounds
} from "./utils";
import type {
  GameOptions,
  GameState,
  MoveDirection,
  MoveResult,
  SerializedGameState,
  TileSnapshot,
  TileState
} from "./types";
import { DEFAULT_TARGET_VALUE } from "./constants";

const normalizeTiles = (tiles: TileState[]): TileState[] =>
  tiles.map((tile) => ({
    ...tile,
    previousPosition: undefined,
    mergedFrom: undefined,
    isNew: false,
    isMergedResult: false,
    locked: false
  }));

const canMergeTiles = (a: TileState | null, b: TileState | null) =>
  Boolean(
    a &&
      b &&
      a.value === b.value &&
      !a.locked &&
      !b.locked &&
      !a.isMergedResult &&
      !b.isMergedResult
  );

const evaluateStatus = (
  state: GameState,
  targetValue: number
): GameState["status"] => {
  if (state.status === "won") {
    return "won";
  }
  if (state.tiles.some((tile) => tile.value >= targetValue)) {
    return "won";
  }
  if (hasAvailableMoves(state)) {
    return "playing";
  }
  return "lost";
};

export const hasAvailableMoves = (state: GameState): boolean => {
  const grid = buildGridFromTiles(state.size, state.tiles);
  for (let row = 0; row < state.size; row += 1) {
    for (let col = 0; col < state.size; col += 1) {
      const tile = grid[row][col];
      if (!tile) {
        return true;
      }
      const neighbors: Array<[number, number]> = [
        [row + 1, col],
        [row - 1, col],
        [row, col + 1],
        [row, col - 1]
      ];
      for (const [nRow, nCol] of neighbors) {
        if (!withinBounds(state.size, { row: nRow, col: nCol })) {
          continue;
        }
        const neighbor = grid[nRow]?.[nCol] ?? null;
        if (!neighbor || neighbor.value === tile.value) {
          return true;
        }
      }
    }
  }
  return false;
};

export const createGameState = (options?: GameOptions): GameState => {
  const normalized = normalizedOptions(options);
  const tiles: TileState[] = [];
  for (let i = 0; i < normalized.startingTileCount; i += 1) {
    const tile = generateTile(normalized.size, tiles, normalized.random);
    if (tile) {
      tiles.push(tile);
    }
  }
  return {
    size: normalized.size,
    tiles,
    score: 0,
    moveCount: 0,
    status: "playing"
  };
};

export const move = (
  state: GameState,
  direction: MoveDirection,
  options?: Partial<GameOptions>
): MoveResult => {
  if (state.status === "lost") {
    return { state, summary: { moved: false, scoreDelta: 0, mergedValues: [] } };
  }

  const normalized = normalizedOptions(options);
  const workingState = cloneGameState(state);
  workingState.tiles = normalizeTiles(workingState.tiles);

  const grid = buildGridFromTiles(workingState.size, workingState.tiles);
  const traversalOrder = traverseOrder(workingState.size, direction);

  let moved = false;
  let scoreDelta = 0;
  const mergedValues: number[] = [];

  traversalOrder.forEach((position) => {
    const tile = grid[position.row][position.col];
    if (!tile) {
      return;
    }

    const { farthest, next } = computeFarthestPosition(grid, position, direction);
    tile.previousPosition = clonePosition(tile.position);

    const nextTile =
      withinBounds(workingState.size, next) ? grid[next.row][next.col] : null;

    if (canMergeTiles(tile, nextTile)) {
      if (nextTile) {
        nextTile.previousPosition = clonePosition(nextTile.position);
      }
      const mergedValue = tile.value * 2;
      const mergedTile: TileState = {
        id: nanoid(),
        value: mergedValue,
        position: next,
        previousPosition: clonePosition(tile.previousPosition ?? tile.position),
        mergedFrom: [cloneTile(tile), cloneTile(nextTile!)],
        isMergedResult: true,
        locked: true
      };

      grid[position.row][position.col] = null;
      grid[next.row][next.col] = mergedTile;

      mergedValues.push(mergedValue);
      scoreDelta += mergedValue;
      moved = true;
    } else {
      const destination = farthest;
      if (!positionsEqual(tile.position, destination)) {
        moved = true;
      }
      grid[position.row][position.col] = null;
      tile.position = destination;
      grid[destination.row][destination.col] = tile;
    }
  });

  const tiles: TileState[] = flattenGrid(grid).map((tile) => ({
    ...tile,
    locked: false
  }));

  let spawnedTile: TileState | undefined;

  if (moved) {
    const newTile = generateTile(
      workingState.size,
      tiles,
      normalized.random
    );
    if (newTile) {
      const normalizedTile: TileState = {
        ...newTile,
        locked: false
      };
      tiles.push(normalizedTile);
      spawnedTile = normalizedTile;
    }
  }

  const nextState: GameState = {
    size: workingState.size,
    tiles,
    score: workingState.score + scoreDelta,
    moveCount: moved ? workingState.moveCount + 1 : workingState.moveCount,
    status: evaluateStatus(
      {
        ...workingState,
        tiles,
        score: workingState.score + scoreDelta,
        moveCount: moved
          ? workingState.moveCount + 1
          : workingState.moveCount
      },
      normalized.targetValue ?? DEFAULT_TARGET_VALUE
    )
  };

  return {
    state: nextState,
    summary: {
      moved,
      scoreDelta,
      mergedValues,
      spawnedTile
    }
  };
};

export const serializeGameState = (state: GameState): SerializedGameState => ({
  size: state.size,
  score: state.score,
  moveCount: state.moveCount,
  status: state.status,
  tiles: state.tiles.map<TileSnapshot>((tile) => ({
    id: tile.id,
    value: tile.value,
    position: { ...tile.position }
  }))
});

export const deserializeGameState = (
  snapshot: SerializedGameState
): GameState => ({
  size: snapshot.size,
  score: snapshot.score,
  moveCount: snapshot.moveCount,
  status: snapshot.status,
  tiles: snapshot.tiles.map<TileState>((tile) => ({
    id: tile.id,
    value: tile.value,
    position: { ...tile.position },
    previousPosition: undefined,
    mergedFrom: undefined,
    isNew: false,
    isMergedResult: false,
    locked: false
  }))
});

