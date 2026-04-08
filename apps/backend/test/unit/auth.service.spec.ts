import * as argon2 from 'argon2';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { MailerService } from '../../src/mailer/mailer.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mailerService: jest.Mocked<MailerService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      verificationToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
        deleteMany: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn((key: string, fallback?: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_ACCESS_TTL: '900',
          JWT_REFRESH_TTL: '3600',
        };
        return values[key] ?? fallback;
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_ACCESS_TTL: '900',
          JWT_REFRESH_TTL: '3600',
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
      prisma as PrismaService,
      mailerService,
    );
  });

  it('sends the plain verification token on register while storing only its hash', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 1, email: 'test@example.com', name: 'Test User' });
    prisma.verificationToken.create.mockImplementation(async ({ data }: any) => ({ id: 99, ...data }));

    await service.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    const storedHash = prisma.verificationToken.create.mock.calls[0][0].data.tokenHash;
    const mailedToken = mailerService.sendVerificationEmail.mock.calls[0][1];

    expect(mailedToken).toMatch(/^[a-f0-9]{64}$/);
    expect(mailedToken).not.toBe(storedHash);
  });

  it('returns tokens for a standard login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      passwordHash: await argon2.hash('password123'),
      name: 'Test User',
      role: 'USER',
      emailVerifiedAt: null,
      twoFASecret: null,
    });
    jwtService.sign.mockReturnValue('signed-token');
    prisma.refreshToken.create.mockResolvedValue({ id: 10 });

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.access_token).toBe('signed-token');
    expect(result.refresh_token).toMatch(/^[a-f0-9]{64}$/);
    expect(result.requiresTwoFactor).toBeUndefined();
  });

  it('requires 2FA without minting tokens when email 2FA is enabled', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      passwordHash: await argon2.hash('password123'),
      name: 'Test User',
      role: 'USER',
      emailVerifiedAt: null,
      twoFASecret: 'EMAIL_2FA_ENABLED',
    });
    prisma.verificationToken.updateMany.mockResolvedValue({ count: 0 });
    prisma.verificationToken.create.mockResolvedValue({ id: 1 });

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.access_token).toBeNull();
    expect(result.refresh_token).toBeNull();
    expect(result.requiresTwoFactor).toBe(true);
    expect(mailerService.sendTwoFactorCode).toHaveBeenCalled();
  });

  it('rotates refresh tokens and links the old token to the new one', async () => {
    jest.spyOn(service, 'generateAccessToken').mockResolvedValue('new-access-token');
    jest.spyOn(service, 'generateRefreshToken').mockResolvedValue('new-refresh-token');

    prisma.refreshToken.findUnique
      .mockResolvedValueOnce({
        id: 5,
        userId: 1,
        tokenHash: 'old-hash',
        revokedAt: null,
        replacedByTokenId: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: { id: 1, email: 'test@example.com', role: 'USER' },
      })
      .mockResolvedValueOnce({ id: 9 });

    const result = await service.refresh('old-refresh-token');

    expect(result).toEqual({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    });
    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { replacedByTokenId: 9 },
    });
  });

  it('revokes all user refresh tokens when a reused token is detected', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 5,
      userId: 1,
      tokenHash: 'old-hash',
      revokedAt: null,
      replacedByTokenId: 12,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 1, email: 'test@example.com', role: 'USER' },
    });

    await expect(service.refresh('reused-token')).rejects.toThrow(UnauthorizedException);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('sends the plain password reset token while storing only its hash', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: 'test@example.com',
      name: 'Test User',
    });
    prisma.verificationToken.updateMany.mockResolvedValue({ count: 0 });
    prisma.verificationToken.create.mockImplementation(async ({ data }: any) => ({ id: 77, ...data }));

    await service.requestReset({ email: 'test@example.com' });

    const storedHash = prisma.verificationToken.create.mock.calls[0][0].data.tokenHash;
    const mailedToken = mailerService.sendPasswordResetEmail.mock.calls[0][1];

    expect(mailedToken).toMatch(/^[a-f0-9]{64}$/);
    expect(mailedToken).not.toBe(storedHash);
  });
});
