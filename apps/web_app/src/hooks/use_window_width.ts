import { useEffect, useState } from "react";

interface ViewportSize {
  width: number;
  height: number;
}

const getInitialSize = (): ViewportSize => {
  if (typeof window !== "undefined") {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 1024, height: 768 };
};

export const useViewportSize = () => {
  const [size, setSize] = useState<ViewportSize>(getInitialSize);

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
};

