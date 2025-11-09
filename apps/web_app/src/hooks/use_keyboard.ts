import { useEffect } from "react";
import type { MoveDirection } from "@modern2048/game_core";

const keyToDirection: Record<string, MoveDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right"
};

export const useKeyboard = (
  onDirection: (direction: MoveDirection) => void,
  enabled: boolean,
  onUndo?: () => void
) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        onUndo &&
        ((event.key === "z" || event.key === "Z") && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault();
        onUndo();
        return;
      }
      if (onUndo && (event.key === "q" || event.key === "Q")) {
        event.preventDefault();
        onUndo();
        return;
      }
      if (!enabled) {
        return;
      }
      const direction = keyToDirection[event.key];
      if (!direction) {
        return;
      }
      event.preventDefault();
      onDirection(direction);
    };
    window.addEventListener("keydown", handler, { passive: false });
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [enabled, onDirection, onUndo]);
};

