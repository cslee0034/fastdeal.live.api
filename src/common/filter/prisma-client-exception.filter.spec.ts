import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

describe('PrismaClientExceptionFilter', () => {
  let prismaClientExceptionFilter: PrismaClientExceptionFilter;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaClientExceptionFilter,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            error: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
          },
        },
      ],
    }).compile();

    prismaClientExceptionFilter = module.get<PrismaClientExceptionFilter>(
      PrismaClientExceptionFilter,
    );
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(prismaClientExceptionFilter).toBeDefined();
  });
});
