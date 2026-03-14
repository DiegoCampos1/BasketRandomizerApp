# Sorteador de Times - Basketball Team Divider

## Sobre o Projeto
Aplicação para divisão equilibrada de times em peladas de basquete. Resolve a dor de dividir times manualmente de forma desbalanceada. Organização de referência: **Boomerangs Basketball**.

## Stack
- **Monorepo**: `backend/` + `frontend/` na mesma raiz
- **Backend**: Django REST Framework (Python)
- **Frontend**: Next.js 14+ (App Router) + MUI + Tailwind CSS
- **Banco**: PostgreSQL 16
- **Auth**: JWT via djangorestframework-simplejwt
- **Infra**: Docker Compose (PostgreSQL + Django + Next.js)

## Tema Visual
Cores da NBA:
- Vermelho: `#C8102E`
- Azul: `#1D428A`
- Branco: `#FFFFFF`
- MUI com `enableCssLayer: true` + Tailwind com `preflight: false`

## Regras de Negócio

### Jogadores
- **Posições**: Guard, Forward, Center (3 simplificadas)
- **Qualidade**: Nota de 1 a 5
- **Altura**: Pequeno (≤176cm), Médio (177-187cm), Alto (>187cm) — derivada automaticamente do height_cm

### Divisão de Times
- **Modo 2 times**: Mínimo 4 jogadores
- **Modo 4 times**: Mínimo 8 jogadores. Gera 2 grupos (Vermelho/Preto) com 2 subequipes cada
  - Jogo 1: Vermelho 1 vs Preto 1
  - Jogo 2: Vermelho 2 vs Preto 2 (placar continua)
- Times podem ter tamanhos desiguais
- Algoritmo serpentine draft com balanceamento: qualidade (peso 3.0), posição (1.5), altura (1.0)
- Pivôs altos de qualidade similar são separados automaticamente
- Antes de dividir, seleciona quais jogadores estão presentes no dia
- Após divisão, permite ajuste manual via drag-and-drop
- Divisões são salvas com histórico (data)

### Organização e Permissões
- Login por organização (multi-tenant)
- Todos os membros podem fazer tudo (sem roles por enquanto)
- Dados filtrados automaticamente por organização do usuário (OrganizationQuerySetMixin)

## Estrutura do Backend
- `config/` — settings, urls, wsgi
- `core/` — mixins compartilhados (OrganizationQuerySetMixin)
- `apps/accounts/` — User (AbstractUser) + Organization
- `apps/players/` — Player CRUD
- `apps/divisions/` — Division, Team, TeamPlayer + algorithm.py + services.py
- IDs são UUID em todos os models
- AUTH_USER_MODEL = "accounts.User" (DEVE ser definido antes da 1ª migration)

## Estrutura do Frontend
- `src/app/(auth)/` — Login, Register (sem sidebar)
- `src/app/(protected)/` — Dashboard, Players, Division, History (com sidebar)
- `src/components/providers/` — ThemeRegistry, AuthProvider
- `src/lib/api/` — Axios client com JWT interceptors
- `src/stores/` — Zustand (auth, organization)
- Drag-and-drop: @dnd-kit/core
- Forms: react-hook-form + zod
- State: zustand (sem Redux)

## API Endpoints (prefixo /api/v1/)
- `auth/register/` POST — criar usuário + org
- `auth/login/` POST — JWT login
- `auth/refresh/` POST — refresh JWT
- `players/` GET, POST
- `players/<id>/` GET, PUT, DELETE
- `divisions/` GET, POST
- `divisions/<id>/` GET, DELETE
- `divisions/<id>/swap/` POST — trocar jogadores entre times

## Docker
- `docker-compose.yml` na raiz do projeto
- DB: postgres:16-alpine (porta 5432)
- API: Django na porta 8000
- Web: Next.js na porta 3000

## Convenções
- Usar skills instaladas: django-drf, frontend-design, ui-ux-pro-max, vercel-react-best-practices, web-design-guidelines, theme-factory
- MUI para componentes interativos, Tailwind para layout/spacing
- Não misturar sx prop e Tailwind no mesmo elemento
