import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';
import { PrismaService } from '../service/prisma.service';

describe('PrismaModule', () => {
  let prismaModule: PrismaModule;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prismaModule = module.get<PrismaModule>(PrismaModule);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should import PrismaModule', async () => {
    expect(prismaModule).toBeDefined();
  });

  it('should have PrismaService', async () => {
    expect(prismaService).toBeDefined();
  });
});
