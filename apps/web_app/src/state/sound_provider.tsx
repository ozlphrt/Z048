import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { webAudioEngine, type SoundEffect } from "../audio/web_audio_engine";

const STORAGE_KEY = "modern2048.sound";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  play: (effect: SoundEffect, payload?: { magnitude?: number }) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const getInitialPreference = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "on") {
    return true;
  }
  if (stored === "off") {
    return false;
  }
  return true;
};

export const SoundProvider = ({ children }: PropsWithChildren) => {
  const [enabled, setEnabled] = useState<boolean>(getInitialPreference);

  useEffect(() => {
    webAudioEngine.setEnabled(enabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
      if (enabled) {
        const prewarm = () => {
          window.removeEventListener("pointerdown", prewarm, true);
          window.removeEventListener("keydown", prewarm, true);
          void webAudioEngine.prewarm();
        };
        window.addEventListener("pointerdown", prewarm, { capture: true, once: true });
        window.addEventListener("keydown", prewarm, { capture: true, once: true });
      }
    }
  }, [enabled]);

  const play = useCallback((effect: SoundEffect, payload?: { magnitude?: number }) => {
    void webAudioEngine.play(effect, payload);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled,
      toggle,
      play
    }),
    [enabled, play, toggle]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useSound = (): SoundContextValue => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used inside SoundProvider.");
  }
  return context;
};


