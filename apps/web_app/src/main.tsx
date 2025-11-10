import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { GameProvider } from "./state/game_provider";
import { GlobalStyles } from "./styles/global_styles";
import { ThemeProvider } from "./state/theme_provider";
import { SoundProvider } from "./state/sound_provider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <GlobalStyles />
        <GameProvider>
          <App />
        </GameProvider>
      </SoundProvider>
    </ThemeProvider>
  </StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // Ignore registration failures; app will continue to function online.
      });
  });
}

