import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
describe('AuthModule', () => {
  let authModule: AuthModule;
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    authModule = module.get<AuthModule>(AuthModule);
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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
});
