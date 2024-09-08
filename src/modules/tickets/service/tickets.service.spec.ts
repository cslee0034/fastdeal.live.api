import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from '../repository/tickets.repository';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: TicketsRepository;

  const mockTicketsRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TicketsRepository,
          useValue: mockTicketsRepository,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    repository = module.get<TicketsRepository>(TicketsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
