import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from '../repository/reservations.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsService } from '../../tickets/service/tickets.service';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { ReservationEntity } from '../entities/reservation.entity';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: ReservationsRepository;
  let prisma: PrismaService;

  const mockTicketsService = {
    findTicketWithLockTx: jest.fn(),
    reserveSeatingTx: jest.fn(),
  };
  const mockReservationsRepository = {
    createSeatingTx: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation(async (tx: any) => {
      return tx(prisma);
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

  const mockReservation = new ReservationEntity({
    id: mockReservationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
        {
          provide: ReservationsRepository,
          useValue: mockReservationsRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<ReservationsRepository>(ReservationsRepository);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSeating', () => {
    it('예약 내역을 반환해야 한다', async () => {
      mockTicketsService.findTicketWithLockTx.mockResolvedValue(mockTicketId);
      mockReservationsRepository.createSeatingTx.mockResolvedValue(
        mockReservation,
      );

      const result = await service.createSeating(
        mockUserId,
        mockCreateSeatingDto,
      );

      expect(mockTicketsService.findTicketWithLockTx).toHaveBeenCalledWith(
        prisma,
        mockCreateSeatingDto,
      );
      expect(mockReservationsRepository.createSeatingTx).toHaveBeenCalledWith(
        prisma,
        mockCreateSeatingDto,
        mockUserId,
      );
      expect(result).toEqual(mockReservation);
    });
  });
});
