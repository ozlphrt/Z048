import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: ${({ theme }) => (theme.appearance === "dark" ? "dark" : "light")};
  }

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    margin: 0;
  }

  body {
    font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: ${({ theme }) =>
      theme.appearance === "dark" ? theme.background.dark : theme.background.light};
    color: ${({ theme }) =>
      theme.appearance === "dark" ? theme.textPrimary : theme.textPrimaryLight};
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: clamp(8px, 2vw, 16px) clamp(12px, 3vw, 24px) clamp(12px, 3vw, 24px);
    overflow: hidden;
  }

  button {
    font-family: inherit;
  }
`;

