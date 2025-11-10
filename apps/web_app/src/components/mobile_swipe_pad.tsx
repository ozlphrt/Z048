import { useMemo } from "react";
import styled from "styled-components";
import { useGame } from "../state/game_provider";
import { useSwipe } from "../hooks/use_swipe";

const PadShell = styled.div<{ $width: number }>`
  display: none;

  @media (pointer: coarse) {
    display: block;
    width: ${({ $width }) => `${$width}px`};
    touch-action: none;
    user-select: none;
    margin-top: 16px;
    border-radius: 28px;
    border: 1px solid
      ${({ theme }) =>
        theme.appearance === "dark" ? theme.boardOutline : theme.boardOutlineLight};
    background: ${({ theme }) =>
      theme.appearance === "dark" ? "rgba(20, 10, 8, 0.84)" : "rgba(240, 216, 208, 0.55)"};
    box-shadow: ${({ theme }) =>
        theme.appearance === "dark"
          ? "inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 20px 44px rgba(8, 6, 2, 0.35)"
          : "inset 0 0 0 1px rgba(120, 54, 32, 0.14), 0 16px 32px rgba(120, 68, 42, 0.18)"};
    min-height: clamp(110px, 24vh, 160px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
`;

const Hint = styled.span`
  pointer-events: none;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.22);

  @media (pointer: coarse) and (prefers-color-scheme: light) {
    color: rgba(60, 20, 10, 0.22);
  }
`;

export const MobileSwipePad = ({ width }: { width: number | null }) => {
  const { move, canAcceptInput } = useGame();
  const swipeHandlers = useSwipe(move, canAcceptInput, { suppressClickDuringSwipe: true });

  const padWidth = useMemo(() => Math.max(320, width ?? 320), [width]);

  return (
    <PadShell $width={padWidth} {...swipeHandlers} aria-hidden="true">
      <Hint>SWIPE</Hint>
    </PadShell>
  );
};


