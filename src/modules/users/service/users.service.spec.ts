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
import { SellerApplicationEntity } from '../entities/seller-application.entity';
import { FailedToCreateSellerApplicationError } from '../error/failed-to-create-seller-application';
import { FailedToUpdateSellerApplicationError } from '../error/failed-to-update-seller-application';

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

    applyToSeller: jest.fn().mockImplementation((applyToSellerDto) => {
      return Promise.resolve(new SellerApplicationEntity(applyToSellerDto));
    }),

    approveToSeller: jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(new SellerApplicationEntity(mockApplyToSellerDto));
    }),

    rejectToSeller: jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(new SellerApplicationEntity(mockApplyToSellerDto));
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

  const mockApplyToSellerDto = {
    userId: mockId,
    description: '판매자 신청합니다',
  };

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

  describe('applyToSeller', () => {
    it('유저가 존재하면 판매자 신청 성공', async () => {
      mockUserRepository.findOneById.mockResolvedValue(mockExistingUserEntity);

      const result = await service.applyToSeller(mockApplyToSellerDto);

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSellerDto));
      expect(mockUserRepository.findOneById).toHaveBeenCalledWith(mockId);
      expect(mockUserRepository.applyToSeller).toHaveBeenCalledWith(
        mockApplyToSellerDto,
      );
    });

    it('유저가 존재하지 않으면 UserNotFoundError 반환', async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      await expect(service.applyToSeller(mockApplyToSellerDto)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('유저 조회에 실패하면 FailedToGetUserError 반환', async () => {
      mockUserRepository.findOneById.mockRejectedValue(new Error());

      await expect(service.applyToSeller(mockApplyToSellerDto)).rejects.toThrow(
        FailedToGetUserError,
      );
    });

    it('판매자 신청에 실패하면 FailedToCreateSellerApplicationError 반환', async () => {
      mockUserRepository.findOneById.mockResolvedValue(mockExistingUserEntity);
      mockUserRepository.applyToSeller.mockRejectedValue(new Error());

      await expect(service.applyToSeller(mockApplyToSellerDto)).rejects.toThrow(
        FailedToCreateSellerApplicationError,
      );
    });
  });

  describe('approveToSeller', () => {
    it('판매자 신청 승인 성공', async () => {
      const result = await service.approveToSeller(mockId);

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSellerDto));
      expect(mockUserRepository.approveToSeller).toHaveBeenCalledWith(mockId);
    });

    it('판매자 신청 승인에 실패하면 FailedToUpdateSellerApplicationError 반환', async () => {
      mockUserRepository.approveToSeller.mockRejectedValue(new Error());

      await expect(service.approveToSeller(mockId)).rejects.toThrow(
        FailedToUpdateSellerApplicationError,
      );
    });
  });

  describe('rejectToSeller', () => {
    it('판매자 신청 거절 성공', async () => {
      const result = await service.rejectToSeller(mockId);

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSellerDto));
      expect(mockUserRepository.rejectToSeller).toHaveBeenCalledWith(mockId);
    });

    it('판매자 신청 거절에 실패하면 FailedToUpdateSellerApplicationError 반환', async () => {
      mockUserRepository.rejectToSeller.mockRejectedValue(new Error());

      await expect(service.rejectToSeller(mockId)).rejects.toThrow(
        FailedToUpdateSellerApplicationError,
      );
    });
  });
});
