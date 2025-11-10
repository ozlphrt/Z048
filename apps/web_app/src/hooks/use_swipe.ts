import { useCallback, useRef } from "react";
import type { MoveDirection } from "@modern2048/game_core";

interface PointerSnapshot {
  id: number;
  x: number;
  y: number;
}

interface SwipeHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerLeave: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
}

interface SwipeOptions {
  suppressClickDuringSwipe?: boolean;
}

const SWIPE_THRESHOLD = 18;

export const useSwipe = (
  onDirection: (direction: MoveDirection) => void,
  enabled: boolean,
  options?: SwipeOptions
): SwipeHandlers => {
  const pointerRef = useRef<PointerSnapshot | null>(null);
  const swipingRef = useRef(false);

  const resetPointer = () => {
    pointerRef.current = null;
    swipingRef.current = false;
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
      if (event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      pointerRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
    },
    [enabled]
  );

  const releaseCapture = useCallback((event: React.PointerEvent) => {
    if (event.currentTarget.releasePointerCapture) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // capture might not be set; ignore
      }
    }
  }, []);

  const attemptResolve = useCallback(
    (event: React.PointerEvent) => {
      const start = pointerRef.current;
      if (!start || start.id !== event.pointerId) {
        return false;
      }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const direction = resolveDirection(dx, dy);
      if (direction) {
        pointerRef.current = null;
        swipingRef.current = true;
        onDirection(direction);
        releaseCapture(event);
        return true;
      }
      return false;
    },
    [onDirection, releaseCapture]
  );

  const onPointerComplete = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled) {
        resetPointer();
        return;
      }
      if (!attemptResolve(event)) {
        releaseCapture(event);
        resetPointer();
      }
    },
    [attemptResolve, enabled, releaseCapture]
  );

  return {
    onPointerDown,
    onPointerMove: (event) => {
      if (!enabled) {
        return;
      }
      if (attemptResolve(event) && options?.suppressClickDuringSwipe) {
        event.preventDefault();
      }
    },
    onPointerUp: onPointerComplete,
    onPointerLeave: onPointerComplete,
    onPointerCancel: (event) => {
      releaseCapture(event);
      resetPointer();
    }
  };
};

