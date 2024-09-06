import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../repository/users.repository';
import { EncryptService } from '../../../infrastructure/encrypt/service/encrypt.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserAlreadyExistsError } from '../error/user-already-exists';
import { FailedToGetUserError } from '../error/failed-to-get-user';
import { UserNotFoundError } from '../error/user-not-found';
import { FailedToCreateUserError } from '../error/failed-to-create-user';
import { UserEntity } from '../entities/user.entity';
import { PasswordDoesNotMatch } from '../../../infrastructure/encrypt/error/password-does-not-match';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUserRepository = {
    findOneById: jest.fn().mockImplementation((id: string) => {
      if (id === mockExistingUserId) {
        return Promise.resolve(mockExistingUserEntity);
      } else {
        return Promise.resolve(null);
      }
    }),

    findOneByEmail: jest.fn().mockImplementation((email: string) => {
      if (email === mockExistingUserEmail) {
        return Promise.resolve(mockExistingUserEntity);
      } else {
        return Promise.resolve(null);
      }
    }),

    create: jest.fn().mockImplementation((user: CreateUserDto) => {
      return Promise.resolve(
        new UserEntity({
          id: mockId,
          ...user,
        }),
      );
    }),
  };

  const mockEncryptService = {
    hash: jest.fn().mockImplementation(async (prop: string) => {
      return 'hashed_' + prop;
    }),
    compareAndThrow: jest
      .fn()
      .mockImplementation(async (password, userPassword) => {
        if ('hashed_' + password !== userPassword) {
          throw new PasswordDoesNotMatch();
        } else {
          return;
        }
      }),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCreateUserDto = new CreateUserDto();
  mockCreateUserDto.email = 'test@email.com';
  mockCreateUserDto.firstName = 'test_first_name';
  mockCreateUserDto.lastName = 'test_last_name';
  mockCreateUserDto.password = 'test_password';

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockPassword = 'test_password';
  const mockHashedPassword = 'hashed_' + mockPassword;

  const mockNewUserEntity = new UserEntity({
    ...mockCreateUserDto,
    id: mockId,
    password: mockHashedPassword,
  });

  const mockExistingUserId = 'existing_user_id';
  const mockExistingUserEmail = 'existing@email.com';

  const mockExistingUserEntity = new UserEntity({
    ...mockCreateUserDto,
    id: mockExistingUserId,
    email: mockExistingUserEmail,
    password: mockHashedPassword,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUserRepository,
        },
        {
          provide: EncryptService,
          useValue: mockEncryptService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('유저를 생성해야 한다', async () => {
      const result = await service.createUser(
        mockCreateUserDto as CreateUserDto,
      );

      expect(result).toEqual(mockNewUserEntity);
      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(
        mockCreateUserDto.email,
      );
      expect(mockEncryptService.hash).toHaveBeenCalledWith(
        mockCreateUserDto.password,
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: mockHashedPassword,
      });
    });

    it('유저 조회에 실패하면 FailedToGetUserError 반환', async () => {
      mockUserRepository.findOneByEmail.mockRejectedValue(new Error());

      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        FailedToGetUserError,
      );
    });

    it('유저가 이미 존재한다면 UserAlreadyExistsError 반환', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(
        mockExistingUserEntity,
      );

      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        UserAlreadyExistsError,
      );
    });

    it('유저 생성에 실패하면 FailedToCreateUserError 반환', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error());

      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        FailedToCreateUserError,
      );
    });
  });

  describe('findOneByIdAndThrow', () => {
    it('유저가 존재한다면 유저 엔티티 반환', async () => {
      const result = await service.findOneByIdAndThrow(mockExistingUserId);

      expect(result).toEqual(mockExistingUserEntity);
      expect(mockUserRepository.findOneById).toHaveBeenCalledWith(
        mockExistingUserId,
      );
    });

    it('유저 조회에 실패하면 FailedToGetUserError 반환', async () => {
      mockUserRepository.findOneById.mockRejectedValue(new Error());

      await expect(
        service.findOneByIdAndThrow(mockExistingUserId),
      ).rejects.toThrow(FailedToGetUserError);
    });

    it('유저가 존재하지 않으면 UserNotFoundError 반환', async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      await expect(
        service.findOneByIdAndThrow('non_existing_user_id'),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('validateUserPassword', () => {
    it('유저 비밀번호 검증 성공', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(
        mockExistingUserEntity,
      );

      const result = await service.validateUserPassword({
        email: mockExistingUserEmail,
        password: mockPassword,
      });

      expect(result).toEqual(mockExistingUserEntity);
      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(
        mockExistingUserEmail,
      );
      expect(mockEncryptService.compareAndThrow).toHaveBeenCalledWith(
        mockPassword,
        mockExistingUserEntity.password,
      );
    });

    it('유저가 존재하지 않으면 UserNotFoundError 반환', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.validateUserPassword({
          email: 'test@email.com',
          password: 'password',
        }),
      ).rejects.toThrow(UserNotFoundError);
    });

    it('유저 조회에 실패하면 FailedToGetUserError 반환', async () => {
      mockUserRepository.findOneByEmail.mockRejectedValue(new Error());

      await expect(
        service.validateUserPassword({
          email: 'test@email.com',
          password: 'password',
        }),
      ).rejects.toThrow(FailedToGetUserError);
    });
  });
});
