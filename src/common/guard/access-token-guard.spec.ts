import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AccessTokenGuard } from './access-token-guard';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let reflector: Reflector;

  const mockReflector = createMock<Reflector>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AccessTokenGuard>(AccessTokenGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if route is public', () => {
    const context = createMock<ExecutionContext>();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should call super.canActivate if route is not public', async () => {
    const context = createMock<ExecutionContext>();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const canActivateSpy = jest
      .spyOn(AccessTokenGuard.prototype, 'canActivate')
      .mockImplementation(() => true);

    const result = await guard.canActivate(context);

    expect(canActivateSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);

    canActivateSpy.mockRestore();
  });
});
