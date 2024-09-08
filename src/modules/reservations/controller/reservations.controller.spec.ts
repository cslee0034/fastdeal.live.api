import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from '../service/reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
