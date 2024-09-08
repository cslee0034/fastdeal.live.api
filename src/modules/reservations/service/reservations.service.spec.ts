import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from '../repository/reservations.repository';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: ReservationsRepository;

  let mockReservationsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<ReservationsRepository>(ReservationsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
