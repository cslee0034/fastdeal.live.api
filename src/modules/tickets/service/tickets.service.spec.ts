import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { FailedToFindTicketError } from '../error/failed-to-find-ticket';
import { FailedToCountTicketError } from '../error/failed-to-count-ticket';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';
import { Ticket } from '@prisma/client';
import { TicketNotAvailableError } from '../error/ticket-not-available';
import { TicketNotFoundError } from '../error/ticket-not-found';
import { FailedToReserveTicketError } from '../error/failed-to-reserve-ticket';
import { CreateStandingDto } from '../../reservations/dto/create-standing-dto';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: TicketsRepository;

  const mockUserId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockEventId = '9a7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5b';
  const mockTicketId = '087e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockReservationId = '4c2g1c4f-a709-4d80-b9fb-5d9bdd096eec';

  const mockFoundTicket = {
    id: 'mock-uuid',
    eventId: mockEventId,
    price: 10000,
    seatNumber: 1,
    checkInCode: 'mock-uuid',
    image: 'https://example.com/image.jpg',
    reservationId: 'mock-uuid',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Ticket;

  const mockFoundTickets = [mockFoundTicket];

  const mockStandingTicket = {
    id: 'mock-uuid',
    eventId: mockEventId,
    price: 10000,
    seatNumber: 1,
    checkInCode: 'mock-uuid',
    image: 'https://example.com/image.jpg',
    reservationId: null,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateSeatingDto: CreateSeatingDto = {
    eventId: mockEventId,
    ticketId: mockTicketId,
  };

  const mockCreateStandingDto: CreateStandingDto = {
    eventId: mockEventId,
  };

  const mockReservation = {
    id: mockReservationId,
    eventId: mockEventId,
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicketsRepository = {
    findTicketsByEventId: jest
      .fn()
      .mockImplementation(async (eventId: string) => {
        if (eventId === 'not-exists') {
          return Promise.resolve([]);
        }

        return Promise.resolve(mockFoundTickets);
      }),

    countTicketsByEventId: jest
      .fn()
      .mockImplementation(async (eventId: string) => {
        if (eventId === 'not-exists') {
          return Promise.resolve(0);
        }

        return Promise.resolve(mockFoundTickets.length);
      }),

    findTicketByTicketIdTX: jest.fn(),
    reserveSeatingTicketTX: jest.fn(),
    findStandingTicketTX: jest.fn(),
    reserveStandingTicketTX: jest.fn(),
  };

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

  describe('findTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 목록을 반환한다', async () => {
      const result = await service.findTicketsByEventId(mockEventId);

      expect(repository.findTicketsByEventId).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(mockFoundTickets.map((t) => new TicketEntity(t)));
    });

    it('이벤트 ID에 해당하는 티켓이 없을 경우 빈 배열을 반환한다', async () => {
      const result = await service.findTicketsByEventId('not-exists');

      expect(repository.findTicketsByEventId).toHaveBeenCalledWith(
        'not-exists',
      );
      expect(result).toEqual([]);
    });

    it('티켓을 찾는 도중 에러가 발생하면 FailedToFindTicketError를 반환한다', async () => {
      mockTicketsRepository.findTicketsByEventId.mockRejectedValue(new Error());

      await expect(service.findTicketsByEventId(mockEventId)).rejects.toThrow(
        FailedToFindTicketError,
      );
    });
    it('티켓을 찾는 도중 에러가 발생하면 FailedToFindTicketError를 반환한다', async () => {
      mockTicketsRepository.findTicketsByEventId.mockRejectedValue(new Error());

      await expect(service.findTicketsByEventId(mockEventId)).rejects.toThrow(
        FailedToFindTicketError,
      );
    });
  });

  describe('countTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 수를 반환한다', async () => {
      const result = await service.countTicketsByEventId(mockEventId);

      expect(repository.countTicketsByEventId).toHaveBeenCalledWith(
        mockEventId,
      );
      expect(result).toEqual(mockFoundTickets.length);
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

  describe('findTicketByTicketIdTX', () => {
    it('티켓이 존재하고 사용 가능하면 성공 응답을 반환한다', async () => {
      mockTicketsRepository.findTicketByTicketIdTX.mockResolvedValue(
        mockFoundTicket,
      );

      const result = await service.findTicketByTicketIdTX(
        {} as any,
        mockCreateSeatingDto,
      );

      expect(repository.findTicketByTicketIdTX).toHaveBeenCalledWith(
        {},
        mockCreateSeatingDto,
      );
      expect(result).toEqual({ success: true });
    });

    it('티켓이 존재하지 않으면 실패 응답을 반환한다', async () => {
      mockTicketsRepository.findTicketByTicketIdTX.mockResolvedValue(null);

      const result = await service.findTicketByTicketIdTX(
        {} as any,
        mockCreateSeatingDto,
      );

      expect(repository.findTicketByTicketIdTX).toHaveBeenCalledWith(
        {},
        mockCreateSeatingDto,
      );
      expect(result).toEqual({ success: false, message: 'ticket not found' });
    });

    it('티켓이 이미 예약되었을 경우 실패 응답을 반환한다', async () => {
      mockTicketsRepository.findTicketByTicketIdTX.mockResolvedValue({
        ...mockFoundTicket,
        isAvailable: false,
      });

      const result = await service.findTicketByTicketIdTX(
        {} as any,
        mockCreateSeatingDto,
      );

      expect(repository.findTicketByTicketIdTX).toHaveBeenCalledWith(
        {},
        mockCreateSeatingDto,
      );
      expect(result).toEqual({
        success: false,
        message: 'ticket not available',
      });
    });

    it('티켓을 찾는 도중 에러가 발생하면 FailedToFindTicketError를 반환한다', async () => {
      mockTicketsRepository.findTicketByTicketIdTX.mockRejectedValue(
        new Error(),
      );

      await expect(
        service.findTicketByTicketIdTX({} as any, mockCreateSeatingDto),
      ).rejects.toThrow(FailedToFindTicketError);
    });
  });

  describe('reserveSeatingTicketTX', () => {
    it('트랜잭션 내에서 티켓을 예약한다', async () => {
      mockTicketsRepository.reserveSeatingTicketTX.mockResolvedValue(
        mockFoundTickets[0],
      );
      await service.reserveSeatingTicketTX({
        tx: {} as any,
        createSeatingDto: mockCreateSeatingDto,
        reservation: mockReservation,
      });

      expect(repository.reserveSeatingTicketTX).toHaveBeenCalledWith({
        tx: {},
        createSeatingDto: mockCreateSeatingDto,
        reservation: mockReservation,
      });
    });

    it('티켓을 예약하는 도중 에러가 발생하면 FailedToReserveTicketError를 반환한다', async () => {
      mockTicketsRepository.reserveSeatingTicketTX.mockRejectedValue(
        new Error(),
      );

      await expect(
        service.reserveSeatingTicketTX({
          tx: {} as any,
          createSeatingDto: mockCreateSeatingDto,
          reservation: mockReservation,
        }),
      ).rejects.toThrow(FailedToReserveTicketError);
    });
  });

  describe('reserveStandingTicketTX', () => {
    it('트랜잭션 내에서 스탠딩 티켓을 예약한다', async () => {
      mockTicketsRepository.findStandingTicketTX.mockResolvedValue(
        mockStandingTicket,
      );
      mockTicketsRepository.reserveStandingTicketTX.mockResolvedValue(
        mockStandingTicket,
      );

      const result = await service.reserveRandomStandingTicketTX({
        tx: {} as any,
        createStandingDto: mockCreateStandingDto,
        reservation: mockReservation,
      });

      expect(repository.findStandingTicketTX).toHaveBeenCalledWith(
        {},
        mockCreateStandingDto,
      );
      expect(repository.reserveStandingTicketTX).toHaveBeenCalledWith({
        tx: {},
        reservation: mockReservation,
        ticket: mockStandingTicket,
      });
      expect(result).toEqual(new TicketEntity(mockStandingTicket));
    });

    it('스탠딩 티켓을 찾는 도중 에러가 발생하면 FailedToFindTicketError를 반환한다', async () => {
      mockTicketsRepository.findStandingTicketTX.mockRejectedValue(new Error());

      await expect(
        service.reserveRandomStandingTicketTX({
          tx: {} as any,
          createStandingDto: mockCreateStandingDto,
          reservation: mockReservation,
        }),
      ).rejects.toThrow(FailedToFindTicketError);
    });

    it('스탠딩 티켓이 없을 경우 TicketNotFoundError를 반환한다', async () => {
      mockTicketsRepository.findStandingTicketTX.mockResolvedValue(null);

      await expect(
        service.reserveRandomStandingTicketTX({
          tx: {} as any,
          createStandingDto: mockCreateStandingDto,
          reservation: mockReservation,
        }),
      ).rejects.toThrow(TicketNotFoundError);
    });

    it('스탠딩 티켓이 이미 예약되었을 경우 TicketNotAvailableError를 반환한다', async () => {
      mockTicketsRepository.findStandingTicketTX.mockResolvedValue({
        ...mockStandingTicket,
        isAvailable: false,
      });

      await expect(
        service.reserveRandomStandingTicketTX({
          tx: {} as any,
          createStandingDto: mockCreateStandingDto,
          reservation: mockReservation,
        }),
      ).rejects.toThrow(TicketNotAvailableError);
    });

    it('스탠딩 티켓을 예약하는 도중 에러가 발생하면 FailedToReserveTicketError를 반환한다', async () => {
      mockTicketsRepository.findStandingTicketTX.mockResolvedValue(
        mockStandingTicket,
      );
      mockTicketsRepository.reserveStandingTicketTX.mockRejectedValue(
        new Error(),
      );

      await expect(
        service.reserveRandomStandingTicketTX({
          tx: {} as any,
          createStandingDto: mockCreateStandingDto,
          reservation: mockReservation,
        }),
      ).rejects.toThrow(FailedToReserveTicketError);
    });
  });
});
