import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from '../service/reservations.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { ReservationEntity } from '../entities/reservation.entity';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    createSeating: jest.fn().mockImplementation((userId, createSeatingDto) => {
      return mockReservation;
    }),

    createStanding: jest.fn().mockImplementation((userId, createStanding) => {
      return mockReservation;
    }),
  };

  const mockUserId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockEventId = '45s2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockTicketId = '087e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockReservationId = '4c2g1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockCreateSeatingDto = {
    eventId: mockEventId,
    ticketId: mockTicketId,
  } as CreateSeatingDto;
  const mockCreateStandingDto = {
    eventId: mockEventId,
  } as CreateSeatingDto;

  const mockReservation = new ReservationEntity({
    id: mockReservationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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
    service = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSeating', () => {
    it('예약 내역을 반환해야 한다', async () => {
      const result = await controller.createSeating(
        mockUserId,
        mockCreateSeatingDto,
      );

      expect(mockReservationsService.createSeating).toHaveBeenCalledWith(
        mockUserId,
        mockCreateSeatingDto,
      );
      expect(result).toEqual(mockReservation);
    });
  });

  describe('createStanding', () => {
    it('예약 내역을 반환해야 한다', async () => {
      const result = await controller.createStanding(
        mockUserId,
        mockCreateStandingDto,
      );

      expect(mockReservationsService.createStanding).toHaveBeenCalledWith(
        mockUserId,
        mockCreateStandingDto,
      );
      expect(result).toEqual(mockReservation);
    });
  });
});
