import { useEffect, useMemo, type CSSProperties } from "react";
import styled from "styled-components";
import { useGame } from "../state/game_provider";
import { useKeyboard } from "../hooks/use_keyboard";
import { useSwipe } from "../hooks/use_swipe";
import { TILE_GAP } from "../constants/layout";
import { Tile } from "./tile";
import { useViewportSize } from "../hooks/use_window_width";

const BOARD_GAP = TILE_GAP;

const BoardShell = styled.div`
  position: relative;
  touch-action: none;
  box-sizing: border-box;
`;

const BoardSurface = styled.div<{ $size: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  border: 1px solid
    ${({ theme }) =>
      theme.appearance === "dark" ? theme.boardOutline : theme.boardOutlineLight};
  background: ${({ theme }) =>
    theme.appearance === "dark" ? theme.boardBackground : theme.boardBackgroundLight};
  box-shadow: ${({ theme }) =>
      theme.appearance === "dark"
        ? "inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 25px 45px rgba(5, 9, 19, 0.35)"
        : "inset 0 0 0 1px rgba(30, 35, 48, 0.08), 0 22px 38px rgba(40, 44, 60, 0.12)"};
  padding: var(--outer-padding, ${BOARD_GAP}px);
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;

  display: grid;
  grid-template-rows: repeat(${({ $size }) => $size}, 1fr);
  grid-template-columns: repeat(${({ $size }) => $size}, 1fr);
  gap: ${BOARD_GAP}px;
`;

const BoardCell = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  &::before {
    content: "";
    display: block;
    width: calc(100% - var(--cell-padding, 0px) * 2);
    height: calc(100% - var(--cell-padding, 0px) * 2);
    border-radius: 18px;
    background: ${({ theme }) =>
      theme.appearance === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(14, 23, 38, 0.08)"};
    border: 1px solid
      ${({ theme }) =>
        theme.appearance === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(30, 54, 82, 0.12)"};
    backdrop-filter: blur(18px);
  }
`;

const TilesLayer = styled.div<{ $dimension: number }>`
  position: absolute;
  inset: var(--outer-padding, 0px);
  pointer-events: none;
  width: ${({ $dimension }) => $dimension}px;
  height: ${({ $dimension }) => $dimension}px;
`;

const MAX_BOARD_SIZE = 640;
const MIN_BOARD_SIZE = 220;
const ADDITIONAL_PADDING = 120;
const TILE_PADDING_RATIO = 0.08;
const TILE_PADDING_MAX = 6;

export const GameBoard = ({
  onBoardWidthChange,
  topOffset = 0
}: {
  onBoardWidthChange?: (width: number) => void;
  topOffset?: number;
}) => {
  const { state, move, canAcceptInput, undo, canUndo } = useGame();
  const { width: viewportWidth, height: viewportHeight } = useViewportSize();

  const {
    tileSize,
    cellSize,
    inset,
    gridDimension,
    boardDimension,
    outerPadding
  } = useMemo(() => {
    const availableWidth = Math.max(MIN_BOARD_SIZE, viewportWidth - 32);
    const availableHeight = Math.max(
      MIN_BOARD_SIZE,
      viewportHeight - topOffset - ADDITIONAL_PADDING
    );
    const maxBoard = Math.min(MAX_BOARD_SIZE, availableWidth, availableHeight);
    const rawSize = Math.max(
      68,
      (maxBoard - BOARD_GAP * (state.size - 1)) / state.size
    );
    const padding = Math.min(TILE_PADDING_MAX, rawSize * TILE_PADDING_RATIO);
    const tileSize = Math.max(42, rawSize - padding * 2);
    const cellSize = rawSize;
    const gridDimension =
      state.size * cellSize + (state.size - 1) * BOARD_GAP;
    const outerPadding = BOARD_GAP;
    const boardDimension = gridDimension + outerPadding * 2;
    return {
      tileSize,
      cellSize: rawSize,
      inset: padding,
      gridDimension,
      boardDimension,
      outerPadding
    };
  }, [state.size, viewportHeight, viewportWidth, topOffset]);

  const swipeHandlers = useSwipe(move, canAcceptInput, { suppressClickDuringSwipe: true });
  useKeyboard(move, canAcceptInput, canUndo ? undo : undefined);

  const backgroundCells = useMemo(
    () =>
      Array.from({ length: state.size * state.size }, (_, index) => (
        <BoardCell key={`cell-${index}`} />
      )),
    [state.size]
  );

  const totalWidth = Math.round(boardDimension);
  const tileAreaDimension = Math.round(gridDimension);
  const boardStyle = useMemo(
    () => ({
      "--cell-padding": `${inset}px`,
      "--outer-padding": `${outerPadding}px`,
      width: `${totalWidth}px`,
      height: `${Math.round(boardDimension)}px`
    }),
    [boardDimension, inset, outerPadding, totalWidth]
  );

  useEffect(() => {
    onBoardWidthChange?.(totalWidth);
  }, [onBoardWidthChange, totalWidth]);

  return (
    <BoardShell
      style={boardStyle as CSSProperties}
      role="application"
      aria-label="2048 board"
      {...swipeHandlers}
    >
      <BoardSurface $size={state.size}>
        {backgroundCells}
      </BoardSurface>
      <TilesLayer $dimension={tileAreaDimension}>
        {state.tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            dimension={tileSize}
            cellSize={cellSize}
            gap={BOARD_GAP}
            inset={inset}
          />
        ))}
      </TilesLayer>
    </BoardShell>
  );
};

