#!/bin/bash

# Script de inicio para Railway/producción
# Este script se ejecuta automáticamente antes de iniciar el servidor
# Asegura que la base de datos esté lista antes de iniciar

set -e  # Salir si hay algún error

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AIQUAA Backend - Script de Inicio"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que DATABASE_URL esté configurado
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurado"
    echo "   Por favor configura la variable de entorno DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL configurado"
echo ""

# Ejecutar inicialización de base de datos
echo "🔄 Iniciando configuración de base de datos..."
node scripts/init-database.js

# Verificar que la inicialización fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Base de datos lista"
    echo ""
    echo "🚀 Iniciando servidor NestJS..."
    echo ""
else
    echo ""
    echo "❌ Error en la inicialización de base de datos"
    exit 1
fi
