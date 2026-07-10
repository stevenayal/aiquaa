#!/usr/bin/env node

/**
 * Verifies build-time environment variables without printing secrets.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_BACKEND_URL'];
const optionalEnvVars = [
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'REVALIDATE_TOKEN',
];
const oauthEnvVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GITHUB_CLIENT_ID',
];

function redactValue(varName, value) {
  if (!value) return 'NO CONFIGURADA';

  const isSensitive =
    /SECRET|TOKEN|KEY|PASSWORD|POSTGRES|DATABASE|SUPABASE/i.test(varName) ||
    value.length > 80;

  if (isSensitive) {
    return '[redacted]';
  }

  return value;
}

function loadLocalEnv() {
  console.log(
    'Checking .env.local:',
    fs.existsSync(envPath) ? 'found' : 'not found'
  );

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  envContent.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      return;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (key && value && !process.env[key]) {
      process.env[key] = value;
      console.log(`Loaded ${key}: ${redactValue(key, value)}`);
    }
  });
}

function printEnvGroup(title, vars, options = {}) {
  console.log(`\n${title}:`);

  let hasErrors = false;

  vars.forEach((varName) => {
    const value = process.env[varName];

    if (value) {
      console.log(`  OK ${varName}: ${redactValue(varName, value)}`);
      return;
    }

    console.log(
      `  ${options.required ? 'MISSING' : 'WARN'} ${varName}: NO CONFIGURADA`
    );
    hasErrors = hasErrors || Boolean(options.required);
  });

  return hasErrors;
}

loadLocalEnv();

console.log('\nVerificando variables de entorno...');

const hasRequiredErrors = printEnvGroup(
  'Variables requeridas',
  requiredEnvVars,
  {
    required: true,
  }
);
printEnvGroup('Variables opcionales', optionalEnvVars);
printEnvGroup('Variables de OAuth', oauthEnvVars);

console.log('\nEntorno:', process.env.NODE_ENV || 'development');

if (hasRequiredErrors) {
  console.log(
    '\nERROR: Algunas variables de entorno requeridas no estan configuradas.'
  );
  console.log('Solucion: configura las variables en Vercel o en .env.local.');
  process.exit(1);
}

console.log('\nTodas las variables de entorno requeridas estan configuradas.');

const oauthConfigured = oauthEnvVars.some((varName) => process.env[varName]);

if (oauthConfigured) {
  console.log('OAuth esta configurado.');
} else {
  console.log(
    'OAuth no esta configurado. Los botones de Google/GitHub no funcionaran.'
  );
}
