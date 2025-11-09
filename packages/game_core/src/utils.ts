import { nanoid } from "nanoid";
import {
  DEFAULT_SIZE,
  DEFAULT_STARTING_TILES,
  DEFAULT_TARGET_VALUE,
  directionVectors,
  NEW_TILE_WEIGHTS
} from "./constants";
import type {
  GameOptions,
  GameState,
  MoveDirection,
  Position,
  TileState
} from "./types";

export type Grid = Array<Array<TileState | null>>;

export const withinBounds = (size: number, position: Position): boolean =>
  position.row >= 0 &&
  position.row < size &&
  position.col >= 0 &&
  position.col < size;

export const clonePosition = (position: Position): Position => ({
  row: position.row,
  col: position.col
});

export const positionsEqual = (a: Position, b: Position): boolean =>
  a.row === b.row && a.col === b.col;

export const createEmptyGrid = (size: number): Grid =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

export const flattenGrid = (grid: Grid): TileState[] =>
  grid.flat().filter((tile): tile is TileState => tile !== null);

export const buildGridFromTiles = (size: number, tiles: TileState[]): Grid => {
  const grid = createEmptyGrid(size);
  tiles.forEach((tile) => {
    grid[tile.position.row][tile.position.col] = tile;
  });
  return grid;
};

export const randomChoice = <T>(
  options: Array<{ item: T; weight: number }>,
  random: () => number
): T => {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  const threshold = random() * totalWeight;
  let cumulative = 0;
  for (const option of options) {
    cumulative += option.weight;
    if (threshold <= cumulative) {
      return option.item;
    }
  }
  return options[options.length - 1].item;
};

export const generateTile = (
  size: number,
  occupied: TileState[],
  random: () => number,
  value?: number
): TileState | null => {
  const occupiedKey = new Set(
    occupied.map((tile) => `${tile.position.row}-${tile.position.col}`)
  );
  const empty: Position[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const key = `${row}-${col}`;
      if (!occupiedKey.has(key)) {
        empty.push({ row, col });
      }
    }
  }
  if (empty.length === 0) {
    return null;
  }
  const chosenPosition = empty[Math.floor(random() * empty.length)];
  const chosenValue =
    value ??
    randomChoice(
      NEW_TILE_WEIGHTS.map(({ value: tileValue, weight }) => ({
        item: tileValue,
        weight
      })),
      random
    );
  return {
    id: nanoid(),
    value: chosenValue,
    position: chosenPosition,
    isNew: true
  };
};

export const normalizedOptions = (options?: GameOptions) => ({
  size: options?.size ?? DEFAULT_SIZE,
  startingTileCount: options?.startingTileCount ?? DEFAULT_STARTING_TILES,
  targetValue: options?.targetValue ?? DEFAULT_TARGET_VALUE,
  random: options?.random ?? Math.random
});

export const traverseOrder = (
  size: number,
  direction: MoveDirection
): Position[] => {
  const order: Position[] = [];
  const vector = directionVectors[direction];

  const rowRange =
    vector.row === 1
      ? [...Array(size).keys()].reverse()
      : [...Array(size).keys()];
  const colRange =
    vector.col === 1
      ? [...Array(size).keys()].reverse()
      : [...Array(size).keys()];

  for (const row of rowRange) {
    for (const col of colRange) {
      order.push({ row, col });
    }
  }

  return order;
};

export const computeFarthestPosition = (
  grid: Grid,
  start: Position,
  direction: MoveDirection
): { farthest: Position; next: Position } => {
  const vector = directionVectors[direction];
  let previous = start;
  let current: Position = {
    row: start.row + vector.row,
    col: start.col + vector.col
  };

  while (
    withinBounds(grid.length, current) &&
    grid[current.row][current.col] === null
  ) {
    previous = current;
    current = { row: current.row + vector.row, col: current.col + vector.col };
  }

  return { farthest: previous, next: current };
};

export const cloneTile = (tile: TileState): TileState => ({
  ...tile,
  position: clonePosition(tile.position),
  previousPosition: tile.previousPosition
    ? clonePosition(tile.previousPosition)
    : undefined,
  mergedFrom: tile.mergedFrom
    ? tile.mergedFrom.map((t) => cloneTile(t))
    : undefined
});

export const cloneGameState = (state: GameState): GameState => ({
  size: state.size,
  score: state.score,
  moveCount: state.moveCount,
  status: state.status,
  tiles: state.tiles.map((tile) => cloneTile(tile))
});

