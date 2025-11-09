import { useMemo } from "react";
import type { AppTheme } from "../theme/themes";

export const useThemeSequence = (themes: AppTheme[]) =>
  useMemo(
    () =>
      themes.map((theme, index) => ({
        current: theme,
        next: themes[(index + 1) % themes.length]
      })),
    [themes]
  );

