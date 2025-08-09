.PHONY: help db-up db-down db-seed dev dev-front dev-back build clean observability-up observability-down dev-observability test-observability

help: ## Show this help message
	@echo "AIQUAA Monorepo - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

db-up: ## Start PostgreSQL database
	docker-compose up -d postgres
	@echo "✅ PostgreSQL started on localhost:5432"

db-down: ## Stop PostgreSQL database
	docker-compose down
	@echo "✅ PostgreSQL stopped"

db-seed: ## Run database migrations and seed data
	cd apps/backend && pnpm prisma:migrate && pnpm prisma:seed
	@echo "✅ Database seeded successfully"

dev: ## Start both frontend and backend in development mode
	pnpm dev

dev-front: ## Start only frontend in development mode
	pnpm dev:front

dev-back: ## Start only backend in development mode
	pnpm dev:back

dev-observability: ## Start development with full observability stack
	docker-compose -f docker-compose.observability.yml up -d
	@echo "✅ Observability services started"
	@echo "   - Jaeger UI: http://localhost:16686"
	@echo "   - Grafana: http://localhost:3001 (admin/admin)"
	@echo "   - Prometheus: http://localhost:9090"
	pnpm dev

observability-up: ## Start observability services (Jaeger, Prometheus, Grafana)
	docker-compose -f docker-compose.observability.yml up -d
	@echo "✅ Observability services started:"
	@echo "   - Jaeger UI: http://localhost:16686"
	@echo "   - Grafana: http://localhost:3001 (admin/admin)"
	@echo "   - Prometheus: http://localhost:9090"

observability-down: ## Stop observability services
	docker-compose -f docker-compose.observability.yml down
	@echo "✅ Observability services stopped"

test-observability: ## Test observability system
	@echo "🧪 Testing observability system..."
	node scripts/test-observability.js

build: ## Build all packages
	pnpm build

clean: ## Clean all build artifacts
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/dist
	rm -rf packages/*/dist
	@echo "✅ Cleaned all build artifacts"
