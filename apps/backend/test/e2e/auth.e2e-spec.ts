jest.mock('@nestjs/passport', () => ({
  AuthGuard: (name: string) => {
    class MockAuthGuard {
      canActivate(context: any) {
        const req = context.switchToHttp().getRequest();

        if (name === 'google' || name === 'github') {
          req.user = { id: 1, email: 'oauth@example.com', role: 'USER' };
        }

        return true;
      }
    }

    return MockAuthGuard;
  },
}));

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { JwtRefreshGuard } from '../../src/auth/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: any;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      requestReset: jest.fn(),
      resetPassword: jest.fn(),
      verifyEmail: jest.fn(),
      changePassword: jest.fn(),
      getActiveSessions: jest.fn(),
      logoutFromDevice: jest.fn(),
      sendTwoFactorCode: jest.fn(),
      verifyTwoFactorCode: jest.fn(),
      completeTwoFactorLogin: jest.fn(),
      enableTwoFactorEmail: jest.fn(),
      disableTwoFactorEmail: jest.fn(),
      isTwoFactorEnabled: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: string) => {
              const values: Record<string, string> = {
                REFRESH_COOKIE_NAME: 'aiq_rt',
                JWT_REFRESH_TTL: '3600',
              };
              return values[key] ?? fallback;
            }),
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                FRONT_ORIGIN: 'https://aiquaa.com',
              };
              return values[key];
            }),
          },
        },
        {
          provide: JwtRefreshGuard,
          useValue: {
            canActivate: jest.fn((context) => {
              const req = context.switchToHttp().getRequest();
              req.user = { id: 1 };
              return true;
            }),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn((context) => {
              const req = context.switchToHttp().getRequest();
              req.user = { id: 1 };
              return true;
            }),
          },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login sets the refresh cookie and keeps it out of the body', async () => {
    authService.login.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: { id: 1, email: 'user@example.com', role: 'USER' },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(200);

    expect(response.body).toEqual({
      access_token: 'access-token',
      user: { id: 1, email: 'user@example.com', role: 'USER' },
    });
    expect(response.headers['set-cookie'][0]).toContain('aiq_rt=refresh-token');
  });

  it('POST /auth/refresh reads the refresh token from the cookie', async () => {
    authService.refresh.mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', ['aiq_rt=refresh-cookie'])
      .expect(200);

    expect(authService.refresh).toHaveBeenCalledWith('refresh-cookie');
    expect(response.body).toEqual({ access_token: 'new-access-token' });
    expect(response.headers['set-cookie'][0]).toContain('aiq_rt=new-refresh-token');
  });

  it('GET /auth/google/callback redirects to the frontend callback URL', async () => {
    authService.generateAccessToken.mockResolvedValue('oauth-access');
    authService.generateRefreshToken.mockResolvedValue('oauth-refresh');

    const response = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .expect(302);

    expect(response.headers.location).toBe('https://aiquaa.com/oauth-callback?access_token=oauth-access');
    expect(response.headers['set-cookie'][0]).toContain('aiq_rt=oauth-refresh');
  });
});
