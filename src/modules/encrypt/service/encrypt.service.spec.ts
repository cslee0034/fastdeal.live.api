import { Test, TestingModule } from '@nestjs/testing';
import { EncryptService } from './encrypt.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn((key) => {
    return 'hashed_' + key;
  }),
  compare: jest.fn((key, hashedKey) => {
    if (hashedKey === 'hashed_' + key) {
      return true;
    }

    return false;
  }),

  compareAndThrow: jest.fn(),
}));

describe('EncryptService', () => {
  let service: EncryptService;

  const mockConfigService = {
    get: jest.fn((key: string): number | string => {
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
          // class가 아니라 value만을 이용할 때는 useValue로 provide
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

    it('should be defined', () => {
      expect(service.hash).toBeDefined();
    });

    it('should get salt from configService', async () => {
      await service.hash(key);

      expect(mockConfigService.get).toHaveBeenCalledWith('encrypt.salt');
    });

    it('should return hashed key', async () => {
      const hashedKey = await service.hash(key);
      const isMatch = await bcrypt.compare(key, hashedKey);

      expect(isMatch).toBe(true);
    });

    it('should throw InternalServerErrorException if hash fails', async () => {
      bcrypt.hash.mockRejectedValueOnce(new Error('Failed to hash key'));

      await expect(service.hash(key)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('compare', () => {
    it('should be defined', () => {
      expect(service.compare).toBeDefined();
    });

    it('should return boolean', async () => {
      const key = 'un_encrypted key';
      const hashedKey = await service.hash(key);
      const isMatch = await bcrypt.compare(key, hashedKey);

      expect(typeof isMatch).toBe('boolean');
    });

    it('should throw InternalServerErrorException if compare fails', async () => {
      bcrypt.compare.mockRejectedValueOnce(new Error('Failed to compare key'));

      await expect(service.compare('key', 'hashed_key')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('compareAndThrow', () => {
    it('should be defined', () => {
      expect(service.compareAndThrow).toBeDefined();
    });

    it('should throw UnauthorizedException if compare fails', async () => {
      await expect(
        service.compareAndThrow('key', 'not_hashed_key'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
