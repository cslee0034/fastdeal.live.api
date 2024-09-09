import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { ReservationsRepository } from './reservations.repository';
import { CreateSeatingDto } from '../dto/create-seating.dto';
describe('ReservationsRepository', () => {
  let repository: ReservationsRepository;

  const mockPrismaService = {
    reservation: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
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

  const mockReservation = {
    id: mockReservationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  describe('createSeatingTx', () => {
    it('예약 내역을 생성하고 반환해야 한다', async () => {
      const mockTx = {
        reservation: {
          create: jest.fn().mockResolvedValue(mockReservation),
        },
      };

      const result = await repository.createSeatingTx(
        mockTx as any,
        mockCreateSeatingDto,
        mockUserId,
      );

      expect(mockTx.reservation.create).toHaveBeenCalledWith({
        data: {
          event: {
            connect: {
              id: mockEventId,
            },
          },
          user: {
            connect: {
              id: mockUserId,
            },
          },
        },
      });
      expect(result).toEqual(mockReservation);
    });
  });

  describe('createStandingTx', () => {
    it('예약 내역을 생성하고 반환해야 한다', async () => {
      const mockTx = {
        reservation: {
          create: jest.fn().mockResolvedValue(mockReservation),
        },
      };

      const result = await repository.createStandingTx(
        mockTx as any,
        mockCreateStandingDto,
        mockUserId,
      );

      expect(mockTx.reservation.create).toHaveBeenCalledWith({
        data: {
          event: {
            connect: {
              id: mockEventId,
            },
          },
          user: {
            connect: {
              id: mockUserId,
            },
          },
        },
      });
      expect(result).toEqual(mockReservation);
    });
  });
});
