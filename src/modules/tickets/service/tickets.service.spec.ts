import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { FailedToFindTicketError } from '../error/failed-to-find-ticket';
import { FailedToCountTicketError } from '../error/failed-to-count-ticket';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';
import { Ticket } from '@prisma/client';
import { TicketNotAvailableError } from '../error/ticket-not-available';
import { TicketNotFoundError } from '../error/ticket-not-found';
import { FailedToReserveTicketError } from '../error/failed-to-reserve-ticket';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: TicketsRepository;

  const mockTicketsRepository = {
    findTicketsByEventId: jest
      .fn()
      .mockImplementation(async (eventId: string) => {
        if (eventId === 'not-exists') {
          return Promise.resolve([]);
        }

        return Promise.resolve(mockTickets);
      }),

    countTicketsByEventId: jest
      .fn()
      .mockImplementation(async (eventId: string) => {
        if (eventId === 'not-exists') {
          return Promise.resolve(0);
        }

        return Promise.resolve(mockTickets.length);
      }),

    findTicketWithLockTx: jest.fn(),

    reserveSeatingTx: jest.fn(),
  };

  const mockRedisService = {};

  const mockUserId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockEventId = '9a7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5b';
  const mockTicketId = '087e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockReservationId = '4c2g1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockTickets = [
    {
      id: mockTicketId,
      eventId: mockEventId,
      reservationId: mockReservationId,
      price: 100000,
      seatNumber: 1,
      checkInCode: '',
      image: 'https://example.com/image.png',
      isAvailable: true,
    } as Ticket,
  ];

  const mockCreateSeatingDto = {
    eventId: mockEventId,
    ticketId: mockTicketId,
  } as CreateSeatingDto;

  const mockReservation = {
    id: mockReservationId,
    eventId: mockEventId,
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TicketsRepository,
          useValue: mockTicketsRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
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

  describe('findTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 목록을 반환한다', async () => {
      const result = await service.findTicketsByEventId(mockEventId);

      expect(repository.findTicketsByEventId).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(
        mockTickets.map((ticket) => new TicketEntity(ticket)),
      );
    });

    it('이벤트 ID에 해당하는 티켓이 없을 경우 빈 배열을 반환한다', async () => {
      const result = await service.findTicketsByEventId('not-exists');

      expect(repository.findTicketsByEventId).toHaveBeenCalledWith(
        'not-exists',
      );
      expect(result).toEqual([]);
    });
  });

  it('티켓을 찾는 도중 에러가 발생하면 FailedToFindTicketError를 반환한다', async () => {
    mockTicketsRepository.findTicketsByEventId.mockRejectedValue(new Error());

    await expect(service.findTicketsByEventId(mockEventId)).rejects.toThrow(
      FailedToFindTicketError,
    );
  });

  describe('countTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 수를 반환한다', async () => {
      const result = await service.countTicketsByEventId(mockEventId);

      expect(repository.countTicketsByEventId).toHaveBeenCalledWith(
        mockEventId,
      );
      expect(result).toEqual(mockTickets.length);
    });

    it('이벤트 ID에 해당하는 티켓이 없을 경우 0을 반환한다', async () => {
      const result = await service.countTicketsByEventId('not-exists');

      expect(repository.countTicketsByEventId).toHaveBeenCalledWith(
        'not-exists',
      );
      expect(result).toEqual(0);
    });

    it('티켓을 찾는 도중 에러가 발생하면 FailedToCountTicketError 반환한다', async () => {
      mockTicketsRepository.countTicketsByEventId.mockRejectedValue(
        new Error(),
      );

      await expect(service.countTicketsByEventId(mockEventId)).rejects.toThrow(
        FailedToCountTicketError,
      );
    });
  });

  describe('findTicketWithLockTx', () => {
    it('트랜잭션 내에서 티켓을 조회하고 잠금을 건다', async () => {
      mockTicketsRepository.findTicketWithLockTx.mockResolvedValue(mockTickets);

      await service.findTicketWithLockTx({} as any, mockCreateSeatingDto);

      expect(repository.findTicketWithLockTx).toHaveBeenCalledWith(
        {},
        mockCreateSeatingDto,
      );
    });

    it('티켓을 찾는 도중 에러가 발생하면 FailedToFindTicketError를 반환한다', async () => {
      mockTicketsRepository.findTicketWithLockTx.mockRejectedValue(new Error());

      await expect(
        service.findTicketWithLockTx({} as any, mockCreateSeatingDto),
      ).rejects.toThrow(FailedToFindTicketError);
    });

    it('티켓이 없을 경우 TicketNotFoundError를 반환한다', async () => {
      mockTicketsRepository.findTicketWithLockTx.mockResolvedValue([]);

      await expect(
        service.findTicketWithLockTx({} as any, mockCreateSeatingDto),
      ).rejects.toThrow(TicketNotFoundError);
    });

    it('티켓이 이미 예약되었을 경우 TicketNotAvailableError를 반환한다', async () => {
      const mockTickets = [
        {
          id: mockTicketId,
          eventId: mockEventId,
          reservationId: mockReservationId,
          price: 100000,
          seatNumber: 1,
          checkInCode: '',
          image: 'https://example.com/image.png',
          isAvailable: false,
        } as Ticket,
      ];

      mockTicketsRepository.findTicketWithLockTx.mockResolvedValue(mockTickets);

      await expect(
        service.findTicketWithLockTx({} as any, mockCreateSeatingDto),
      ).rejects.toThrow(TicketNotAvailableError);
    });
  });

  describe('reserveSeatingTx', () => {
    it('트랜잭션 내에서 티켓을 예약한다', async () => {
      mockTicketsRepository.reserveSeatingTx.mockResolvedValue(mockTickets);

      await service.reserveSeatingTx(
        {} as any,
        mockCreateSeatingDto,
        mockReservation,
      );
    });

    it('티켓을 예약하는 도중 에러가 발생하면 FailedToReserveTicketError를 반환한다', async () => {
      mockTicketsRepository.reserveSeatingTx.mockRejectedValue(new Error());

      await expect(
        service.reserveSeatingTx(
          {} as any,
          mockCreateSeatingDto,
          mockReservation,
        ),
      ).rejects.toThrow(FailedToReserveTicketError);
    });
  });
});
