const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONT_ORIGIN',
  'APP_URL',
  'FRONTEND_URL',
  'BACKEND_URL',
  'SES_SMTP_HOST',
  'SES_SMTP_USER',
  'SES_SMTP_PASS',
  'SES_FROM_EMAIL',
] as const;

const PLACEHOLDER_PATTERNS = [
  /^change-me/i,
  /^your-/i,
  /^example/i,
  /^re_your_/i,
  /placeholder/i,
  /localhost:3000\/?$/i,
];

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.NODE_ENV !== 'test') {
    const placeholderVars = REQUIRED_ENV_VARS.filter((key) => {
      const value = String(config[key]).trim();
      return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
    });

    if (placeholderVars.length > 0) {
      throw new Error(`Unsafe placeholder values detected for: ${placeholderVars.join(', ')}`);
    }
  }

  return config;
}
