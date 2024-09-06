import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EncryptModule } from './encrypt.module';

describe('JWTModule', () => {
  let encryptModule: EncryptModule;
  let configModule: ConfigModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EncryptModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    encryptModule = module.get<EncryptModule>(EncryptModule);
    configModule = module.get<ConfigModule>(ConfigModule);
  });

  it('should import encryptModule', async () => {
    expect(encryptModule).toBeDefined();
  });

  it('should import config module', () => {
    expect(configModule).toBeDefined();
  });
});
