import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from '../repository/reservations.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsService } from '../../tickets/service/tickets.service';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { ReservationEntity } from '../entities/reservation.entity';
import { LockService } from '../../../infrastructure/lock/service/lock.service';
import { CreateStandingDto } from '../dto/create-standing-dto';
import { FailedToCreateReservation } from '../error/failed-to-create-reservation';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { QueueService } from '../../../infrastructure/queue/service/queue.service';

jest.mock('murlock', () => ({
  MurLock: jest.fn(() => () => jest.fn()),
}));

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: ReservationsRepository;
  let prisma: PrismaService;

  const mockTicketsService = {
    findTicketByTicketId: jest.fn(),
    findTicketByTicketIdTX: jest.fn(),
    reserveSeatingTicketTX: jest.fn(),
    reserveRandomStandingTicketTX: jest.fn(),
  };
  const mockReservationsRepository = {
    createSeatingReservationTX: jest.fn(),
    createStandingReservationTX: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation(async (tx: any) => {
      return tx(prisma);
    }),
  };

  const mockRedisService = {
    deleteTicketSoldOut: jest.fn(),
  };

  const mockQueueService = {
    addReservationJob: jest.fn(),
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
  } as CreateStandingDto;

  const mockReservation = new ReservationEntity({
    id: mockReservationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockReservedTicket = {
    eventId: mockEventId,
    price: 10000,
    seatNumber: 1,
    checkInCode: 'mock-uuid',
    image: 'https://example.com/image.jpg',
    eventEntity: mockEventId,
  };

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
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
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
    it('큐에 예약 작업을 추가해야 한다', async () => {
      mockTicketsService.findTicketByTicketId.mockResolvedValue({
        success: true,
        ticket: mockReservation,
      });

      const result = await service.createSeating(
        mockUserId,
        mockCreateSeatingDto,
      );

      expect(mockTicketsService.findTicketByTicketId).toHaveBeenCalledWith(
        mockCreateSeatingDto.ticketId,
      );

      expect(mockQueueService.addReservationJob).toHaveBeenCalledWith({
        userId: mockUserId,
        createSeatingDto: mockCreateSeatingDto,
      });
      expect(result).toEqual({
        success: true,
        ticket: mockReservation,
      });
    });

    it('티켓 조회가 실패하면 작업을 추가하지 않고 실패해야 한다', async () => {
      mockTicketsService.findTicketByTicketId.mockResolvedValue({
        success: false,
        message: 'ticket not found',
      });

      const result = await service.createSeating(
        mockUserId,
        mockCreateSeatingDto,
      );

      expect(mockTicketsService.findTicketByTicketId).toHaveBeenCalledWith(
        mockCreateSeatingDto.ticketId,
      );

      expect(mockQueueService.addReservationJob).not.toHaveBeenCalled();

      expect(result).toEqual({ success: false, message: 'ticket not found' });
    });
  });

  describe('createStanding', () => {
    it('예약 내역을 반환해야 한다', async () => {
      mockReservationsRepository.createStandingReservationTX.mockResolvedValue(
        mockReservation,
      );
      mockTicketsService.reserveRandomStandingTicketTX.mockResolvedValue({
        success: true,
      });

      const result = await service.createStanding(
        mockUserId,
        mockCreateStandingDto,
      );

      expect(
        mockReservationsRepository.createStandingReservationTX,
      ).toHaveBeenCalledWith({
        tx: prisma,
        createStandingDto: mockCreateStandingDto,
        userId: mockUserId,
      });
      expect(
        mockTicketsService.reserveRandomStandingTicketTX,
      ).toHaveBeenCalledWith({
        tx: prisma,
        createStandingDto: mockCreateStandingDto,
        reservation: mockReservation,
      });
      expect(result).toEqual(expect.any(ReservationEntity));
    });

    it('createStandingReservationTX에서 에러가 발생하면 예약에 실패해야 한다', async () => {
      mockReservationsRepository.createStandingReservationTX.mockRejectedValue(
        new Error(),
      );

      await expect(
        service.createStanding(mockUserId, mockCreateStandingDto),
      ).rejects.toThrow(FailedToCreateReservation);
    });
  });

  describe('createSeatingReservationTX', () => {
    it('좌석이 있는 예약에 성공해야 한다', async () => {
      mockReservationsRepository.createSeatingReservationTX.mockResolvedValue(
        mockReservation,
      );

      const result = await service.createSeatingReservationTX({
        tx: prisma,
        createSeatingDto: mockCreateSeatingDto,
        userId: mockUserId,
      });

      expect(result).toEqual(mockReservation);

      expect(
        mockReservationsRepository.createSeatingReservationTX,
      ).toHaveBeenCalledWith({
        tx: mockPrismaService,
        createSeatingDto: mockCreateSeatingDto,
        userId: mockUserId,
      });
    });

    it('repository에서 예외가 발생하면 에러를 반환한다', async () => {
      mockReservationsRepository.createSeatingReservationTX.mockRejectedValue(
        new Error('database error'),
      );

      await expect(
        service.createSeatingReservationTX({
          tx: prisma,
          createSeatingDto: mockCreateSeatingDto,
          userId: mockUserId,
        }),
      ).rejects.toThrow(FailedToCreateReservation);

      expect(
        mockReservationsRepository.createSeatingReservationTX,
      ).toHaveBeenCalledWith({
        tx: mockPrismaService,
        createSeatingDto: mockCreateSeatingDto,
        userId: mockUserId,
      });
    });
  });
});
