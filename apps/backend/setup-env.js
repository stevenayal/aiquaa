const fs = require('fs');
const path = require('path');

// Configuración con credenciales reales de Supabase
const envConfig = `# Database - Supabase
DATABASE_URL="postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# CORS & Origins
FRONT_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3001
BACKEND_PORT=3001

# Email Configuration
EMAIL_FROM="AIQUAA <no-reply@aiquaa.com>"
SMTP_URL=smtp://user:pass@localhost:1025

# OAuth Providers - Google
GOOGLE_CLIENT_ID=91995874414-kqjeag1g4h46nmlg1nodb7aqb6jud80r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OAuth Providers - GitHub
GITHUB_CLIENT_ID=Ov23lictkb4l9L1uwTny
GITHUB_CLIENT_SECRET=c1e715801f146fbb3d7899da98536dd111cd8862

# Redis Cache
REDIS_URL=redis://localhost:6379

# Sentry
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# OpenTelemetry
OTEL_ENDPOINT=http://localhost:4318

# Supabase
SUPABASE_URL=https://hxixxbiufyntcywajkrh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXh4Yml1ZnludGN5d2Fqa3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ3MjQwNCwiZXhwIjoyMDcwMDQ4NDA0fQ.vRoL7-BvfQbB08nrsdY_L2hvAirMNpnE1mVOK-2vexU
`;

// Crear archivo .env temporal
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envConfig);

console.log('✅ Archivo .env actualizado con credenciales de Supabase');
console.log('🌐 Base de datos: Supabase PostgreSQL');
console.log('🔐 Google OAuth configurado con Client ID y Secret');
console.log('🚀 GitHub OAuth configurado con Client ID y Secret');
console.log('⚠️  Recuerda configurar las variables reales para producción');
console.log('📝 Puedes usar este archivo como base para tu configuración real');
