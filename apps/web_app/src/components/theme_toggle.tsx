import { useMemo } from "react";
import styled from "styled-components";
import { useThemeSwitcher } from "../state/theme_provider";

const ToggleButton = styled.button`
  appearance: none;
  border: none;
  border-radius: 16px;
  padding: 8px 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(68, 86, 226, 0.7), rgba(127, 89, 246, 0.82));
  color: #f6f7ff;
  box-shadow: 0 12px 24px rgba(60, 76, 200, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px);
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(73, 92, 225, 0.4);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.96);
  }
`;

const NextThemeSwatch = styled.span<{ $background: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ $background }) => $background};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
`;

export const ThemeToggle = () => {
  const { theme, availableThemes, setThemeByName } = useThemeSwitcher();
  const nextTheme = useMemo(() => {
    const currentIndex = availableThemes.findIndex((item) => item.name === theme.name);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    return availableThemes[nextIndex];
  }, [availableThemes, theme.name]);

  return (
    <ToggleButton
      type="button"
      onClick={() => setThemeByName(nextTheme.name)}
      aria-label={`Switch theme to ${nextTheme.title ?? nextTheme.name}`}
    >
      <span>{nextTheme.title ?? nextTheme.name}</span>
      <NextThemeSwatch $background={nextTheme.preview ?? nextTheme.surfaceGlass} />
    </ToggleButton>
  );
};

