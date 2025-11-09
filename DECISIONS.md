# Decisions Log — v0.1.0

| Date | Decision | Context | Notes |
|------|----------|---------|-------|
| 2025-11-09 | Stack: React + React Native monorepo | User preference + shared logic needs | Web-first delivery, mobile later |
| 2025-11-09 | Styling via styled-components | Consistent theming + RN compatibility | Enables glassmorphic design |
| 2025-11-09 | Leaderboard via Supabase | Free tier requirement | Implement in later milestone |
| 2025-11-09 | Deployment: Web + PWA + GitHub Pages | Phase 1 scope | Mobile deferred |
| 2025-11-09 | Undo stored locally with history cap | Acceptance Criterion 2 | Persisted via localStorage with 16-step limit |
## Decisions Log

| Date (UTC) | Decision | Rationale | Impact |
|------------|----------|-----------|--------|
| 2025-11-09 | React + React Native monorepo | Shared TypeScript logic, future mobile expansion | Guides repo structure |
| 2025-11-09 | styled-components for theming | Glassmorphic styling with theme toggles | Drives UI implementation |
| 2025-11-09 | Supabase for leaderboard | Free tier, quick REST integration | Deferred to AC3 |
| 2025-11-09 | Phase 1 web-only PWA | Deliverable via GitHub Pages before mobile | Deployment plan |

