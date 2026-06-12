# 🏀 Sorteador de Times — Basketball Team Divider

A full-stack platform — **web app + native mobile app** sharing one API — that builds **fair, balanced teams for pickup basketball games**. No more endless arguing at the court about who plays with whom.

## 🌐 Live in Production

**The app is live at [draftsquad.up.railway.app](https://draftsquad.up.railway.app/)** — deployed on Railway and used every week by a real organization (**Boomerangs Basketball**) to draw its game-day teams.

---

Players are registered with a position, a skill rating and their height. When game day comes, you pick who showed up, choose a format, and a multi-factor draft algorithm splits everyone into balanced teams in one click — with drag-and-drop fine-tuning, shareable results and full division history.

---

## ✨ Features

- **Balanced team generation** — serpentine draft weighing skill, position and height (see [the algorithm](#-the-balancing-algorithm))
- **Two game formats** — 2 teams (min. 4 players) or 4 teams in 2 groups with carry-over score: Red 1 × Black 1, then Red 2 × Black 2
- **Hard fairness guarantees** — centers are always split evenly between sides; opposing teams get matched by total skill
- **Player self-registration** — share a public link (`/<org-slug>/addPlayer`); newcomers register themselves and wait in an approval queue until an admin rates them
- **Real-time notifications** — WebSocket-powered (Django Channels + Redis) alerts when a player signs up
- **Drag-and-drop adjustments** — manually move players between teams after the draw, persisted instantly
- **Share the result** — copy the division as a clean image or as formatted text, straight to the group chat
- **Division history** — every draw is saved and browsable by date
- **Multi-tenant** — each organization sees only its own players and divisions
- **i18n** — Portuguese (pt-BR) and English, on web and mobile
- **Mobile-first UI** — responsive web designed for the phone you're holding courtside
- **Native mobile app** — dark-first React Native (Expo) app with gesture drag-and-drop, haptics and an animated team reveal (see [Mobile App](#-mobile-app--react-native-expo))

## 🧠 The Balancing Algorithm

The core of the project lives in [`backend/apps/divisions/algorithm.py`](backend/apps/divisions/algorithm.py) — a **serpentine draft with cost-based placement**:

1. Players are sorted by quality (with a scarcity bonus for centers and tall players) and drafted one by one.
2. Each placement minimizes a weighted imbalance cost:

   | Factor   | Weight |
   |----------|--------|
   | Quality  | 3.0    |
   | Position | 1.5    |
   | Height   | 1.0    |

3. On top of the soft cost, **hard invariants** are enforced:
   - **Even center split** — centers are drafted first and may only join the side with the fewest centers, guaranteeing a max difference of 1 at every level (teams, groups and subteams). Born from a real production division that ended 3×1 in centers — now covered by a regression test that provably fails on the old algorithm.
   - **Tall-center separation** — pairs of tall centers with similar ratings are pre-assigned to opposite teams.
   - **Matchup quality balance (4-team mode)** — a greedy post-pass swaps players between subteams of the same group to minimize the skill gap of the actual games (Red 1 × Black 1, Red 2 × Black 2), without breaking sizes or the center rule.
4. **Variety between draws** — an injectable RNG shuffles tie-breaks between equivalent players, so the same roster doesn't produce the same teams every week, while every balance guarantee still holds (and stays fully deterministic in tests).

## 🏗 Architecture

Monorepo with two decoupled clients consuming one REST + WebSocket API, fully containerized:

```
┌──────────────────┐                   ┌──────────────────┐
│     Next.js      │    REST (JWT)     │   Django + DRF   │
│   web  :3000     │ ◄───────────────► │    api  :8000    │
└──────────────────┘    WebSocket      └────────┬─────────┘
┌──────────────────┐ ◄───────────────►          │
│  React Native    │                ┌───────────┴─────────────┐
│  (Expo) mobile   │                │ PostgreSQL 16   Redis 7 │
└──────────────────┘                │  (data)      (channels) │
                                    └─────────────────────────┘
```

### Backend — Django 5.1 + DRF

| Concern        | Choice                                                                  |
|----------------|-------------------------------------------------------------------------|
| Auth           | JWT (`djangorestframework-simplejwt`), login by email                   |
| Real-time      | Django Channels + Redis, JWT-authenticated WebSocket middleware         |
| Multi-tenancy  | `OrganizationQuerySetMixin` scopes every queryset to the user's org     |
| IDs            | UUID primary keys across all models                                     |
| Apps           | `accounts` (User + Organization) · `players` · `divisions` · `notifications` |

### Frontend — Next.js 15 (App Router) + React 19

| Concern        | Choice                                                                  |
|----------------|-------------------------------------------------------------------------|
| UI             | MUI v7 components + Tailwind CSS v4 for layout (CSS layers, no clashes) |
| Server state   | TanStack Query                                                          |
| Client state   | Zustand                                                                 |
| Forms          | react-hook-form + zod                                                   |
| Drag-and-drop  | @dnd-kit                                                                |
| i18n           | next-intl (pt-BR / en)                                                  |
| HTTP           | Axios with interceptors: token attach + single-flight refresh on 401    |

## 📱 Mobile App — React Native (Expo)

A native iOS/Android client in [`mobile/`](mobile/) with full feature parity with the web app and a **dark-first design system** built from scratch (tokens, motion presets, team identities — documented in [`mobile/DESIGN_BRIEF.md`](mobile/DESIGN_BRIEF.md)). Each stack choice has a reason:

| Choice | Why |
|--------|-----|
| **Expo + Expo Go** | Zero native toolchain to contribute: clone, `npx expo start`, scan a QR code. Every dependency was deliberately kept Expo Go-compatible — no custom dev client needed. |
| **expo-router** | File-based routing (same mental model as Next.js App Router on the web side), typed routes, and declarative auth guards via `Stack.Protected`. |
| **TypeScript strict** | The API contract is fully typed; domain types are shared 1:1 with the web app's. |
| **TanStack Query** | One server-state layer across web and mobile with identical query keys and invalidation rules — and built-in optimistic updates with rollback for the drag-and-drop move. |
| **Zustand** | Tiny auth/session store; no boilerplate for a store that holds one user. |
| **Reanimated + Gesture Handler** | All motion runs on the UI thread at 60fps. Powers the signature **team reveal** (staggered cards + haptics + count-up totals) and a **custom drag-and-drop engine** (~250 lines: long-press lift, drop-zone hit-testing corrected by scroll offset, edge auto-scroll) — no RN library handles container-to-container DnD inside a ScrollView, so it was built from scratch, with a tap-to-move bottom sheet as the accessible fallback. |
| **NativeWind (Tailwind)** | Same styling vocabulary as the web app, backed by a single design-tokens module so no component hardcodes a color. |
| **expo-secure-store** | Refresh tokens live in the iOS Keychain / Android Keystore — never in plain storage; access tokens stay in memory only. |
| **i18next + ICU** | Reuses the web app's pt-BR/en message catalogs **byte-for-byte** (they use ICU plurals), so shared texts are identical across platforms. |
| **react-native-view-shot + expo-sharing** | Share the division as a PNG straight to WhatsApp, mirroring the web's image export. |

Networking is zero-config in development: the app derives the dev machine's LAN IP from the Expo dev server, so a physical phone, the iOS Simulator and the Android emulator all reach the local Django API without editing a single file (the Android emulator's loopback is handled automatically).

## 🚀 Getting Started

The only prerequisite is **Docker** (with Compose).

```bash
git clone https://github.com/DiegoCampos1/BasketRandomizerApp.git
cd BasketRandomizerApp
docker compose up --build
```

That single command starts PostgreSQL, Redis, the API (migrations run automatically) and the web app:

| Service  | URL                          |
|----------|------------------------------|
| Web app  | http://localhost:3000        |
| REST API | http://localhost:8000/api/v1 |

Then open the web app and **register** — the first form creates both your user and your organization. Add players (or share your public registration link), head to *Divide Teams* and draw.

Both `backend/` and `frontend/` are volume-mounted, so the API and the Next.js dev server hot-reload as you edit.

### Running the mobile app

With the backend up (previous step) and **Node 20+** installed:

```bash
cd mobile
npm install
npx expo start
```

Then pick your target — all three work out of the box:

| Target | How | Notes |
|--------|-----|-------|
| **Physical iPhone/Android** | Install **Expo Go** and scan the QR code | Phone and computer must be on the same Wi-Fi; best way to feel the gestures and haptics |
| **iOS Simulator** | Press `i` in the Expo terminal | Requires Xcode (macOS) |
| **Android emulator** | Press `a` in the Expo terminal | Requires Android Studio; `localhost` is remapped to `10.0.2.2` automatically |

The app auto-detects your machine's LAN IP to reach the API — the resolved URL is printed at the bottom of the login screen in dev builds for instant troubleshooting. To point at a different backend (e.g. production), set `EXPO_PUBLIC_API_URL` in `mobile/.env` (see `mobile/.env.example`).

Quality gate for mobile changes:

```bash
npx tsc --noEmit && npx expo lint && npx expo export && npx expo-doctor
```

## 🧪 Tests & Code Quality

Backend changes ship with tests — the suite covers the division algorithm's invariants (center split, team sizes, matchup gaps — including across random seeds), the approval flow, multi-tenant filtering, the WebSocket consumer and the REST endpoints.

```bash
# run the test suite
docker compose exec api python manage.py test

# formatting & linting (all three must pass clean)
docker compose exec api black .
docker compose exec api isort .
docker compose exec api flake8 .
```

## 📡 API Overview

All endpoints are prefixed with `/api/v1/`. Authenticated routes expect `Authorization: Bearer <access token>`.

| Method | Endpoint                          | Description                                  |
|--------|-----------------------------------|----------------------------------------------|
| POST   | `auth/register/`                  | Create user + organization                    |
| POST   | `auth/login/`                     | JWT login (email + password)                  |
| POST   | `auth/refresh/`                   | Refresh the access token                      |
| GET/POST | `players/`                      | List / create players                         |
| POST   | `players/<id>/approve/`           | Approve a self-registered player with a rating |
| GET/POST | `divisions/`                    | History / run the draft                       |
| POST   | `divisions/<id>/move/`            | Move a player to another team (drag-and-drop) |
| GET    | `notifications/`                  | List notifications                            |
| POST   | `org/<slug>/players/register/`    | **Public** player self-registration           |
| GET    | `org/<slug>/info/`                | **Public** organization info                  |

## 📁 Project Structure

```
.
├── docker-compose.yml        # db + redis + api + web
├── backend/
│   ├── config/               # settings, urls, asgi (HTTP + WebSocket routing)
│   ├── core/                 # shared mixins (org-scoped querysets), pagination
│   └── apps/
│       ├── accounts/         # custom User (email login) + Organization
│       ├── players/          # CRUD, public registration, approval flow
│       ├── divisions/        # the algorithm, draft service, history, moves
│       └── notifications/    # model + WebSocket consumer + JWT middleware
├── frontend/
│   └── src/
│       ├── app/(auth)/       # login, register
│       ├── app/(protected)/  # dashboard, players, division, history
│       ├── components/       # UI building blocks (division board, search, …)
│       ├── hooks/            # TanStack Query hooks per domain
│       ├── lib/api/          # Axios client + typed API modules
│       ├── messages/         # i18n catalogs (pt-BR, en)
│       └── stores/           # Zustand stores (auth, organization)
└── mobile/
    ├── DESIGN_BRIEF.md       # dark-first design system: tokens, motion, interaction specs
    └── src/
        ├── app/              # expo-router routes (tabs, division result, modals)
        ├── api/              # Axios client (SecureStore tokens) + LAN auto-detection
        ├── components/       # custom design system + drag-and-drop engine
        ├── hooks/            # TanStack Query hooks (mirroring the web's)
        ├── i18n/             # i18next + ICU, reusing the web catalogs
        └── theme/            # design tokens, motion springs, team identities
```

## 🌐 Internationalization

Every UI string lives in `frontend/src/messages/{pt-BR,en}/` — no hardcoded copy in components. The locale is cookie-based on the web (defaulting to Portuguese with a one-click switch to English), and the mobile app reuses the same catalogs via i18next + ICU, following the device language with a persisted manual override.

## 📄 License

This is a personal project built for a real basketball community. Feel free to explore the code and reach out if you'd like to use it.
