import { useLayoutEffect, useRef } from "react";
import styled, { css, keyframes, useTheme } from "styled-components";
import type { TileState } from "@modern2048/game_core";
import { ANIMATION_DURATION } from "../constants/layout";
import type { AppTheme, TileVisual } from "../theme/themes";

const popIn = keyframes`
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const mergePulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
`;

const TileContainer = styled.div<{
  $dimension: number;
  $radius: number;
}>`
  position: absolute;
  width: ${({ $dimension }) => $dimension}px;
  height: ${({ $dimension }) => $dimension}px;
  border-radius: ${({ $radius }) => $radius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  will-change: transform;
  transition: transform ${ANIMATION_DURATION}ms cubic-bezier(0.18, 0.89, 0.32, 1.28);
`;

const TileSurface = styled.div<{
  $visual: TileVisual;
  $radius: number;
  $isNew: boolean;
  $isMerged: boolean;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: ${({ $radius }) => $radius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: clamp(28px, 2.4vw, 34px);
  color: ${({ $visual }) => $visual.foreground};
  background: ${({ $visual }) => $visual.background};
  box-shadow: ${({ theme }) =>
    theme.appearance === "dark" ? theme.tileShadow : theme.tileShadowLight};
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px);
  transition: background 180ms ease, box-shadow 200ms ease, color 200ms ease;
  z-index: 1;
  ${({ $isNew }) =>
    $isNew &&
    css`
      animation: ${popIn} 220ms cubic-bezier(0.18, 0.89, 0.32, 1.28);
    `}
  ${({ $isMerged }) =>
    $isMerged &&
    css`
      animation: ${mergePulse} 200ms ease;
    `}
`;

const TileBackdrop = styled.div<{ $visual: TileVisual; $radius: number }>`
  position: absolute;
  inset: -8px;
  border-radius: ${({ $radius }) => $radius + 6}px;
  background: ${({ $visual }) => $visual.backdrop};
  filter: blur(18px);
  opacity: 0.6;
  z-index: -1;
`;

const trailFade = keyframes`
  0% {
    opacity: 0.32;
    transform: scale(1) translate3d(0, 0, 0);
  }
  100% {
    opacity: 0;
    transform: scale(1.08) translate3d(0, 0, 0);
  }
`;

const TileTrail = styled.div<{
  $visual: TileVisual;
  $radius: number;
}>`
  position: absolute;
  inset: 0;
  border-radius: ${({ $radius }) => $radius}px;
  background: ${({ $visual }) => $visual.background};
  filter: blur(16px);
  opacity: 0;
  pointer-events: none;
  animation: ${trailFade} ${ANIMATION_DURATION}ms ease forwards;
  z-index: 0;
`;

interface TileProps {
  tile: TileState;
  dimension: number;
  cellSize: number;
  gap: number;
  inset: number;
}

const getVisual = (theme: AppTheme, value: number): TileVisual =>
  theme.tilePalette.get(value) ?? theme.defaultTile;

const deriveRadius = (dimension: number) => Math.max(16, Math.round(dimension * 0.24));

const translateForPosition = (
  cellSize: number,
  gap: number,
  inset: number,
  position: { row: number; col: number }
) => {
  const step = cellSize + gap;
  const x = position.col * step + inset;
  const y = position.row * step + inset;
  return `translate3d(${x}px, ${y}px, 0)`;
};

export const Tile = ({ tile, dimension, cellSize, gap, inset }: TileProps) => {
  const theme = useTheme();
  const visual = getVisual(theme, tile.value);
  const radius = deriveRadius(dimension);
  const nodeRef = useRef<HTMLDivElement>(null);
  const initialTransform = translateForPosition(
    cellSize,
    gap,
    inset,
    tile.previousPosition ?? tile.position
  );

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) {
      return;
    }

    const finalTransform = translateForPosition(cellSize, gap, inset, tile.position);
    const startingTransform = tile.previousPosition
      ? translateForPosition(cellSize, gap, inset, tile.previousPosition)
      : finalTransform;

    if (tile.previousPosition) {
      node.style.transition = "none";
      node.style.transform = startingTransform;
      // Force layout before applying transition
      node.getBoundingClientRect();
      requestAnimationFrame(() => {
        node.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.18, 0.89, 0.32, 1.28)`;
        node.style.transform = finalTransform;
      });
    } else {
      node.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.18, 0.89, 0.32, 1.28)`;
      node.style.transform = finalTransform;
    }
  }, [
    dimension,
    gap,
    tile.position.col,
    tile.position.row,
    tile.previousPosition?.col,
    tile.previousPosition?.row
  ]);

  return (
    <TileContainer
      ref={nodeRef}
      style={{ transform: initialTransform }}
      $dimension={dimension}
      $radius={radius}
    >
      {tile.previousPosition && !tile.isMergedResult && (
        <TileTrail $visual={visual} $radius={radius} />
      )}
      <TileBackdrop $visual={visual} $radius={radius} />
      <TileSurface
        $visual={visual}
        $radius={radius}
        $isNew={Boolean(tile.isNew)}
        $isMerged={Boolean(tile.isMergedResult)}
      >
        {tile.value}
      </TileSurface>
    </TileContainer>
  );
};

