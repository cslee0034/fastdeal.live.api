import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { ReservationsRepository } from './reservations.repository';
describe('ReservationsRepository', () => {
  let repository: ReservationsRepository;

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ReservationsRepository>(ReservationsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
