import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { useGame } from "../state/game_provider";
import { useViewportSize } from "../hooks/use_window_width";

const Panel = styled.div<{ $width: number }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  background: ${({ theme }) =>
    theme.appearance === "dark" ? theme.surfaceGlass : theme.surfaceGlassLight};
  border: 1px solid
    ${({ theme }) =>
      theme.appearance === "dark" ? theme.surfaceBorder : theme.surfaceBorderLight};
  border-radius: 18px;
  padding: 10px 14px;
  backdrop-filter: blur(18px);
  box-shadow: ${({ theme }) =>
      theme.appearance === "dark"
        ? "0 12px 26px rgba(5, 9, 19, 0.32), inset 0 0 0 1px rgba(255, 255, 255, 0.04)"
        : "0 10px 24px rgba(30, 40, 58, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.6)"};
  gap: 10px;
  width: ${({ $width }) => `${$width}px`};
  box-sizing: border-box;
`;

const MetricSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  padding: 8px 12px;
  background: ${({ theme }) =>
    theme.appearance === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(20, 24, 36, 0.04)"};
  border: 1px solid
    ${({ theme }) =>
      theme.appearance === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(54, 64, 82, 0.12)"};
`;

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) =>
    theme.appearance === "dark" ? theme.textSecondary : theme.textSecondaryLight};
`;

const MetricLabel = styled.span`
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const MetricValue = styled.span`
  font-size: clamp(22px, 2.2vw, 28px);
  font-weight: 600;
  color: ${({ theme }) =>
    theme.appearance === "dark" ? theme.textPrimary : theme.textPrimaryLight};
`;

export const ScorePanel = ({
  width,
  onHeightChange
}: {
  width: number | null;
  onHeightChange?: (height: number) => void;
}) => {
  const { state, bestScore } = useGame();
  const { width: viewportWidth } = useViewportSize();
  const padding = 24;
  const availableWidth = Math.max(240, viewportWidth - padding);
  const panelWidth =
    width !== null ? Math.round(width) : Math.min(availableWidth, 560);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!panelRef.current) {
      return;
    }
    const height = panelRef.current.getBoundingClientRect().height;
    onHeightChange?.(height);
  }, [panelWidth, state.score, state.moveCount, bestScore, onHeightChange]);

  return (
    <Panel ref={panelRef} $width={panelWidth}>
      <MetricSection>
        <Metric>
          <MetricLabel>Score</MetricLabel>
          <MetricValue>{state.score}</MetricValue>
        </Metric>
      </MetricSection>
      <MetricSection>
        <Metric>
          <MetricLabel>Best</MetricLabel>
          <MetricValue>{bestScore}</MetricValue>
        </Metric>
      </MetricSection>
      <MetricSection>
        <Metric>
          <MetricLabel>Moves</MetricLabel>
          <MetricValue>{state.moveCount}</MetricValue>
        </Metric>
      </MetricSection>
    </Panel>
  );
};

