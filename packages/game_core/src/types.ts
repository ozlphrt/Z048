export type MoveDirection = "up" | "down" | "left" | "right";

export interface Position {
  row: number;
  col: number;
}

export interface TileSnapshot {
  id: string;
  value: number;
  position: Position;
  previousPosition?: Position;
  mergedFromIds?: string[];
  isNew?: boolean;
  isMergedResult?: boolean;
}

export interface TileState {
  id: string;
  value: number;
  position: Position;
  previousPosition?: Position;
  locked?: boolean;
  mergedFrom?: TileState[];
  isNew?: boolean;
  isMergedResult?: boolean;
}

export interface GameState {
  size: number;
  tiles: TileState[];
  score: number;
  moveCount: number;
  status: "playing" | "won" | "lost";
}

export interface SerializedGameState {
  size: number;
  score: number;
  moveCount: number;
  status: GameState["status"];
  tiles: Array<{
    id: string;
    value: number;
    position: Position;
  }>;
}

export interface MoveSummary {
  moved: boolean;
  scoreDelta: number;
  mergedValues: number[];
  spawnedTile?: TileState;
}

export interface MoveResult {
  state: GameState;
  summary: MoveSummary;
}

export interface GameOptions {
  size?: number;
  startingTileCount?: number;
  targetValue?: number;
  random?: () => number;
}

