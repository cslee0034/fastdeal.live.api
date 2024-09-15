import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { ReservationConsumer } from './reservation.processor';
import { TicketsService } from '../../tickets/service/tickets.service';
import { ReservationsService } from '../service/reservations.service';
import { Job } from 'bullmq';
import { ReservationEntity } from '../entities/reservation.entity';

describe('ReservationConsumer', () => {
  let reservationConsumer: ReservationConsumer;
  let prismaService: PrismaService;
  let ticketsService: TicketsService;
  let reservationService: ReservationsService;

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  const mockTicketsService = {
    reserveSeatingTicketTX: jest.fn(),
  };

  const mockReservationService = {
    createSeatingReservationTX: jest.fn(),
  };

  const mockJob = {
    data: {
      userId: '123',
      createSeatingDto: { ticketId: 'abc', seatNumber: '1' },
    },
  } as Job<any, any, string>;

  const mockReservation = new ReservationEntity({
    id: '12are-fc4f-a709-4d80-b9fb-5d9bdd096eec',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationConsumer,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TicketsService, useValue: mockTicketsService },
        { provide: ReservationsService, useValue: mockReservationService },
      ],
    }).compile();

    reservationConsumer = module.get<ReservationConsumer>(ReservationConsumer);
    prismaService = module.get<PrismaService>(PrismaService);
    ticketsService = module.get<TicketsService>(TicketsService);
    reservationService = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(reservationConsumer).toBeDefined();
  });

  it('reservation jon을 처리해야 한다', async () => {
    mockPrismaService.$transaction.mockImplementation(async (callback) => {
      return await callback(mockPrismaService);
    });

    mockReservationService.createSeatingReservationTX.mockResolvedValue(
      mockReservation,
    );

    await reservationConsumer.process(mockJob);

    expect(
      mockReservationService.createSeatingReservationTX,
    ).toHaveBeenCalledWith({
      tx: mockPrismaService,
      createSeatingDto: mockJob.data.createSeatingDto,
      userId: mockJob.data.userId,
    });

    expect(mockTicketsService.reserveSeatingTicketTX).toHaveBeenCalledWith({
      tx: mockPrismaService,
      createSeatingDto: mockJob.data.createSeatingDto,
      reservation: mockReservation,
    });
  });

  it('트랜젝션이 실패할 경우 에러를 반환한다', async () => {
    mockPrismaService.$transaction.mockRejectedValue(
      new Error('Transaction Failed'),
    );

    await expect(reservationConsumer.process(mockJob)).rejects.toThrow(
      'Transaction Failed',
    );
  });
});
