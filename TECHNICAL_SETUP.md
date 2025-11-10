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

## Scripts
- `pnpm dev` — Start web app in dev mode.
- `pnpm lint` — Run linting across workspace.
- `pnpm test` — Execute unit tests.
- `pnpm --filter web_app build` — Production build (set `GITHUB_PAGES=true` before running to emit correct base path).
- `node scripts/generate-icons.cjs` — Regenerate PWA icons (`apps/web_app/public/icons/*`).

## PWA Notes
- `apps/web_app/public/manifest.webmanifest` defines install metadata; keep `start_url`/`scope` aligned with `vite.config.ts` base logic.
- `apps/web_app/public/sw.js` implements a lightweight stale-while-revalidate cache for app shell assets.
- Service worker registration lives in `apps/web_app/src/main.tsx` and only runs in production builds.
- When updating brand assets, regenerate icons and redeploy (`docs/` folder) so GitHub Pages serves the latest bundle.

## Audio
- Procedural “wood click” palette generated in `apps/web_app/src/audio/sound_engine.ts` (no external assets).
- `SoundProvider` (wrapped in `main.tsx`) manages enable/disable state with local storage persistence.
- Toggle control lives in `ActionBar`; gameplay events trigger sounds via `useSound()` inside `GameBoard`.
## Technical Setup

### Prerequisites
- Node.js 18.18+ (aligns with npm 10).
- npm workspaces enabled (default for npm 7+).

