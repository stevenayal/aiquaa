#!/bin/bash

# Script de Configuración para Railway Deployment
# Este script te guía paso a paso para desplegar en Railway

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         AIQUAA - DEPLOYMENT EN RAILWAY                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Este script te ayudará a configurar el deployment en Railway.${NC}"
echo ""

# Paso 1: Verificar que railway CLI esté instalado
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 1: Verificar Railway CLI${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI no está instalado${NC}"
    echo ""
    echo -e "${YELLOW}Instálalo con:${NC}"
    echo "  npm install -g @railway/cli"
    echo ""
    echo "O visita: https://docs.railway.app/develop/cli"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ Railway CLI instalado${NC}"
    railway --version
fi

echo ""

# Paso 2: Login en Railway
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 2: Login en Railway${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${BLUE}Ejecutando: railway login${NC}"
railway login

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error al hacer login en Railway${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Login exitoso${NC}"
echo ""

# Paso 3: Inicializar proyecto
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 3: Inicializar Proyecto en Railway${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${BLUE}¿Quieres crear un nuevo proyecto o usar uno existente?${NC}"
echo "1) Crear nuevo proyecto"
echo "2) Usar proyecto existente"
read -p "Selecciona una opción (1 o 2): " project_option

if [ "$project_option" = "1" ]; then
    echo ""
    echo -e "${BLUE}Creando nuevo proyecto...${NC}"
    railway init
else
    echo ""
    echo -e "${BLUE}Vinculando a proyecto existente...${NC}"
    railway link
fi

echo ""

# Paso 4: Agregar PostgreSQL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 4: Configurar PostgreSQL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${BLUE}¿Ya tienes PostgreSQL configurado en Railway?${NC}"
echo "1) Sí, ya está configurado"
echo "2) No, crear nuevo PostgreSQL"
read -p "Selecciona una opción (1 o 2): " postgres_option

if [ "$postgres_option" = "2" ]; then
    echo ""
    echo -e "${BLUE}Agregando PostgreSQL...${NC}"
    railway add --plugin postgresql
    echo -e "${GREEN}✓ PostgreSQL agregado${NC}"
fi

echo ""

# Paso 5: Generar JWT_SECRET
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 5: Generar JWT_SECRET${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
echo -e "${GREEN}✓ JWT_SECRET generado${NC}"
echo ""
echo -e "${BLUE}Copia este valor (guárdalo en un lugar seguro):${NC}"
echo -e "${YELLOW}${JWT_SECRET}${NC}"
echo ""

# Paso 6: Configurar variables de entorno
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 6: Configurar Variables de Entorno${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
read -p "¿Cuál es la URL de tu frontend en Vercel? (ej: https://aiquaa.vercel.app): " FRONTEND_URL

echo ""
echo -e "${BLUE}Configurando variables de entorno...${NC}"

# Variables obligatorias
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set FRONT_ORIGIN="$FRONTEND_URL"
railway variables set JWT_ACCESS_TTL=3600
railway variables set JWT_REFRESH_TTL=2592000
railway variables set REFRESH_COOKIE_NAME=aiq_rt
railway variables set LOG_LEVEL=info

echo -e "${GREEN}✓ Variables básicas configuradas${NC}"
echo ""

# Variables opcionales
echo -e "${BLUE}¿Quieres configurar variables opcionales (OAuth, Email)?${NC}"
echo "1) Sí, configurar ahora"
echo "2) No, omitir por ahora"
read -p "Selecciona una opción (1 o 2): " optional_vars

if [ "$optional_vars" = "1" ]; then
    echo ""
    read -p "RESEND_API_KEY (enter para omitir): " RESEND_KEY
    if [ ! -z "$RESEND_KEY" ]; then
        railway variables set RESEND_API_KEY="$RESEND_KEY"
    fi

    read -p "GOOGLE_CLIENT_ID (enter para omitir): " GOOGLE_ID
    if [ ! -z "$GOOGLE_ID" ]; then
        railway variables set GOOGLE_CLIENT_ID="$GOOGLE_ID"
    fi

    read -p "GOOGLE_CLIENT_SECRET (enter para omitir): " GOOGLE_SECRET
    if [ ! -z "$GOOGLE_SECRET" ]; then
        railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_SECRET"
    fi

    read -p "GITHUB_CLIENT_ID (enter para omitir): " GITHUB_ID
    if [ ! -z "$GITHUB_ID" ]; then
        railway variables set GITHUB_CLIENT_ID="$GITHUB_ID"
    fi

    read -p "GITHUB_CLIENT_SECRET (enter para omitir): " GITHUB_SECRET
    if [ ! -z "$GITHUB_SECRET" ]; then
        railway variables set GITHUB_CLIENT_SECRET="$GITHUB_SECRET"
    fi
fi

echo ""
echo -e "${GREEN}✓ Variables de entorno configuradas${NC}"

# Paso 7: Deploy
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Paso 7: Desplegar en Railway${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${BLUE}¿Listo para desplegar?${NC}"
read -p "Presiona ENTER para iniciar el deployment..."

railway up

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✓ DEPLOYMENT COMPLETADO EXITOSAMENTE                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Obtener URL del deployment
    echo -e "${BLUE}Obteniendo URL del deployment...${NC}"
    RAILWAY_URL=$(railway domain)

    if [ ! -z "$RAILWAY_URL" ]; then
        echo -e "${GREEN}✓ URL del backend: ${RAILWAY_URL}${NC}"
        echo ""
        echo -e "${YELLOW}Próximos pasos:${NC}"
        echo "1. Verifica el backend: curl https://${RAILWAY_URL}/health"
        echo "2. Actualiza NEXT_PUBLIC_API_URL en Vercel a: https://${RAILWAY_URL}"
        echo "3. Ejecuta pruebas E2E: BACKEND_URL=https://${RAILWAY_URL} node scripts/e2e-post-deployment.js"
    fi

    echo ""
    echo -e "${BLUE}Para ver logs:${NC} railway logs"
    echo -e "${BLUE}Para abrir dashboard:${NC} railway open"

else
    echo ""
    echo -e "${RED}✗ Error en el deployment${NC}"
    echo -e "${YELLOW}Revisa los logs con: railway logs${NC}"
    exit 1
fi
