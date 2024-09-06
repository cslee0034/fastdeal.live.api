import { Test, TestingModule } from '@nestjs/testing';
import { TokenModule } from './token.module';
import { TokenService } from '../service/token.service';

describe('TokenModule', () => {
  let tokenModule: TokenModule;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TokenModule],
    }).compile();

    tokenModule = module.get<TokenModule>(TokenModule);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(tokenModule).toBeDefined();
  });

  it('should have TokenService', () => {
    expect(tokenService).toBeDefined();
  });
});
