import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { getThemes, type AppTheme } from "../theme/themes";

const THEME_STORAGE_KEY = "modern2048.theme";
const APPEARANCE_STORAGE_KEY = "modern2048.appearance";

interface ThemeContextValue {
  theme: AppTheme;
  availableThemes: AppTheme[];
  appearance: "light" | "dark";
  setThemeByName: (name: string) => void;
  toggleAppearance: () => void;
  setAppearance: (mode: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const themeCollection = getThemes();
const defaultTheme = themeCollection.ember ?? Object.values(themeCollection)[0];
const themeEntries = Object.values(themeCollection);

const getInitialTheme = (): AppTheme => {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const match = themeEntries.find((item) => item.name === saved);
      if (match) {
        return match;
      }
    }
  }
  return defaultTheme;
};

const getInitialAppearance = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  }
  return "dark";
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const [appearance, setAppearance] = useState<"light" | "dark">(getInitialAppearance);

  const setThemeByName = useCallback((name: string) => {
    const next = themeEntries.find((item) => item.name === name);
    if (!next) {
      return;
    }
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, next.name);
    }
  }, []);

  const toggleAppearance = useCallback(() => {
    setAppearance((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const handleSetAppearance = useCallback((mode: "light" | "dark") => {
    setAppearance(mode);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
  }, [appearance]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handlePreferenceChange = () => {
      if (!window.localStorage.getItem(APPEARANCE_STORAGE_KEY)) {
        setAppearance(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", handlePreferenceChange);
    return () => {
      media.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      availableThemes: themeEntries,
      appearance,
      setThemeByName,
      toggleAppearance,
      setAppearance: handleSetAppearance
    }),
    [theme, appearance, setThemeByName, toggleAppearance, handleSetAppearance]
  );

  const themedValue = useMemo(
    () => ({
      ...theme,
      appearance
    }),
    [theme, appearance]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={themedValue}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeSwitcher = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeSwitcher must be used within ThemeProvider.");
  }
  return context;
};

