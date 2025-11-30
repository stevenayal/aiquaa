#!/bin/bash

# Script para ejecutar pruebas E2E
# Uso: ./scripts/run-e2e-tests.sh [frontend_url] [backend_url]

# URLs por defecto
FRONTEND_URL=${1:-"http://localhost:3001"}
BACKEND_URL=${2:-"http://localhost:3001"}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PRUEBAS E2E - AIQUAA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

# Ejecutar pruebas
FRONTEND_URL=$FRONTEND_URL BACKEND_URL=$BACKEND_URL node scripts/e2e-post-deployment.js
