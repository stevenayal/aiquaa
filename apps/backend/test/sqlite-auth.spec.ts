import { DatabaseSync } from 'node:sqlite';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { MailerService } from '../src/mailer/mailer.service';

type SqliteRow = Record<string, unknown>;

function mapUser(row: SqliteRow | undefined) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    email: String(row.email),
    passwordHash: row.passwordHash ? String(row.passwordHash) : null,
    name: row.name ? String(row.name) : null,
    role: String(row.role),
    emailVerifiedAt: row.emailVerifiedAt ? new Date(String(row.emailVerifiedAt)) : null,
    twoFASecret: row.twoFASecret ? String(row.twoFASecret) : null,
  };
}

describe('AuthService with SQLite', () => {
  let db: DatabaseSync;
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mailerService: jest.Mocked<MailerService>;
  let prisma: any;

  beforeAll(() => {
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT,
        name TEXT,
        avatarUrl TEXT,
        emailVerifiedAt TEXT,
        twoFASecret TEXT,
        role TEXT NOT NULL DEFAULT 'USER',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deletedAt TEXT
      );

      CREATE TABLE refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tokenHash TEXT NOT NULL UNIQUE,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expiresAt TEXT NOT NULL,
        revokedAt TEXT,
        replacedByTokenId INTEGER,
        ip TEXT,
        userAgent TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE verification_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        email TEXT,
        type TEXT NOT NULL,
        tokenHash TEXT NOT NULL UNIQUE,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expiresAt TEXT NOT NULL,
        consumedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  });

  beforeEach(() => {
    db.exec(`
      DELETE FROM verification_tokens;
      DELETE FROM refresh_tokens;
      DELETE FROM users;
    `);

    prisma = {
      user: {
        findUnique: jest.fn(async ({ where }: any) => {
          if (where.email) {
            return mapUser(
              db
                .prepare(
                  `SELECT id, email, passwordHash, name, role, emailVerifiedAt, twoFASecret
                   FROM users WHERE email = ? LIMIT 1`
                )
                .get(where.email.toLowerCase()) as SqliteRow | undefined,
            );
          }

          if (where.id) {
            return mapUser(
              db
                .prepare(
                  `SELECT id, email, passwordHash, name, role, emailVerifiedAt, twoFASecret
                   FROM users WHERE id = ? LIMIT 1`
                )
                .get(where.id) as SqliteRow | undefined,
            );
          }

          return null;
        }),
        create: jest.fn(async ({ data }: any) => {
          const result = db
            .prepare(
              `INSERT INTO users (email, passwordHash, name, role)
               VALUES (?, ?, ?, ?)`
            )
            .run(
              data.email.toLowerCase(),
              data.passwordHash,
              data.name ?? null,
              data.role ?? 'USER',
            );

          return mapUser(
            db
              .prepare(
                `SELECT id, email, passwordHash, name, role, emailVerifiedAt, twoFASecret
                 FROM users WHERE id = ? LIMIT 1`
              )
              .get(result.lastInsertRowid) as SqliteRow | undefined,
          );
        }),
      },
      refreshToken: {
        create: jest.fn(async ({ data }: any) => {
          const result = db
            .prepare(
              `INSERT INTO refresh_tokens (userId, tokenHash, expiresAt, revokedAt, replacedByTokenId, ip, userAgent)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .run(
              data.userId,
              data.tokenHash,
              data.expiresAt.toISOString(),
              data.revokedAt ?? null,
              data.replacedByTokenId ?? null,
              data.ip ?? null,
              data.userAgent ?? null,
            );

          return { id: Number(result.lastInsertRowid) };
        }),
      },
      verificationToken: {
        create: jest.fn(async ({ data, select }: any) => {
          const result = db
            .prepare(
              `INSERT INTO verification_tokens (userId, email, type, tokenHash, expiresAt, consumedAt)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .run(
              data.userId ?? null,
              data.email ?? null,
              data.type,
              data.tokenHash,
              data.expiresAt.toISOString(),
              data.consumedAt ?? null,
            );

          if (select?.id) {
            return { id: Number(result.lastInsertRowid) };
          }

          return { id: Number(result.lastInsertRowid) };
        }),
        updateMany: jest.fn(async () => ({ count: 0 })),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn((key: string, fallback?: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'sqlite-test-secret',
          JWT_ACCESS_TTL: '900',
          JWT_REFRESH_TTL: '3600',
        };
        return values[key] ?? fallback;
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'sqlite-test-secret',
        };
        return values[key];
      }),
    } as unknown as jest.Mocked<ConfigService>;

    mailerService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendWelcomeEmail: jest.fn(),
      sendTwoFactorCode: jest.fn(),
    } as unknown as jest.Mocked<MailerService>;

    service = new AuthService(
      jwtService,
      configService,
      prisma,
      mailerService,
    );
  });

  afterAll(() => {
    db.close();
  });

  it('registra un usuario y persiste el token de verificacion en SQLite', async () => {
    const result = await service.register({
      email: 'sqlite-user@aiquaa.com',
      password: 'Password123',
      name: 'SQLite User',
    });

    const user = db
      .prepare(`SELECT email, passwordHash, name FROM users WHERE email = ? LIMIT 1`)
      .get('sqlite-user@aiquaa.com') as SqliteRow | undefined;
    const tokens = db
      .prepare(`SELECT email, type, tokenHash FROM verification_tokens WHERE email = ?`)
      .all('sqlite-user@aiquaa.com') as SqliteRow[];

    expect(result.message).toContain('Usuario registrado exitosamente');
    expect(user).toBeTruthy();
    expect(String(user?.passwordHash || '')).not.toBe('Password123');
    expect(tokens).toHaveLength(1);
    expect(String(tokens[0].type)).toBe('VERIFY_EMAIL');
    expect(mailerService.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('permite login con un usuario guardado en SQLite', async () => {
    await service.register({
      email: 'login-sqlite@aiquaa.com',
      password: 'Password123',
      name: 'Login SQLite',
    });

    const result = await service.login({
      email: 'login-sqlite@aiquaa.com',
      password: 'Password123',
    });

    const refreshTokens = db
      .prepare(
        `SELECT rt.tokenHash
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.userId
         WHERE u.email = ?`
      )
      .all('login-sqlite@aiquaa.com') as SqliteRow[];

    expect(result.access_token).toBe('signed-token');
    expect(result.refresh_token).toMatch(/^[a-f0-9]{64}$/);
    expect(result.user.email).toBe('login-sqlite@aiquaa.com');
    expect(refreshTokens).toHaveLength(1);
  });

  it('rechaza login con password incorrecta contra SQLite', async () => {
    await service.register({
      email: 'wrong-pass@aiquaa.com',
      password: 'Password123',
      name: 'Wrong Pass',
    });

    await expect(
      service.login({
        email: 'wrong-pass@aiquaa.com',
        password: 'bad-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
