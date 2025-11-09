import type { MoveDirection, Position } from "./types";

export const DEFAULT_SIZE = 4;
export const DEFAULT_STARTING_TILES = 2;
export const DEFAULT_TARGET_VALUE = 2048;
export const NEW_TILE_WEIGHTS = [
  { value: 2, weight: 0.9 },
  { value: 4, weight: 0.1 }
];

export const directionVectors: Record<MoveDirection, Position> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
};

