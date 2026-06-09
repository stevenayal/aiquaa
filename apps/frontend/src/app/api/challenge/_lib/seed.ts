// Static banking data for the challenge. Passwords are bcrypt hashes.
// user.a@aiquaa.test / Test1234!
// user.b@aiquaa.test / Test1234!

export interface SeedUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  internalRiskScore: number; // BUG #6: exposed in GET /users/me
}

export interface SeedAccount {
  id: string;
  ownerId: string;
  alias: string;
  type: 'checking' | 'savings';
  currency: string;
  balance: number; // BUG #8: OpenAPI says availableBalance
}

export interface SeedTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  ownerId: string;
  createdAt: string;
}

export interface SeedMovement {
  id: string;
  accountId: string;
  transferId: string | null;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  balance: number;
  createdAt: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'usr_001',
    email: 'user.a@aiquaa.test',
    name: 'Usuario A',
    // bcrypt hash of "Test1234!"
    passwordHash:
      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    internalRiskScore: 42,
  },
  {
    id: 'usr_002',
    email: 'user.b@aiquaa.test',
    name: 'Usuario B',
    passwordHash:
      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    internalRiskScore: 15,
  },
];

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    id: 'acc_001',
    ownerId: 'usr_001',
    alias: 'Mi cuenta corriente',
    type: 'checking',
    currency: 'PYG',
    balance: 5_000_000,
  },
  {
    id: 'acc_002',
    ownerId: 'usr_002',
    alias: 'Ahorro mensual',
    type: 'savings',
    currency: 'PYG',
    balance: 2_500_000,
  },
];

export const SEED_MOVEMENTS: SeedMovement[] = [
  {
    id: 'mov_001',
    accountId: 'acc_001',
    transferId: null,
    type: 'credit',
    amount: 5_000_000,
    description: 'Depósito inicial',
    balance: 5_000_000,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'mov_002',
    accountId: 'acc_002',
    transferId: null,
    type: 'credit',
    amount: 2_500_000,
    description: 'Depósito inicial',
    balance: 2_500_000,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];
