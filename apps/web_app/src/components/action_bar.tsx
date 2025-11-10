import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { useGame } from "../state/game_provider";
import { useThemeSwitcher } from "../state/theme_provider";
import { useSound } from "../state/sound_provider";

const Bar = styled.div<{ $width: number }>`
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  width: ${({ $width }) => `${$width}px`};
  gap: 10px;
  align-items: center;
  box-sizing: border-box;
`;

const baseGlassSurface = (appearance: "light" | "dark") =>
  appearance === "dark"
    ? `
        background: rgba(255, 255, 255, 0.1);
        color: rgba(244, 246, 255, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.24);
        box-shadow: 0 10px 18px rgba(12, 18, 32, 0.28);
      `
    : `
        background: rgba(18, 28, 46, 0.05);
        color: rgba(18, 30, 48, 0.88);
        border: 1px solid rgba(110, 128, 160, 0.2);
        box-shadow: 0 8px 16px rgba(30, 38, 62, 0.12);
      `;

const ActionButton = styled.button`
  appearance: none;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
  ${({ theme }) => baseGlassSurface(theme.appearance)}

  &:hover:enabled {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }

  &:active:enabled {
    transform: translateY(0);
    filter: brightness(0.96);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;

const UndoButton = styled.button`
  appearance: none;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
  ${({ theme }) =>
    theme.appearance === "dark"
      ? `
        background: radial-gradient(circle at top, rgba(255,255,255,0.18), rgba(110,130,180,0.12));
        box-shadow: 0 12px 22px rgba(8, 12, 24, 0.42), inset 0 0 0 1px rgba(255,255,255,0.18);
        color: rgba(240, 244, 255, 0.95);
      `
      : `
        background: radial-gradient(circle at top, rgba(210, 224, 255, 0.9), rgba(156, 174, 214, 0.55));
        box-shadow: 0 10px 18px rgba(32, 42, 72, 0.16), inset 0 0 0 1px rgba(255,255,255,0.6);
        color: rgba(30, 42, 68, 0.9);
      `}

  &:hover:enabled {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }

  &:active:enabled {
    transform: translateY(0);
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;

const ThemeNameButton = styled.button`
  appearance: none;
  background: none;
  border: none;
  color: ${({ theme }) =>
    theme.appearance === "dark" ? "rgba(227, 235, 255, 0.75)" : "rgba(32, 42, 62, 0.78)"};
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  cursor: pointer;
  transition: color 150ms ease;
  justify-self: flex-start;

  &:hover {
    color: ${({ theme }) => (theme.appearance === "dark" ? "#f2f5ff" : "#12203a")};
  }
`;

const AppearanceToggle = styled.button<{ $mode: "light" | "dark" }>`
  position: relative;
  appearance: none;
  border: none;
  border-radius: 999px;
  width: 68px;
  height: 32px;
  padding: 4px;
  cursor: pointer;
  transition: filter 160ms ease;
  ${({ theme }) => baseGlassSurface(theme.appearance)}
  display: inline-flex;
  align-items: center;
  justify-content: ${({ $mode }) => ($mode === "dark" ? "flex-end" : "flex-start")};

  &:hover {
    filter: brightness(1.04);
  }
`;

const ToggleHandle = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  color: #111827;
  box-shadow: 0 6px 12px rgba(17, 24, 39, 0.18);
  font-size: 14px;
`;

const Icon = styled.svg`
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const SoundButton = styled(ActionButton)<{ $active: boolean }>`
  ${({ $active }) => (!$active ? "opacity: 0.6;" : "")}
`;

export const ActionBar = ({
  width,
  onHeightChange
}: {
  width: number | null;
  onHeightChange?: (height: number) => void;
}) => {
  const { undo, canUndo, reset } = useGame();
  const { theme, availableThemes, setThemeByName, appearance, toggleAppearance } =
    useThemeSwitcher();
  const { enabled: soundEnabled, toggle: toggleSound, play } = useSound();

  const barWidth = width ?? 320;
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!barRef.current) {
      return;
    }
    const height = barRef.current.getBoundingClientRect().height;
    onHeightChange?.(height);
  }, [barWidth, onHeightChange, theme.name, appearance]);

  const handleThemeToggle = () => {
    const currentIndex = availableThemes.findIndex((item) => item.name === theme.name);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setThemeByName(availableThemes[nextIndex].name);
  };

  const handleUndo = () => {
    if (!canUndo) {
      return;
    }
    undo();
    play("undo");
  };

  const handleReset = () => {
    reset();
    play("reset");
  };

  return (
    <Bar ref={barRef} $width={barWidth}>
      <UndoButton type="button" onClick={handleUndo} disabled={!canUndo} aria-label="Undo">
        <Icon viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-7.64 14.66" />
          <path d="M3 4v5h5" />
        </Icon>
      </UndoButton>
      <ThemeNameButton type="button" onClick={handleThemeToggle}>
        {theme.title ?? theme.name}
      </ThemeNameButton>
      <SoundButton
        type="button"
        onClick={toggleSound}
        $active={soundEnabled}
        aria-pressed={soundEnabled}
        aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? "🔈 Sound" : "🔇 Sound"}
      </SoundButton>
      <AppearanceToggle
        type="button"
        onClick={toggleAppearance}
        $mode={appearance}
        aria-label={appearance === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <ToggleHandle>{appearance === "dark" ? "☀" : "☾"}</ToggleHandle>
      </AppearanceToggle>
      <ActionButton type="button" onClick={handleReset}>
        New Game
      </ActionButton>
    </Bar>
  );
};

