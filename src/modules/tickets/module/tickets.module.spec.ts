import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsModule } from './tickets.module';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketsController } from '../controller/tickets.controller';
import { TicketsService } from '../service/tickets.service';
import { RedisModule } from '../../../infrastructure/cache/module/redis.module';

jest.mock('../../../config/cache/cache', () => ({
  getCacheConfig: jest.fn(() => ({
    isGlobal: false,
    host: 'localhost',
    port: 6379,
    password: 'password',
    ttl: 1000,
  })),
}));

describe('TicketsModule', () => {
  let ticketsModule: TicketsModule;
  let ticketsController: TicketsController;
  let ticketsService: TicketsService;
  let ticketsRepository: TicketsRepository;
  let prismaService: PrismaService;
  let redisModule: RedisModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TicketsModule],
    }).compile();

    ticketsModule = module.get<TicketsModule>(TicketsModule);
    ticketsController = module.get<TicketsController>(TicketsController);
    ticketsService = module.get<TicketsService>(TicketsService);
    ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    redisModule = module.get<RedisModule>(RedisModule);
  });

  it('should be defined', () => {
    expect(ticketsModule).toBeDefined();
  });

  it('should have TicketsController', () => {
    expect(ticketsController).toBeDefined();
  });

  it('should have TicketsService', () => {
    expect(ticketsService).toBeDefined;
  });

  it('should have TicketsRepository', () => {
    expect(ticketsRepository).toBeDefined();
  });

  it('should have PrismaService', () => {
    expect(prismaService).toBeDefined();
  });

  it('should have RedisModule', () => {
    expect(redisModule).toBeDefined();
  });
});
