# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Chirp is the React frontend of a Twitter/X clone. The backend is a separate repo ([Chirp-api](https://github.com/RaphaelM20/Chirp-api): Express, Passport, Prisma, PostgreSQL). This repo contains no API code, so any change to endpoints or response shapes has to be made there. It is deployed to Netlify.

## Commands

```bash
npm run dev      # Vite dev server (default http://localhost:5173)
npm run build    # production build to dist/
npm run lint     # ESLint (flat config: recommended, react-hooks, react-refresh)
npm run preview  # serve the built dist/
```

There is no test suite. Plain JavaScript/JSX, no TypeScript.

`.env` must define `VITE_API_URL` (e.g. `http://localhost:3000` when running the API locally). The API has to be running too; the app shows a connection-error screen without it.

## Architecture

- **Guest mode**: every API read requires a JWT, so a visitor with no token is signed in silently as the shared `guest` / `guest123` account ([AuthProvider.jsx](src/components/AuthProvider.jsx)). Guests can browse everything, but writes go through `requireAccount(action)`, which opens a sign-up prompt instead of calling the API. Logging out also falls back to a guest session.
- **Auth state** lives in `AuthContext` ([src/lib/auth.js](src/lib/auth.js) + `AuthProvider`): `token`, `user`, `isGuest`, `login`, `signup`, `logout`, and follow helpers. The user's `id` comes from `/user/me` (falling back to the JWT for older API deploys). Follow state is stored on `user.following`, so every `FollowButton` stays in sync. The token is in `localStorage` (`authToken`) and the session kind in `authSession` (`guest` | `user`).
- **API client** ([src/lib/api.js](src/lib/api.js)): all requests go through `request()`, which adds the bearer token, parses JSON or text, and throws `ApiError` (`status`, `data`) on non-2xx responses. A 401 on an authenticated request clears the session. Keep endpoint strings in `api` / `paths` rather than calling `fetch` directly.
- **Reads** use `useApi(path)` ([src/hooks/useApi.js](src/hooks/useApi.js)), which returns `{ data, error, loading, retry, setData }`. Loading is derived from a request key, not set inside the effect, because the `react-hooks` lint rules forbid synchronous `setState` in effects. Unknown profiles and posts return 404 (older API deploys returned 200 + `null`; both render the not-found state).
- **Lists** (Home's Following/Explore tabs and profile tabs) use `useInfiniteApi(path)` ([src/hooks/useInfiniteApi.js](src/hooks/useInfiniteApi.js)) against cursor-paginated endpoints that return `{ items, nextCursor }` (`/posts?limit=`, `/explore`, `/users/:username/:tab`), with [LoadMore.jsx](src/components/LoadMore.jsx) as the infinite-scroll trigger. The profile header comes from `/:username?include=summary`. The Home tab is kept in `?feed=`, and guests default to Explore.
- **API validation** errors come back as `{ errors: [{ msg, path }] }`; `fieldErrors(err)` maps them onto form fields.
- **Writes** are applied locally rather than re-fetched: likes and follows are optimistic and roll back with an error toast (`useToast`) if the request fails. New posts and replies are merged into local state from the response.
- **Routing** ([src/App.jsx](src/App.jsx)): `AuthLayout` wraps `/login` and `/signup`, and redirects members away (to `location.state.from`). `Layout` wraps everything else. `/:username/:id` and `/:username` are catch-all dynamic segments, and `*` renders the 404 page. `ProfilePage` is keyed by username so its state resets when switching profiles.
- **Modals** use native `<dialog>` via [Modal.jsx](src/components/Modal.jsx). `showModal()` steals focus, so mark a field with `data-autofocus` to focus it instead.
- **Styling**: one global stylesheet, [src/index.css](src/index.css), built on CSS custom properties (colors, 4px spacing scale, radii, type sizes, shadows) with light and dark themes via `prefers-color-scheme`. Breakpoints: ≥1024px three columns, 640–1023px icon-only sidebar and no rail, <640px mobile header and bottom tab bar. Use the tokens rather than raw values, and keep text at WCAG AA contrast in both themes.
- **Deployment**: [public/_redirects](public/_redirects) (`/* /index.html 200`) enables SPA fallback on Netlify. Keep it when adding routes.
