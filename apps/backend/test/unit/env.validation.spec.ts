import { validateEnv } from '../../src/config/env.validation';

describe('validateEnv', () => {
  it('throws when required variables are missing', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(
      /Missing required environment variables/i,
    );
  });

  it('throws when production uses placeholder values', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgres://db',
        JWT_SECRET: 'change-me',
        FRONT_ORIGIN: 'https://aiquaa.com',
        APP_URL: 'https://api.aiquaa.com',
        BACKEND_URL: 'https://api.aiquaa.com',
        RESEND_API_KEY: 're_real',
        RESEND_FROM_EMAIL: 'AIQUAA <test@aiquaa.com>',
      }),
    ).toThrow(/Unsafe placeholder values/i);
  });

  it('accepts complete test configuration', () => {
    expect(
      validateEnv({
        NODE_ENV: 'test',
        DATABASE_URL: 'postgres://db',
        JWT_SECRET: 'change-me',
        FRONT_ORIGIN: 'http://localhost:3000',
        APP_URL: 'http://localhost:3001',
        BACKEND_URL: 'http://localhost:3001',
        RESEND_API_KEY: 're_test',
        RESEND_FROM_EMAIL: 'AIQUAA <test@aiquaa.com>',
      }),
    ).toBeDefined();
  });
});
