import { Test, TestingModule } from '@nestjs/testing';
import { EncryptService } from './encrypt.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { FailedToHashKey } from '../error/failed-to-hash-key';
import { FailedToCompareKey } from '../error/failed-to-compare-key';
import { PasswordDoesNotMatch } from '../error/password-does-not-match';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((key) => {
    return Promise.resolve('hashed_' + key);
  }),

  compare: jest.fn().mockImplementation((key, hashedKey) => {
    if (hashedKey === 'hashed_' + key) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }),

  compareAndThrow: jest.fn(),
}));

describe('EncryptService', () => {
  let service: EncryptService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'encrypt.salt') {
        return 'salt';
      }

      return key;
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EncryptService>(EncryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    const key = 'un_encrypted key';
    it('configService에서 salt를 가져와야 한다', async () => {
      await service.hash(key);

      expect(mockConfigService.get).toHaveBeenCalledWith('encrypt.salt');
    });

    it('hash된 key를 반환해야 한다', async () => {
      const hashedKey = await service.hash(key);
      const isMatch = await bcrypt.compare(key, hashedKey);

      expect(isMatch).toBe(true);
    });

    it('해싱에 실패하면 FailedToHashKey를 반환해야 한다', async () => {
      bcrypt.hash.mockRejectedValueOnce(new Error('Failed to hash key'));

      await expect(service.hash(key)).rejects.toThrow(new FailedToHashKey());
    });
  });

  describe('compare', () => {
    it('boolean값을 반환해야 한다', async () => {
      const key = 'un_encrypted key';
      const hashedKey = await service.hash(key);
      const isMatch = await bcrypt.compare(key, hashedKey);

      expect(typeof isMatch).toBe('boolean');
    });

    it('bcrypt에서 compare가 실패하면 FailedToCompareKey를 반환해야 한다', async () => {
      bcrypt.compare.mockRejectedValueOnce(new Error('Failed to compare key'));

      await expect(service.compare('key', 'hashed_key')).rejects.toThrow(
        new FailedToCompareKey(),
      );
    });
  });

  describe('compareAndThrow', () => {
    it('compare키가 password와 다르다면 PasswordDoesNotMatch를 반환해야 한다', async () => {
      await expect(
        service.compareAndThrow('key', 'not_hashed_key'),
      ).rejects.toThrow(new PasswordDoesNotMatch());
    });

    it('compare가 성공한다면 true를 반환한다.', async () => {
      await expect(
        service.compareAndThrow('key', 'hashed_key'),
      ).resolves.toEqual(true);
    });
  });
});
