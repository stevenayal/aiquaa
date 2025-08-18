import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RbacGuard } from '../../src/auth/guards/rbac.guard';
import { Reflector } from '@nestjs/core';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RbacGuard>(RbacGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when user has required role', () => {
      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              id: 1,
              email: 'test@example.com',
              role: 'ADMIN',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              id: 1,
              email: 'test@example.com',
              role: 'USER',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow access when no roles are required', () => {
      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              id: 1,
              email: 'test@example.com',
              role: 'USER',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(null);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user is not authenticated', () => {
      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: null,
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });
});
