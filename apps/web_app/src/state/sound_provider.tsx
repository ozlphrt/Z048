import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { hybridAudioEngine, type SoundEffect } from "../audio/hybrid_audio_engine";

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
  const [mobileMuted, setMobileMuted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const media = window.matchMedia("(pointer: coarse)");
    const update = () => setMobileMuted(media.matches);
    update();
    const handler = () => update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, []);

  const effectiveEnabled = !mobileMuted && enabled;

  useEffect(() => {
    hybridAudioEngine.setEnabled(effectiveEnabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, effectiveEnabled ? "on" : "off");
      if (effectiveEnabled) {
        const prewarm = () => {
          window.removeEventListener("pointerdown", prewarm, true);
          window.removeEventListener("keydown", prewarm, true);
          void hybridAudioEngine.prewarm();
        };
        window.addEventListener("pointerdown", prewarm, { capture: true, once: true });
        window.addEventListener("keydown", prewarm, { capture: true, once: true });
      }
    }
  }, [effectiveEnabled]);

  const play = useCallback(
    (effect: SoundEffect, payload?: { magnitude?: number }) => {
      if (!effectiveEnabled) {
        return;
      }
      void hybridAudioEngine.play(effect, payload);
    },
    [effectiveEnabled]
  );

  const toggle = useCallback(() => {
    if (mobileMuted) {
      return;
    }
    setEnabled((prev) => !prev);
  }, [mobileMuted]);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled: effectiveEnabled,
      toggle,
      play
    }),
    [effectiveEnabled, play, toggle]
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


