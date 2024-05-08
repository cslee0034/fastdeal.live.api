import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { RefreshTokenGuard } from './refresh-token.guard';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;

  const mockReflector = createMock<Reflector>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshTokenGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
