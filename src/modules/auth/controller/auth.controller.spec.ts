import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';
import {
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';
import { Tokens } from '../interfaces/tokens.interface';
import { EncryptService } from '../../encrypt/service/encrypt.service';
import { SignInDto } from '../dto/request/signin.dto';
import * as httpMocks from 'node-mocks-http';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let encryptService: EncryptService;

  const oauthProviders = ['google'];

  const mockUsersService = {
    createLocal: jest
      .fn()
      .mockImplementation((mockSignUpDto: SignUpDto): Promise<UserEntity> => {
        if (
          mockSignUpDto.email === 'test@email.com' &&
          mockSignUpDto.provider === 'local' &&
          mockSignUpDto.password === 'test_password' &&
          mockSignUpDto.firstName === 'test_first_name' &&
          mockSignUpDto.lastName === 'test_last_name'
        ) {
          return Promise.resolve(mockCreateUserResult);
        } else {
          return Promise.reject(new ForbiddenException('User already exists'));
        }
      }),

    findOneByEmail: jest.fn((email: string): Promise<UserEntity> => {
      if (email === mockLoginDto.email) {
        return Promise.resolve(mockFindOneResult);
      } else {
        return Promise.reject(new NotFoundException('User not found'));
      }
    }),

    findOneById: jest
      .fn()
      .mockImplementation((id: string): Promise<UserEntity> => {
        if (id === '1') {
          return Promise.resolve(mockFindOneResult);
        } else {
          return Promise.reject(new NotFoundException('User not found'));
        }
      }),

    findOrCreateOauth: jest
      .fn()
      .mockImplementation(
        ({
          email,
          provider,
          firstName,
          lastName,
        }: {
          email: string;
          provider: string;
          firstName: string;
          lastName: string;
        }): Promise<UserEntity> => {
          if (
            email === 'test@email.com' &&
            oauthProviders.includes(provider) &&
            firstName === 'test_first_name' &&
            lastName === 'test_last_name'
          ) {
            return Promise.resolve(mockOauthUserResult);
          } else {
            return Promise.reject(new InternalServerErrorException());
          }
        },
      ),

    convertUserResponse: jest.fn().mockImplementation((user: UserEntity) => {
      return {
        success: true,
        email: user?.email,
        provider: user?.provider || 'local',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        // milliseconds가 기본 값이므로 초로 변환
        expiresIn: mockExpiresIn / 1000,
      };
    }),
  };

  const mockAuthService = {
    login: jest.fn().mockImplementation((user: UserEntity): Promise<Tokens> => {
      if (user) {
        return Promise.resolve(mockTokenResult);
      } else {
        return Promise.reject(
          new InternalServerErrorException('Failed to set refresh token'),
        );
      }
    }),

    logout: jest.fn().mockImplementation((id: string): Promise<boolean> => {
      if (id) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(
          new InternalServerErrorException('Failed to delete refresh token'),
        );
      }
    }),

    checkIsLoggedIn: jest
      .fn()
      .mockImplementation((id: number, email: string): Promise<Tokens> => {
        if (id && email) {
          return Promise.resolve(mockTokenResult);
        } else {
          return Promise.reject(
            new InternalServerErrorException('Failed to get refresh token'),
          );
        }
      }),

    redirectUser: jest
      .fn()
      .mockImplementation((response: Response, user: UserEntity) => {
        if (user) {
          return response.redirect(mockRedirectUrl);
        }
      }),

    redirectUserWithError: jest
      .fn()
      .mockImplementation((response: Response, error: Error) => {
        if (error) {
          return response.redirect(mockRedirectErorUrl);
        }
      }),

    response: jest
      .fn()
      .mockImplementation(
        (
          user: UserEntity,
          tokens: Tokens,
          response: Response,
          status: number,
        ) => {
          if (user && tokens && response && status) {
            return response.json({
              success: true,
              email: user.email,
              provider: user.provider,
              firstName: user.firstName,
              lastName: user.lastName,
              expiresIn: mockExpiresIn,
            });
          }
        },
      ),
  };

  const mockEncryptService = {
    compare: jest.fn((key: string, hashedKey: string): Promise<boolean> => {
      if (hashedKey === 'hashed_' + key) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }),

    compareAndThrow: jest
      .fn()
      .mockImplementation((key: string, hashedKey: string): Promise<void> => {
        if (mockEncryptService.compare(key, hashedKey)) {
          return Promise.resolve();
        } else {
          Promise.reject(new UnauthorizedException('Key does not match'));
        }
      }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'jwt.refresh.expiresIn':
          return mockExpiresIn;
        default:
          return key;
      }
    }),
  };

  const mockSignUpDto: SignUpDto = {
    email: 'test@email.com',
    provider: 'local',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'test_password',
  };

  const mockLoginDto: SignInDto = {
    email: 'test@email.com',
    password: 'test_password',
  };

  const mockOauthUserDto = {
    email: 'test@email.com',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    provider: 'google',
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

  const mockOauthUserResult: UserEntity = new UserEntity({
    id: '2',
    email: 'test@email.com',
    provider: 'google',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'hashed_test_password',
  });

  const mockTokenResult: Tokens = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

  const mockExpiresIn = 3600;

  const mockRedirectUrl = 'client.url/api/auth/google';

  const mockRedirectErorUrl = 'client.url/api/auth/google?error';

  const mockResponse = httpMocks.createResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EncryptService, useValue: mockEncryptService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    encryptService = module.get<EncryptService>(EncryptService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sign-up', () => {
    it('should be defined', () => {
      expect(controller.signup).toBeDefined();
    });

    it('should call userService.create with SignUpDto', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(usersService.createLocal).toHaveBeenCalledWith(
        mockSignUpDto as SignUpDto,
      );
    });

    it("should call login with user's information", async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(mockCreateUserResult);
    });

    it('should call auth service response', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.response).toHaveBeenCalledWith({
        user: mockCreateUserResult,
        tokens: mockTokenResult,
        response: mockResponse,
        status: HttpStatus.CREATED,
      });
    });
  });

  describe('sign-in', () => {
    it('should be defined', () => {
      expect(controller.signin).toBeDefined();
    });

    it('should call userService.findOneByEmail with LoginUpDto', async () => {
      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        mockLoginDto.email as string,
      );
    });

    it('should call encryptService.compareAndThrow with password', async () => {
      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(encryptService.compareAndThrow).toHaveBeenCalledWith(
        mockLoginDto.password as string,
        mockFindOneResult.password as string,
      );
    });

    it("should call login with user's information", async () => {
      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(
        mockFindOneResult as UserEntity,
      );
    });

    it('should call auth service response', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.response).toHaveBeenCalledWith({
        user: mockCreateUserResult,
        tokens: mockTokenResult,
        response: mockResponse,
        status: HttpStatus.CREATED,
      });
    });
  });

  describe('google', () => {
    it('should be defined', () => {
      expect(controller.google).toBeDefined();
    });

    it('should return { success: true }', async () => {
      const result = await controller.google();

      expect(result).toEqual({ success: true });
    });
  });

  describe('googleRedirect', () => {
    it('should be defined', () => {
      expect(controller.googleRedirect).toBeDefined();
    });

    it('should call userService.findOrCreateOauth with user information', async () => {
      await controller.googleRedirect(
        mockOauthUserDto.email,
        mockOauthUserDto.firstName,
        mockOauthUserDto.lastName,
        mockOauthUserDto.provider,
        mockResponse as any,
      );

      expect(usersService.findOrCreateOauth).toHaveBeenCalledWith({
        email: mockOauthUserResult.email,
        provider: mockOauthUserResult.provider,
        firstName: mockOauthUserResult.firstName,
        lastName: mockOauthUserResult.lastName,
      });
    });

    it('should call authService.login with user', async () => {
      await controller.googleRedirect(
        mockOauthUserDto.email,
        mockOauthUserDto.firstName,
        mockOauthUserDto.lastName,
        mockOauthUserDto.provider,
        mockResponse as any,
      );

      expect(authService.login).toHaveBeenCalledWith(
        mockOauthUserResult as UserEntity,
      );
    });

    it('should call authService.redirectUser with user', async () => {
      mockResponse.redirect = jest.fn();
      await controller.googleRedirect(
        mockOauthUserDto.email,
        mockOauthUserDto.firstName,
        mockOauthUserDto.lastName,
        mockOauthUserDto.provider,
        mockResponse as any,
      );

      expect(authService.redirectUser).toHaveBeenCalled();
    });

    it('should call authService.redirectUserWithError with error', async () => {
      mockResponse.redirect = jest.fn();
      mockUsersService.findOrCreateOauth.mockRejectedValueOnce(
        new InternalServerErrorException(),
      );

      await controller.googleRedirect(
        mockOauthUserDto.email,
        mockOauthUserDto.firstName,
        mockOauthUserDto.lastName,
        mockOauthUserDto.provider,
        mockResponse as any,
      );

      expect(authService.redirectUserWithError).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should be defined', () => {
      expect(controller.logout).toBeDefined();
    });

    it('should call authService.logout with id', async () => {
      const id = mockCreateUserResult.id as string;

      await controller.logout(id);

      expect(authService.logout).toHaveBeenCalledWith(id);
    });

    it('should return success', async () => {
      const id = mockCreateUserResult.id as string;

      const result = await controller.logout(id);

      expect(result).toEqual({ success: true });
    });
  });

  describe('refresh', () => {
    const userId = '1';
    const userRefreshToken = 'valid_refresh_token';

    it('should be defined', () => {
      expect(controller.refreshTokens).toBeDefined();
    });

    it('should call authService.checkIsLoggedIn with id and refreshToken', async () => {
      await controller.refreshTokens(
        userId,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.checkIsLoggedIn).toHaveBeenCalledWith(
        userId,
        userRefreshToken,
      );
    });

    it('should call authService.login with user', async () => {
      await controller.refreshTokens(
        userId,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.login).toHaveBeenCalledWith(mockFindOneResult);
    });

    it('should throw UnauthorizedException if checkIsLoggedIn fails', async () => {
      mockAuthService.checkIsLoggedIn.mockRejectedValueOnce(
        new UnauthorizedException(),
      );

      await expect(
        controller.refreshTokens(userId, userRefreshToken, mockResponse as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call auth service response', async () => {
      await controller.refreshTokens(
        userId,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.response).toHaveBeenCalledWith({
        user: mockCreateUserResult,
        tokens: mockTokenResult,
        response: mockResponse,
        status: HttpStatus.OK,
      });
    });

    it('should call auth service response', async () => {
      await controller.refreshTokens(
        userId,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.response).toHaveBeenCalledWith({
        user: mockCreateUserResult,
        tokens: mockTokenResult,
        response: mockResponse,
        status: HttpStatus.OK,
      });
    });
  });
});
