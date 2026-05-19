import { validateEnv } from '../../src/config/env.validation';

const BASE_CONFIG = {
  DATABASE_URL: 'postgres://db',
  JWT_SECRET: 'supersecret',
  FRONT_ORIGIN: 'https://aiquaa.com',
  APP_URL: 'https://api.aiquaa.com',
  FRONTEND_URL: 'https://aiquaa.com',
  BACKEND_URL: 'https://api.aiquaa.com',
  SES_SMTP_HOST: 'smtp.example.com',
  SES_SMTP_USER: 'user@example.com',
  SES_SMTP_PASS: 'realpass',
  SES_FROM_EMAIL: 'AIQUAA <noreply@aiquaa.com>',
};

describe('validateEnv', () => {
  it('throws when required variables are missing', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(
      /Missing required environment variables/i
    );
  });

  it('throws when production uses placeholder values', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        ...BASE_CONFIG,
        JWT_SECRET: 'change-me',
      })
    ).toThrow(/Unsafe placeholder values/i);
  });

  it('accepts complete test configuration', () => {
    expect(
      validateEnv({
        NODE_ENV: 'test',
        ...BASE_CONFIG,
        JWT_SECRET: 'change-me',
      })
    ).toBeDefined();
  });
});
