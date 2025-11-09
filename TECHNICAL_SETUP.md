# Technical Setup — v0.1.0

## Tooling
- **Package manager:** pnpm (workspace)
- **Frontend bundler:** Vite (React + TypeScript)
- **Styling:** styled-components
- **Testing:** Vitest + React Testing Library
- **Linting/Formatting:** ESLint + Prettier

## Requirements
1. Install Node.js ≥ 18 and pnpm ≥ 8.
2. Clone repository and run `pnpm install`.
3. Launch development server with `pnpm --filter web_app dev`.

## Monorepo Layout
```
/
├─ apps/
│  └─ web_app/
└─ packages/
   └─ game_core/
```

## Environment Variables
- Supabase keys (for later phases) will live in `.env` files per app.

## Scripts (planned)
- `pnpm dev` — Start web app in dev mode.
- `pnpm lint` — Run linting across workspace.
- `pnpm test` — Execute unit tests.
## Technical Setup

### Prerequisites
- Node.js 18.18+ (aligns with npm 10).
- npm workspaces enabled (default for npm 7+).

