import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/service/users.service';
import { Tokens } from '../../../infrastructure/token/interface/tokens.interface';
import { SignInDto } from '../dto/signin.dto';
import { SignUpDto } from '../dto/signup.dto';
import { UserAlreadyExistsError } from '../../users/error/user-already-exists';
import { PasswordDoesNotMatch } from '../../../infrastructure/encrypt/error/password-does-not-match';
import { FailedToGetRefreshTokenError } from '../../../infrastructure/cache/error/failed-to-get-refresh-token';
import { FailedToDeleteRefreshTokenError } from '../../../infrastructure/cache/error/failed-to-delete-refresh-token';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    createUser: jest
      .fn()
      .mockImplementation((mockSignUpDto: SignUpDto): Promise<UserEntity> => {
        if (
          mockSignUpDto.email === 'test@email.com' &&
          mockSignUpDto.password === 'test_password' &&
          mockSignUpDto.firstName === 'test_first_name' &&
          mockSignUpDto.lastName === 'test_last_name'
        ) {
          return Promise.resolve(mockCreateUserResult);
        } else {
          return Promise.reject(new UserAlreadyExistsError());
        }
      }),

    validateUserPassword: jest
      .fn()
      .mockImplementation((mockSignInDto: SignInDto): Promise<UserEntity> => {
        if (
          mockSignInDto.email === 'test@email.com' &&
          mockSignInDto.password === 'test_password'
        ) {
          return Promise.resolve(mockFindOneResult);
        } else {
          return Promise.reject(new PasswordDoesNotMatch());
        }
      }),

    findOneByIdAndThrow: jest
      .fn()
      .mockImplementation((id: string): Promise<UserEntity> => {
        if (id === '1') {
          return Promise.resolve(mockFindOneResult);
        } else {
          return Promise.reject(new NotFoundException('User not found'));
        }
      }),
  };

  const mockAuthService = {
    login: jest.fn().mockImplementation((user: UserEntity): Promise<Tokens> => {
      if (user) {
        return Promise.resolve(mockTokenResult);
      } else {
        return Promise.reject(
          new InternalServerErrorException('Failed to generate tokens'),
        );
      }
    }),

    logout: jest.fn().mockImplementation((id: string): Promise<boolean> => {
      if (id) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(new FailedToDeleteRefreshTokenError());
      }
    }),

    checkIsLoggedIn: jest
      .fn()
      .mockImplementation(
        (id: string, refreshToken: string): Promise<boolean> => {
          if (id && refreshToken) {
            return Promise.resolve(true);
          } else {
            return Promise.reject(new FailedToGetRefreshTokenError());
          }
        },
      ),
  };

  const mockSignUpDto: SignUpDto = {
    email: 'test@email.com',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'test_password',
  };

  const mockLoginDto: SignInDto = {
    email: 'test@email.com',
    password: 'test_password',
  };

  const mockCreateUserResult: UserEntity = new UserEntity({
    id: '1',
    email: 'test@email.com',
    provider: 'local',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'hashed_test_password',
  });

  const mockFindOneResult: UserEntity = new UserEntity({
    id: '1',
    email: 'test@email.com',
    provider: 'local',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'hashed_test_password',
  });

  const mockTokenResult: Tokens = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('회원가입을 하고 토큰을 발행한다', async () => {
      const result = await controller.signup(mockSignUpDto);

      expect(result).toEqual(mockTokenResult);
      expect(usersService.createUser).toHaveBeenCalledWith(mockSignUpDto);
      expect(authService.login).toHaveBeenCalledWith(mockCreateUserResult);
    });

    it('유저가 이미 존재할 경우 UserAlreadyExistsError를 반환한다', async () => {
      mockUsersService.createUser.mockRejectedValueOnce(
        new UserAlreadyExistsError(),
      );

      await expect(controller.signup(mockSignUpDto)).rejects.toThrow(
        UserAlreadyExistsError,
      );
    });
  });

  describe('signin', () => {
    it('로그인을 하고 토큰을 발행한다', async () => {
      const result = await controller.signin(mockLoginDto);

      expect(result).toEqual(mockTokenResult);
      expect(usersService.validateUserPassword).toHaveBeenCalledWith(
        mockLoginDto,
      );
      expect(authService.login).toHaveBeenCalledWith(mockFindOneResult);
    });

    it('비밀번호가 일치하지 않는다면 PasswordDoesNotMatch를 반환한다', async () => {
      mockUsersService.validateUserPassword.mockRejectedValueOnce(
        new PasswordDoesNotMatch(),
      );

      await expect(controller.signin(mockLoginDto)).rejects.toThrow(
        PasswordDoesNotMatch,
      );
    });
  });

  describe('logout', () => {
    it('로그아웃을 한다', async () => {
      const result = await controller.logout('1');

      expect(result).toEqual({ success: true });
      expect(authService.logout).toHaveBeenCalledWith('1');
    });

    it('로그아웃에 실패할 경우 FailedToDeleteRefreshTokenError를 반환한다', async () => {
      mockAuthService.logout.mockRejectedValueOnce(
        new FailedToDeleteRefreshTokenError(),
      );

      await expect(controller.logout('1')).rejects.toThrow(
        FailedToDeleteRefreshTokenError,
      );
    });
  });

  describe('refreshTokens', () => {
    it('리프래시 토큰을 발행한다', async () => {
      mockUsersService.findOneByIdAndThrow.mockResolvedValueOnce(
        mockFindOneResult,
      );
      const result = await controller.refreshTokens('1', 'valid_refresh_token');

      expect(result).toEqual(mockTokenResult);
      expect(authService.checkIsLoggedIn).toHaveBeenCalledWith(
        '1',
        'valid_refresh_token',
      );
      expect(usersService.findOneByIdAndThrow).toHaveBeenCalledWith('1');
      expect(authService.login).toHaveBeenCalledWith(mockFindOneResult);
    });

    it('리프래시 토큰을 가져오는데 실패한다면 FailedToGetRefreshTokenError를 반환한다', async () => {
      mockAuthService.checkIsLoggedIn.mockRejectedValueOnce(
        new FailedToGetRefreshTokenError(),
      );

      await expect(
        controller.refreshTokens('1', 'invalid_refresh_token'),
      ).rejects.toThrow(FailedToGetRefreshTokenError);
    });
  });
});
