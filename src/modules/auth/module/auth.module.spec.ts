import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { UsersModule } from '../../users/module/users.module';
import { EncryptModule } from '../../encrypt/module/encrypt.module';
import { ConfigService } from '@nestjs/config';
import { AccessTokenStrategy } from '../strategies/access-token.strategy';

describe('AuthModule', () => {
  let authModule: AuthModule;
  let authController: AuthController;
  let authService: AuthService;

  let usersModule: UsersModule;
  let encryptModule: EncryptModule;
  let accessTokenStrategy: AccessTokenStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'jwt.access.secret') {
            return 'test_access_secret';
          }
        }),
      })
      .compile();

    authModule = module.get<AuthModule>(AuthModule);
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersModule = module.get<UsersModule>(UsersModule);
    encryptModule = module.get<EncryptModule>(EncryptModule);
    accessTokenStrategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);
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

  it('should have encryptModule', () => {
    expect(accessTokenStrategy).toBeDefined();
  });
});
