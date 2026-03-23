.PHONY: help install migrate dev test test-cov lint format check docker-up docker-down frontend-install frontend-dev all-dev

VENV       := backend/.venv
PYTHON     := $(VENV)/bin/python
PIP        := $(VENV)/bin/pip
UVICORN    := $(VENV)/bin/uvicorn
ALEMBIC    := $(VENV)/bin/alembic
PYTEST     := $(VENV)/bin/pytest
RUFF       := $(VENV)/bin/ruff

help:
	@echo "Revendu — Commandes disponibles"
	@echo ""
	@echo "Backend:"
	@echo "  make install            Créer venv + installer dépendances Python"
	@echo "  make migrate            Appliquer les migrations Alembic"
	@echo "  make dev                Lancer le backend (port 8000)"
	@echo ""
	@echo "Qualité du code:"
	@echo "  make test               Lancer les tests"
	@echo "  make test-cov           Tests + couverture de code"
	@echo "  make lint               Vérifier le code (ruff)"
	@echo "  make format             Formater le code (ruff format)"
	@echo "  make check              lint + test (pipeline CI)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up          Démarrer PostgreSQL + Redis"
	@echo "  make docker-down        Arrêter les services Docker"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-install   Installer les dépendances Node.js"
	@echo "  make frontend-dev       Lancer le frontend (port 3000)"
	@echo ""
	@echo "Full stack:"
	@echo "  make all-dev            Lancer backend + frontend en parallèle"

# ── Docker ──────────────────────────────────────────────────────────────────

docker-up:
	docker-compose up -d
	@echo "✓ PostgreSQL disponible sur localhost:5435"
	@echo "✓ Redis disponible sur localhost:6379"

docker-down:
	docker-compose down
	@echo "✓ Services arrêtés"

# ── Backend ─────────────────────────────────────────────────────────────────

$(VENV):
	python3 -m venv $(VENV)

install: $(VENV)
	$(PIP) install --upgrade pip
	cd backend && $(PIP) install -e ".[dev]"
	@echo "✓ Dépendances installées"

migrate:
	cd backend && $(ALEMBIC) upgrade head
	@echo "✓ Migrations appliquées"

dev:
	cd backend && $(UVICORN) app.main:app --reload --port 8000

test:
	cd backend && $(PYTEST) tests/ -v --tb=short
	@echo "✓ Tests réussis"

test-cov:
	cd backend && $(PYTEST) tests/ -v --cov=app --cov-report=html --cov-report=term-missing
	@echo "✓ Couverture générée (voir htmlcov/index.html)"

lint:
	cd backend && $(RUFF) check app/ tests/
	@echo "✓ Aucune violation de linting"

format:
	cd backend && $(RUFF) format app/ tests/
	@echo "✓ Code formaté"

check: lint test
	@echo "✓ Pipeline CI réussi (lint + test)"

# ── Frontend ────────────────────────────────────────────────────────────────

frontend-install:
	cd frontend && npm install
	@echo "✓ Dépendances Node.js installées"

frontend-dev:
	cd frontend && npm run dev

# ── Full stack ───────────────────────────────────────────────────────────────

all-dev:
	@echo "🚀 Lancement backend (port 8000) + frontend (port 3000)..."
	@$(MAKE) dev & $(MAKE) frontend-dev
