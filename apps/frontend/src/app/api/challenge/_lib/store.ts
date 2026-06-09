import {
  SEED_USERS,
  SEED_ACCOUNTS,
  SEED_MOVEMENTS,
  SeedUser,
  SeedAccount,
  SeedTransfer,
  SeedMovement,
} from './seed';

export interface SessionState {
  userId: string;
  accounts: SeedAccount[];
  transfers: SeedTransfer[];
  movements: SeedMovement[];
}

// Global in-memory store. In Next.js dev hot-reload this persists across requests.
const sessions = new Map<string, SessionState>();

export function getOrCreateSession(
  challengeToken: string,
  userId: string
): SessionState {
  if (!sessions.has(challengeToken)) {
    sessions.set(challengeToken, {
      userId,
      accounts: structuredClone(SEED_ACCOUNTS),
      transfers: [],
      movements: structuredClone(SEED_MOVEMENTS),
    });
  }
  return sessions.get(challengeToken)!;
}

export function getSession(challengeToken: string): SessionState | undefined {
  return sessions.get(challengeToken);
}

export function getUserByEmail(email: string): SeedUser | undefined {
  return SEED_USERS.find((u) => u.email === email);
}

export function getUserById(id: string): SeedUser | undefined {
  return SEED_USERS.find((u) => u.id === id);
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
