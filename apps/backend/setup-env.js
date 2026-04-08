const fs = require('fs');
const path = require('path');

// Configuración base sin credenciales reales
const envConfig = `# Database - Supabase
DATABASE_URL="postgresql://replace-user:replace-password@replace-host:6543/replace-db?sslmode=require&pgbouncer=true"

# JWT Configuration
JWT_SECRET=replace-with-a-long-random-dev-secret
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# CORS & Origins
FRONT_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
BACKEND_PORT=3001

# Email Configuration - Resend
EMAIL_FROM="AIQUAA <no-reply@aiquaa.com>"
RESEND_API_KEY=re_replace_with_real_resend_api_key
RESEND_FROM_EMAIL="AIQUAA <test@aiquaa.com>"

# OAuth Providers - Google
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret

# OAuth Providers - GitHub
GITHUB_CLIENT_ID=replace-with-github-client-id
GITHUB_CLIENT_SECRET=replace-with-github-client-secret

# Redis Cache
REDIS_URL=redis://localhost:6379

# Sentry
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# OpenTelemetry
OTEL_ENDPOINT=http://localhost:4318

# Supabase
SUPABASE_URL=https://replace-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-real-service-role-key
`;

// Crear archivo .env temporal
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envConfig);

console.log('✅ Archivo .env base generado con placeholders seguros');
console.log('🌐 Base de datos: completa DATABASE_URL con tu instancia real');
console.log('🔐 OAuth: completa Client ID y Secret reales antes de usar login social');
console.log('⚠️  Recuerda configurar las variables reales fuera del repositorio');
console.log('📝 Puedes usar este archivo como base para tu configuración local');
