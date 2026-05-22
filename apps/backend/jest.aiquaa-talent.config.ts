/**
 * Lightweight Jest config for the Aiquaa Talent integration unit tests.
 * No Docker / PostgreSQL required — all dependencies are mocked.
 */
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: 'integrations/aiquaa-talent/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 15000,
};

export default config;
