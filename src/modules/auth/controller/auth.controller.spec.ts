import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';
import {
  ForbiddenException,
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
      if (email === 'test@email.com') {
        return Promise.resolve(mockFindOneByEmailResult);
      } else {
        return Promise.reject(new NotFoundException('User not found'));
      }
    }),

    findOneById: jest
      .fn()
      .mockImplementation((id: string): Promise<UserEntity> => {
        if (id === '1') {
          return Promise.resolve(mockFindOneByEmailResult);
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
            return Promise.resolve(mockCreateUserResult);
          } else {
            return Promise.reject(new InternalServerErrorException());
          }
        },
      ),

    convertUserResponse: jest.fn().mockImplementation((user: UserEntity) => {
      return {
        id: user.id,
        email: user.email,
        provider: user.provider,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }),
  };

  const mockAuthService = {
    login: jest
      .fn()
      .mockImplementation(
        (id: string, refreshToken: string): Promise<boolean> => {
          if (id && refreshToken) {
            return Promise.resolve(true);
          } else {
            return Promise.reject(
              new InternalServerErrorException('Failed to set refresh token'),
            );
          }
        },
      ),

    logout: jest.fn().mockImplementation((id: string): Promise<boolean> => {
      if (id) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(
          new InternalServerErrorException('Failed to delete refresh token'),
        );
      }
    }),

    generateTokens: jest
      .fn()
      .mockImplementation((id: number, email: string): Promise<Tokens> => {
        if (id && email) {
          return Promise.resolve(mockTokenResult);
        } else {
          return Promise.reject(
            new InternalServerErrorException('Failed to create tokens'),
          );
        }
      }),

    setTokens: jest
      .fn()
      .mockImplementation((res: Response, tokens: Tokens): Promise<void> => {
        if (res && tokens) {
          return Promise.resolve();
        } else {
          return Promise.reject(
            new InternalServerErrorException('Failed to set token'),
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

    getRedirectUrl: jest
      .fn()
      .mockImplementation((user: UserEntity, error: Error) => {
        if (error) {
          return 'client.url/api/auth/google?error';
        }

        return 'client.url/api/auth/google';
      }),
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
      return key;
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

  const mockCreateUserResult: UserEntity = new UserEntity({
    id: '1',
    email: 'test@email.com',
    provider: 'local',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'hashed_test_password',
  });

  const mockFindOneByEmailResult: UserEntity = new UserEntity({
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

    it('should call generateToken with created user information', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.generateTokens).toHaveBeenCalledWith(
        mockCreateUserResult.id as string,
        mockCreateUserResult.email as string,
      );
    });

    it("should call login with user's id and refreshToken", async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(
        mockCreateUserResult.id as string,
        mockTokenResult.refreshToken as string,
      );
    });

    it('should call setTokens with response and tokens', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.setTokens).toHaveBeenCalledWith(
        mockResponse as any,
        mockTokenResult,
      );
    });

    it('should call user convert user response', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(usersService.convertUserResponse).toHaveBeenCalledWith(
        mockCreateUserResult,
      );
    });

    it('should return converted user', async () => {
      const mockJson = jest.fn();
      mockResponse.json = mockJson;

      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(mockJson).toHaveBeenCalledWith({
        id: mockCreateUserResult.id,
        email: mockCreateUserResult.email,
        provider: mockCreateUserResult.provider,
        firstName: mockCreateUserResult.firstName,
        lastName: mockCreateUserResult.lastName,
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
        mockFindOneByEmailResult.password as string,
      );
    });

    it("should call generateToken with found user's information", async () => {
      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(authService.generateTokens).toHaveBeenCalledWith(
        mockFindOneByEmailResult.id as string,
        mockFindOneByEmailResult.email as string,
      );
    });

    it("should call login with user's id and refreshToken", async () => {
      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(
        mockFindOneByEmailResult.id as string,
        mockTokenResult.refreshToken as string,
      );
    });

    it('should call setTokens with response and tokens', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.setTokens).toHaveBeenCalledWith(
        mockResponse as any,
        mockTokenResult,
      );
    });

    it('should call user convert user response', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(usersService.convertUserResponse).toHaveBeenCalledWith(
        mockCreateUserResult,
      );
    });

    it('should return converted user', async () => {
      const mockJson = jest.fn();
      mockResponse.json = mockJson;

      await controller.signin(mockLoginDto as SignInDto, mockResponse as any);

      expect(mockJson).toHaveBeenCalledWith({
        id: mockFindOneByEmailResult.id,
        email: mockFindOneByEmailResult.email,
        provider: mockFindOneByEmailResult.provider,
        firstName: mockFindOneByEmailResult.firstName,
        lastName: mockFindOneByEmailResult.lastName,
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

    it('should call findOrCreateOauth', async () => {
      await controller.googleRedirect(
        mockSignUpDto.email as string,
        mockSignUpDto.firstName as string,
        mockSignUpDto.lastName as string,
        'google',
        mockResponse as any,
      );

      expect(usersService.findOrCreateOauth).toHaveBeenCalledWith({
        email: mockSignUpDto.email as string,
        provider: 'google',
        firstName: mockSignUpDto.firstName as string,
        lastName: mockSignUpDto.lastName as string,
      });
    });

    it('should call generateToken with find or created user information', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.generateTokens).toHaveBeenCalledWith(
        mockCreateUserResult.id as string,
        mockCreateUserResult.email as string,
      );
    });

    it("should call login with user's id and refreshToken", async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(
        mockCreateUserResult.id as string,
        mockTokenResult.refreshToken as string,
      );
    });

    it('should call setTokens with response and tokens', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(authService.setTokens).toHaveBeenCalledWith(
        mockResponse as any,
        mockTokenResult,
      );
    });

    it('should redirect to client url', async () => {
      const mockRedirect = jest.fn();
      mockResponse.redirect = mockRedirect;

      await controller.googleRedirect(
        mockSignUpDto.email as string,
        mockSignUpDto.firstName as string,
        mockSignUpDto.lastName as string,
        'google',
        mockResponse as any,
      );

      expect(mockRedirect).toHaveBeenCalledWith('client.url/api/auth/google');
    });

    it('should redirect to error client url if provider is not oauth provider', async () => {
      const mockRedirect = jest.fn();
      mockResponse.redirect = mockRedirect;

      await controller.googleRedirect(
        mockSignUpDto.email as string,
        mockSignUpDto.firstName as string,
        mockSignUpDto.lastName as string,
        'local',
        mockResponse as any,
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        'client.url/api/auth/google?error',
      );
    });
  });

  describe('logout', () => {
    it('should be defined', () => {
      expect(controller.logout).toBeDefined();
    });

    it('should call authService.logout with id and refreshToken', async () => {
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
    const userEmail = 'test@email.com';
    const userRefreshToken = 'valid_refresh_token';

    it('should be defined', () => {
      expect(controller.refreshTokens).toBeDefined();
    });

    it('should call authService.checkIsLoggedIn with id and refreshToken', async () => {
      await controller.refreshTokens(
        userId,
        userEmail,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.checkIsLoggedIn).toHaveBeenCalledWith(
        userId,
        userRefreshToken,
      );
    });

    it("should call authService.generateTokens with user's id and email", async () => {
      await controller.refreshTokens(
        userId,
        userEmail,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.generateTokens).toHaveBeenCalledWith(
        userId,
        userEmail,
      );
    });

    it("should call authService.login with user's id and new refreshToken", async () => {
      await controller.refreshTokens(
        userId,
        userEmail,
        userRefreshToken,
        mockResponse as any,
      );

      expect(authService.login).toHaveBeenCalledWith(
        userId,
        mockTokenResult.refreshToken,
      );
    });

    it('should throw UnauthorizedException if checkIsLoggedIn fails', async () => {
      mockAuthService.checkIsLoggedIn.mockRejectedValueOnce(
        new UnauthorizedException(),
      );

      await expect(
        controller.refreshTokens(
          userId,
          userEmail,
          userRefreshToken,
          mockResponse as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call user convert user response', async () => {
      await controller.signup(mockSignUpDto as SignUpDto, mockResponse as any);

      expect(usersService.convertUserResponse).toHaveBeenCalledWith(
        mockCreateUserResult,
      );
    });

    it('should return converted user', async () => {
      const mockJson = jest.fn();
      mockResponse.json = mockJson;

      await controller.refreshTokens(
        userId,
        userEmail,
        userRefreshToken,
        mockResponse as any,
      );

      expect(mockJson).toHaveBeenCalledWith({
        id: mockFindOneByEmailResult.id,
        email: mockFindOneByEmailResult.email,
        provider: mockFindOneByEmailResult.provider,
        firstName: mockFindOneByEmailResult.firstName,
        lastName: mockFindOneByEmailResult.lastName,
      });
    });
  });
});
