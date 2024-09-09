import { Test, TestingModule } from '@nestjs/testing';
import { LockModule } from './lock.module';
import { LockService } from '../service/lock.service';

jest.mock('../../../config/lock/lock', () => ({
  getLockConfig: jest.fn(() => ({
    redisOptions: { url: 'redis://localhost:6380', password: 'secret' },
    wait: 100,
    maxAttempts: 3,
    logLevel: 'info',
    ignoreUnlockFail: false,
  })),
}));

describe('LockModule', () => {
  let lockModule: LockModule;
  let lockService: LockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LockModule],
    }).compile();

    lockModule = module.get<LockModule>(LockModule);
    lockService = module.get<LockService>(LockService);
  });

  it('should be defined', () => {
    expect(lockModule).toBeDefined();
  });

  it('should have LockService', () => {
    expect(lockService).toBeDefined();
  });
});
