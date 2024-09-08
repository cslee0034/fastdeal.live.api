import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsModule } from './tickets.module';
import { TicketsRepository } from '../repository/tickets.repository';

describe('TicketsModule', () => {
  let ticketsModule: TicketsModule;
  let ticketsRepository: TicketsRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TicketsModule],
    }).compile();

    ticketsModule = module.get<TicketsModule>(TicketsModule);
    ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(ticketsModule).toBeDefined();
  });
  it('should have TicketsRepository', () => {
    expect(ticketsRepository).toBeDefined();
  });

  it('should have PrismaService', () => {
    expect(prismaService).toBeDefined();
  });
});
