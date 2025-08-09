import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { LoginDto } from '../../src/auth/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: {
          id: 1,
          email: loginDto.email,
          name: 'Test User',
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: loginDto.email,
        sub: 1,
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: loginDto.email, sub: 1 },
        { expiresIn: '7d' }
      );
    });
  });

  describe('refresh', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { email: 'test@example.com', sub: 1 };
      const mockNewAccessToken = 'new-access-token';
      const mockNewRefreshToken = 'new-refresh-token';

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockNewAccessToken)
        .mockReturnValueOnce(mockNewRefreshToken);

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({
        access_token: mockNewAccessToken,
        refresh_token: mockNewRefreshToken,
      });

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, { expiresIn: '7d' });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const userId = 1;
      const result = await service.logout(userId);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
