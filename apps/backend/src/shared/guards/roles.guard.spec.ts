import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  describe('canActivate', () => {
    let mockExecutionContext: jest.Mocked<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        user: { role: UserRole.CLIENT_USER },
      };

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as any;
    });

    it('should allow access when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.CLIENT_USER]);
      mockRequest.user.role = UserRole.CLIENT_USER;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.CLIENT_ADMIN]);
      mockRequest.user.role = UserRole.CLIENT_USER;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.CLIENT_ADMIN,
        UserRole.CLIENT_USER,
      ]);
      mockRequest.user.role = UserRole.CLIENT_USER;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user has none of the required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.CLIENT_ADMIN,
        UserRole.SUPER_ADMIN,
      ]);
      mockRequest.user.role = UserRole.CLIENT_USER;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should call reflector with correct parameters', () => {
      const handler = mockExecutionContext.getHandler();
      const classRef = mockExecutionContext.getClass();

      reflector.getAllAndOverride.mockReturnValue([UserRole.CLIENT_USER]);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        handler,
        classRef,
      ]);
    });
  });
});
