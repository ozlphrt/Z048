import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { GameProvider } from "./state/game_provider";
import { GlobalStyles } from "./styles/global_styles";
import { ThemeProvider } from "./state/theme_provider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <GlobalStyles />
      <GameProvider>
        <App />
      </GameProvider>
    </ThemeProvider>
  </StrictMode>
);

