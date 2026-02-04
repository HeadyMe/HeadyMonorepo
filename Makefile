# Heady Systems Makefile
# Quick commands for common operations

.PHONY: help install dev build test lint format clean docker-up docker-down brand checkpoint sync

help:
	@echo "🌟 Heady Systems - Sacred Geometry Ecosystem 🌟"
	@echo ""
	@echo "Available commands:"
	@echo "  make install       - Install all dependencies"
	@echo "  make dev           - Start development servers"
	@echo "  make build         - Build all packages"
	@echo "  make test          - Run all tests"
	@echo "  make lint          - Lint all code"
	@echo "  make format        - Format all code"
	@echo "  make brand         - Apply Sacred Geometry branding"
	@echo "  make checkpoint    - Run checkpoint validation"
	@echo "  make sync          - Sync to all remotes"
	@echo "  make docker-up     - Start Docker services"
	@echo "  make docker-down   - Stop Docker services"
	@echo "  make clean         - Clean build artifacts"

install:
	pnpm install

dev:
	pnpm run dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

format:
	pnpm format

brand:
	node scripts/brand_headers.js --fix

checkpoint:
	powershell -ExecutionPolicy Bypass -File scripts/checkpoint-validation.ps1 -Full

sync:
	powershell -ExecutionPolicy Bypass -File scripts/hs.ps1

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-drupal:
	docker-compose --profile drupal up -d

clean:
	rm -rf node_modules dist .next .turbo
	pnpm run clean
