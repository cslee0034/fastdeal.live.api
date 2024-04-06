import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { UsersModule } from '../../users/module/users.module';
import { EncryptModule } from '../../encrypt/module/encrypt.module';
import { ConfigService } from '@nestjs/config';
import { AccessTokenStrategy } from '../strategies/access-token.strategy';
import { RefreshTokenStrategy } from '../strategies/refresh-token-strategy';
import { RedisModule } from '../../cache/module/redis.module';
import { GoogleStrategy } from '../strategies/google-strategy';

jest.mock('../../../config/cache/cache', () => ({
  getCacheConfig: jest.fn(() => ({
    isGlobal: false,
    host: 'localhost',
    port: 6379,
    password: 'password',
    ttl: 1000,
  })),
}));

describe('AuthModule', () => {
  let authModule: AuthModule;
  let authController: AuthController;
  let authService: AuthService;

  let usersModule: UsersModule;
  let encryptModule: EncryptModule;
  let redisModule: RedisModule;

  let accessTokenStrategy: AccessTokenStrategy;
  let refreshTokenStrategy: RefreshTokenStrategy;
  let googleStrategy: GoogleStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          return key;
        }),
      })
      .compile();

    authModule = module.get<AuthModule>(AuthModule);
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersModule = module.get<UsersModule>(UsersModule);
    encryptModule = module.get<EncryptModule>(EncryptModule);
    accessTokenStrategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);
    redisModule = module.get<RedisModule>(RedisModule);
    refreshTokenStrategy =
      module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
  });
  it('should be defined', () => {
    expect(authModule).toBeDefined();
  });

  it('should have authController', () => {
    expect(authController).toBeDefined();
  });

  it('should have authService', () => {
    expect(authService).toBeDefined();
  });

  it('should have usersModule', () => {
    expect(usersModule).toBeDefined();
  });

  it('should have encryptModule', () => {
    expect(encryptModule).toBeDefined();
  });

  it('should have redisModule', () => {
    expect(redisModule).toBeDefined();
  });

  it('should have accessTokenStrategy', () => {
    expect(accessTokenStrategy).toBeDefined();
  });

  it('should have refreshTokenStrategy', () => {
    expect(refreshTokenStrategy).toBeDefined();
  });

  it('should have googleStrategy', () => {
    expect(googleStrategy).toBeDefined();
  });
});
