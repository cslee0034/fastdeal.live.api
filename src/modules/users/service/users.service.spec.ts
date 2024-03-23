import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../repository/users.repository';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '@prisma/client';
import { EncryptService } from '../../encrypt/service/encrypt.service';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  const mockUserRepository = {
    findOneByEmail: jest.fn((email: string): Promise<User> => {
      if (email === 'existing@email.com') {
        return Promise.resolve(new UserEntity({ email }));
      } else {
        return Promise.resolve(null);
      }
    }),

    create: jest.fn((): Promise<User> => {
      return;
    }),
  };

  const mockEncryptService = {
    hash: jest.fn((key: string) => {
      return 'hashed_' + key;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: EncryptService,
          useValue: mockEncryptService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@email.com',
      name: 'test_name',
      password: 'test_password',
    };

    it('should be defined', () => {
      expect(service.create).toBeDefined();
    });

    it('should call findOneByEmail', async () => {
      await service.create(mockCreateUserDto as CreateUserDto);

      expect(repository.findOneByEmail).toHaveBeenCalledWith(
        mockCreateUserDto.email,
      );
    });

    it('should throw error if user exists', async () => {
      const mockCreateUserDto: CreateUserDto = {
        email: 'existing@email.com',
        name: 'test_name',
        password: 'test_password',
      };

      // service.create()의 반환값인 promise를 테스트 대상으로 하여 내부에서 발생하는 예외를 확인한다
      await expect(
        service.create(mockCreateUserDto as CreateUserDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error if it fails to create user', async () => {
      repository.create.mockRejectedValueOnce(
        new Error('Failed to create user'),
      );

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should called with encrypted password', async () => {
      const mockCreateUserDto = {
        email: 'test@email.com',
        name: 'test_name',
        password: 'test_password',
      };

      await service.create(mockCreateUserDto as CreateUserDto);

      expect(repository.create).toBeCalledWith(
        expect.objectContaining({
          email: 'test@email.com',
          name: 'test_name',
          password: 'hashed_test_password',
        }),
      );
    });

    it('should return user entity', async () => {
      const user = await service.create(mockCreateUserDto as CreateUserDto);

      expect(user).toBeInstanceOf(UserEntity);
    });
  });

  describe('findOneByEmail', () => {
    const email = 'existing@email.com';

    it('should be defined', () => {
      expect(service.findOneByEmail).toBeDefined();
    });

    it('should call findOneByEmail', async () => {
      await service.findOneByEmail(email as string);

      expect(repository.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw error if user is not exists', async () => {
      const email = 'not_existing@email.com';

      await expect(service.findOneByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user entity if user exists', async () => {
      const email = 'existing@email.com';

      const result = await service.findOneByEmail(email);

      expect(result).toBeInstanceOf(UserEntity);
    });
  });
});
