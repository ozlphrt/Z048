import { useCallback, useState } from "react";
import styled from "styled-components";
import { GameBoard } from "./components/game_board";
import { ScorePanel } from "./components/score_panel";
import { ActionBar } from "./components/action_bar";
import { MobileSwipePad } from "./components/mobile_swipe_pad";

const Shell = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px 24px;
`;

export default function App() {
  const [boardWidth, setBoardWidth] = useState<number | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [actionHeight, setActionHeight] = useState(0);

  const handleBoardWidth = useCallback((width: number) => {
    setBoardWidth((prev) => (prev === width ? prev : width));
  }, []);

  const handlePanelHeight = useCallback((height: number) => {
    setPanelHeight((prev) => (Math.abs(prev - height) < 1 ? prev : height));
  }, []);

  const handleActionHeight = useCallback((height: number) => {
    setActionHeight((prev) => (Math.abs(prev - height) < 1 ? prev : height));
  }, []);

  return (
    <Shell style={boardWidth ? { maxWidth: `${Math.max(boardWidth, 320)}px` } : undefined}>
      <ScorePanel width={boardWidth} onHeightChange={handlePanelHeight} />
      <GameBoard
        onBoardWidthChange={handleBoardWidth}
        topOffset={panelHeight + actionHeight + 48}
      />
      <ActionBar width={boardWidth} onHeightChange={handleActionHeight} />
      <MobileSwipePad width={boardWidth} />
    </Shell>
  );
}

