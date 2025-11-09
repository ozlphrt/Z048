import { useCallback, useRef } from "react";
import type { MoveDirection } from "@modern2048/game_core";

interface PointerSnapshot {
  id: number;
  x: number;
  y: number;
  time: number;
}

interface SwipeHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerLeave: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
}

const SWIPE_THRESHOLD = 28;

export const useSwipe = (
  onDirection: (direction: MoveDirection) => void,
  enabled: boolean
): SwipeHandlers => {
  const pointerRef = useRef<PointerSnapshot | null>(null);

  const resetPointer = () => {
    pointerRef.current = null;
  };

  const resolveDirection = (dx: number, dy: number): MoveDirection | null => {
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
      return null;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  };

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled) {
        return;
      }
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      pointerRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: performance.now()
      };
    },
    [enabled]
  );

  const onPointerComplete = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled) {
        resetPointer();
        return;
      }
      const start = pointerRef.current;
      if (!start || start.id !== event.pointerId) {
        return;
      }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const direction = resolveDirection(dx, dy);
      resetPointer();
      if (direction) {
        onDirection(direction);
      }
    },
    [enabled, onDirection]
  );

  return {
    onPointerDown,
    onPointerUp: onPointerComplete,
    onPointerLeave: onPointerComplete,
    onPointerCancel: () => resetPointer()
  };
};

