import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { GoogleAuthGuard } from './google-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;

  const mockReflector = createMock<Reflector>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<GoogleAuthGuard>(GoogleAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call super.canActivate', async () => {
    const context = createMock<ExecutionContext>();
    const canActivateSpy = jest
      .spyOn(GoogleAuthGuard.prototype, 'canActivate')
      .mockImplementation(async () => true);

    await guard.canActivate(context);

    expect(canActivateSpy).toHaveBeenCalledWith(context);
    canActivateSpy.mockRestore();
  });
});
