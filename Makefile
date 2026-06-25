.PHONY: help dev dev-front build clean

help: ## Show this help message
	@echo "AIQUAA - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start frontend in development mode
	pnpm dev:front

dev-front: ## Start frontend in development mode
	pnpm dev:front

build: ## Build all packages
	pnpm build

clean: ## Clean all build artifacts
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/dist
	rm -rf packages/*/dist
	@echo "✅ Cleaned all build artifacts"
