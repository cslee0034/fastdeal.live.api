import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

describe('PrismaClientExceptionFilter', () => {
  let prismaClientExceptionFilter: PrismaClientExceptionFilter;
  let loggerMock: Logger;

  beforeEach(async () => {
    loggerMock = {
      error: jest.fn(),
    } as unknown as Logger;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaClientExceptionFilter,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: loggerMock,
        },
      ],
    }).compile();

    prismaClientExceptionFilter = module.get<PrismaClientExceptionFilter>(
      PrismaClientExceptionFilter,
    );
  });

  it('should be defined', () => {
    expect(prismaClientExceptionFilter).toBeDefined();
  });
});
