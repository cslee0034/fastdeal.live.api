import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsRepository } from './tickets.repository';
describe('TicketsRepository', () => {
  let repository: TicketsRepository;

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TicketsRepository>(TicketsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
