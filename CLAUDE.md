# Revendu — Project Instructions

## Product
SaaS B2C — Tracker de profit et d'alerte fiscale DAC7 pour revendeurs français (Vinted, Leboncoin, eBay, Vestiaire Collective).

## Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0 async, Alembic, PostgreSQL 15, asyncpg
- **Auth**: JWT (python-jose) — access token 30min + refresh token 7j (httpOnly cookie)
- **Frontend**: Next.js 14+ App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Recharts, SWR
- **Infra**: Docker (postgres + redis), Vercel (frontend), Railway (backend)

## Key Commands
```bash
make docker-up          # Démarrer PostgreSQL + Redis
make install            # Installer dépendances Python (depuis backend/)
make migrate            # Appliquer migrations Alembic
make dev                # Backend sur port 8000
make frontend-install   # Dépendances Node.js
make frontend-dev       # Frontend sur port 3000
make all-dev            # Backend + frontend en parallèle
make test               # Tests pytest
```

## Architecture
```
backend/app/
  main.py              # FastAPI app + CORS + routers
  config.py            # Settings via pydantic-settings
  database.py          # Async SQLAlchemy engine
  models/              # User, Item (SQLAlchemy ORM)
  schemas/             # Pydantic v2 request/response models
  routers/             # auth, items, dashboard
  services/            # auth_service, item_service (business logic)
  core/                # security (JWT + bcrypt), deps (get_current_user)

frontend/src/
  app/                 # Next.js App Router
    page.tsx           # Landing marketing (public)
    (auth)/            # login, register
    (app)/             # dashboard, ventes, alertes (protected)
  components/          # UI components, layout, dashboard widgets
  lib/                 # api.ts (typed fetch), auth.ts, utils.ts
```

## Conventions
- **Sécurité absolue** : toutes les routes app/ scopées par user_id — jamais de fuite inter-utilisateurs
- Pas de mock, pas de données en dur — tout vient de la DB
- API versionnée sous `/api/v1/`
- Pydantic v2 pour tous les schémas
- Async/await partout côté backend
- Frontend : dark mode par défaut, palette indigo/emerald
- Langue UI : Français

## Domaine métier — Seuils DAC7 (2024)
- 30 transactions/an OU 2 000 € de recettes brutes → plateforme transmet à DGFIP
- `gross_receipt` = prix de vente (ce que DAC7 mesure)
- `net_profit` = prix vente - prix achat - frais plateforme - frais port
- Niveaux d'alerte : safe (<70%) / warning (70-85%) / danger (85-100%) / exceeded (>100%)
