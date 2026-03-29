# Sorteador de Times - Basketball Team Divider

## About the Project
Application for balanced team division in pickup basketball games. Solves the pain of manually dividing teams in an unbalanced way. Reference organization: **Boomerangs Basketball**.

## Stack
- **Monorepo**: `backend/` + `frontend/` in the same root
- **Backend**: Django REST Framework (Python)
- **Frontend**: Next.js 14+ (App Router) + MUI + Tailwind CSS
- **Database**: PostgreSQL 16
- **Auth**: JWT via djangorestframework-simplejwt (login by email, USERNAME_FIELD = 'email')
- **Infra**: Docker Compose (PostgreSQL + Django + Next.js)

## Visual Theme
Sport Creative palette (indigo + orange):
- Primary (Indigo): `#4F46E5` (light: `#6366F1`, dark: `#3730A3`)
- Secondary (Orange): `#F97316` (light: `#FB923C`, dark: `#EA580C`)
- Background: `#F8FAFC`
- Text: `#0F172A` (primary), `#475569` (secondary)
- Border: `#E2E8F0`
- Success: `#10B981`, Error: `#EF4444`, Warning: `#F59E0B`
- Typography: Barlow Condensed (headings) + Barlow (body)
- MUI with `enableCssLayer: true` + Tailwind with `preflight: false`

## Business Rules

### Players
- **Positions**: Guard, Forward, Center (3 simplified)
- **Quality**: Rating from 1 to 5
- **Height**: Small (≤176cm), Medium (177-187cm), Tall (>187cm) — automatically derived from height_cm
- **Self-registration**: Public URL `/<org-slug>/addPlayer` for players to register without login
- **Approval flow**: Self-registered players have `is_approved=False` until admin approves with a quality rating
- Players created by admin are auto-approved (`is_approved=True`)
- Only approved players appear in division

### Organizations
- **Slug**: Auto-generated from org name (e.g., "Boomerangs Basketball" → "boomerangs-basketball")

### Notifications
- App `apps.notifications` with Notification model (type, title, message, related_player, is_read)
- Created when a player self-registers (type: player_pending)
- Polling every 30s for unread count in TopBar

### Team Division
- **2-team mode**: Minimum 4 players
- **4-team mode**: Minimum 8 players. Creates 2 groups (Red/Black) with 2 subteams each
  - Game 1: Red 1 vs Black 1
  - Game 2: Red 2 vs Black 2 (score carries over)
- Teams can have unequal sizes
- Serpentine draft algorithm with balancing: quality (weight 3.0), position (1.5), height (1.0)
- Tall centers with similar quality are automatically separated
- Before dividing, select which players are present for the day
- After division, allows manual adjustment via drag-and-drop
- Divisions are saved with history (date)

### Organization and Permissions
- Login by organization (multi-tenant)
- All members can do everything (no roles for now)
- Data automatically filtered by user's organization (OrganizationQuerySetMixin)

## Backend Structure
- `config/` — settings, urls, wsgi
- `core/` — shared mixins (OrganizationQuerySetMixin)
- `apps/accounts/` — User (AbstractUser, USERNAME_FIELD='email') + Organization
- `apps/players/` — Player CRUD
- `apps/divisions/` — Division, Team, TeamPlayer + algorithm.py + services.py
- All model IDs are UUIDs
- AUTH_USER_MODEL = "accounts.User" (MUST be set before the first migration)

## Frontend Structure
- `src/app/(auth)/` — Login, Register (no sidebar)
- `src/app/(protected)/` — Dashboard, Players, Division, History (with sidebar)
- `src/components/providers/` — ThemeRegistry, AuthProvider
- `src/lib/api/` — Axios client with JWT interceptors
- `src/stores/` — Zustand (auth, organization)
- Drag-and-drop: @dnd-kit/core
- Forms: react-hook-form + zod
- State: zustand (no Redux)

## API Endpoints (prefix /api/v1/)
- `auth/register/` POST — create user + org (fields: name, email, password, password_confirm, organization_name)
- `auth/login/` POST — JWT login (fields: email, password)
- `auth/refresh/` POST — refresh JWT
- `players/` GET, POST
- `players/<id>/` GET, PUT, DELETE
- `players/<id>/approve/` POST — approve pending player (fields: quality)
- `divisions/` GET, POST
- `divisions/<id>/` GET, DELETE
- `divisions/<id>/swap/` POST — swap players between teams
- `notifications/` GET — list notifications
- `notifications/<id>/` PATCH — mark notification as read
- `notifications/unread-count/` GET — get unread count
- `notifications/mark-all-read/` POST — mark all as read
- `org/<slug>/players/register/` POST — public player self-registration (no auth)
- `org/<slug>/info/` GET — public org info by slug (no auth)

## Docker
- `docker-compose.yml` at the project root
- DB: postgres:16-alpine (port 5432)
- API: Django on port 8000
- Web: Next.js on port 3000

## Test User (for Claude)
- **Name**: Claude
- **Email**: claude@test.com
- **Password**: Claude@123
- **Organization**: Boomerangs Basketball

## Conventions
- **Mobile first**: design and develop for mobile screens first, then scale up for larger screens
- Use installed skills: django-drf, frontend-design, ui-ux-pro-max, vercel-react-best-practices, web-design-guidelines, theme-factory
- MUI for interactive components, Tailwind for layout/spacing
- Do not mix sx prop and Tailwind on the same element
- Do not save temporary screenshots or logs in the project root. Playwright MCP files go to `.playwright-mcp/` (already in .gitignore)
- **Testing is mandatory**: Always create backend tests for new features/endpoints. Before finishing, run ALL existing tests (`docker compose exec api python manage.py test`) to ensure nothing is broken. Never ship code without verifying tests pass.
