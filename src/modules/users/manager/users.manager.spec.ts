import { Test } from '@nestjs/testing';
import { UsersManager } from './users.manager';
import { ForbiddenException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { Provider } from '@prisma/client';

describe('UsersManager', () => {
  let manager: UsersManager;

  const mockUser = {
    id: '1',
    email: 'test@email.com',
    password: 'test_password',
    provider: Provider.local,
  } as UserEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersManager],
    }).compile();

    manager = module.get<UsersManager>(UsersManager);
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  describe('validateLocalUser', () => {
    it('should be defined', () => {
      expect(manager.validateLocalUser).toBeDefined();
    });

    it('should return undefined if user is not exists', () => {
      const existingUser = null;

      const result = manager.validateLocalUser(existingUser);

      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenException if user already exists with local provider', () => {
      expect(() => manager.validateLocalUser(mockUser)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user already exists', () => {
      const googleUser = {
        ...mockUser,
        provider: Provider.google,
      } as UserEntity;

      expect(() => manager.validateLocalUser(googleUser)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('validateOauthUser', () => {
    it('should be defined', () => {
      expect(manager.validateOauthUser).toBeDefined();
    });

    it('should return undefined if user is not exists', () => {
      const existingUser = null;

      const result = manager.validateOauthUser(existingUser);

      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenException if user already exists with local provider', () => {
      expect(() => manager.validateOauthUser(mockUser)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user already exists', () => {
      const googleUser = {
        ...mockUser,
        provider: Provider.google,
      } as UserEntity;

      expect(() => manager.validateOauthUser(googleUser)).toThrow(
        ForbiddenException,
      );
    });
  });
});
