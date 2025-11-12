# Project Overview — 2048 Modern Monorepo v0.1.0

## Vision
- Deliver a modern glassmorphic interpretation of 2048 with shared logic for web and future mobile builds.
- Prioritise smooth UX, responsive design, and installable PWA on the web.

## Scope (Phase 1)
- Platform: Web (React + Vite) with future React Native expansion.
- Core features: swipe/keyboard gameplay, undo, Supabase leaderboard, theme toggle.
- Deployment: GitHub Pages with PWA support.

## Milestones
1. Gameplay Core (web) — **completed**
2. Undo & scoring persistence — **completed**
3. Theme toggle & polish — **completed**
4. Supabase leaderboard integration — **deferred**
5. PWA hardening and GitHub Pages deployment — **completed**
6. Mobile (React Native) foundation

## Dependencies
- Node.js ≥ 18
- pnpm ≥ 8
- Supabase account (free tier)

## Links
- Rules: `CURSOR_RULES.md`
- Decisions log: `DECISIONS.md`
- Performance tracking: `PERFORMANCE_LOG.md`
## Project Overview

- **Project**: Cursor Glassmorphic 2048
- **Version**: v0.1.0
- **Scope**: Monorepo housing shared game logic and React-based web client (PWA-first) for the 2048 puzzle game.
- **Stack**: React 19 + Vite, React Context state, styled-components, Supabase (leaderboard coming in later milestones).

### Current Focus
PWA polish — manifest, offline caching, installability on GitHub Pages.

### Recent Changes
- 2025-11-12: Removed all in-app audio code/assets after repeated mobile latency regressions; revisit later with dedicated profiling.

### Milestones
1. Core gameplay UX — **done**
2. Undo + persistence — **done**
3. Theme toggle and polish — **done**
4. Online leaderboard integration — **pending**
5. PWA packaging and GitHub Pages deployment — **done**

### Repository Structure
- `apps/web`: Web application (React + Vite).
- `packages/game-core`: Shared TypeScript game logic package.
- `docs/*`: Reference markdowns (see root files per Cursor rules).

Context realigned successfully according to COORDINATE_CONVENTIONS.md.

