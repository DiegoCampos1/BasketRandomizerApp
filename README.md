# 🏀 Sorteador de Times — Basketball Team Divider

A full-stack web app that builds **fair, balanced teams for pickup basketball games** — no more endless arguing at the court about who plays with whom.

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
- **i18n** — Portuguese (pt-BR) and English, cookie-based locale switching
- **Mobile-first UI** — designed for the phone you're holding courtside

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

Monorepo with a decoupled SPA + REST API, fully containerized:

```
┌──────────────────┐    REST (JWT)     ┌──────────────────┐
│     Next.js      │ ◄───────────────► │   Django + DRF   │
│   web  :3000     │    WebSocket      │    api  :8000    │
└──────────────────┘ ◄───────────────► └────────┬─────────┘
                                                │
                                   ┌────────────┴────────────┐
                                   │ PostgreSQL 16   Redis 7 │
                                   │  (data)      (channels) │
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
└── frontend/
    └── src/
        ├── app/(auth)/       # login, register
        ├── app/(protected)/  # dashboard, players, division, history
        ├── components/       # UI building blocks (division board, search, …)
        ├── hooks/            # TanStack Query hooks per domain
        ├── lib/api/          # Axios client + typed API modules
        ├── messages/         # i18n catalogs (pt-BR, en)
        └── stores/           # Zustand stores (auth, organization)
```

## 🌐 Internationalization

Every UI string lives in `frontend/src/messages/{pt-BR,en}/` — no hardcoded copy in components. The locale is cookie-based, defaulting to Portuguese with a one-click switch to English.

## 📄 License

This is a personal project built for a real basketball community. Feel free to explore the code and reach out if you'd like to use it.
