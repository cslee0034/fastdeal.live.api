import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsRepository } from './tickets.repository';
import { MappedTicket } from '../interface/mapped-ticket.interface';
import { CreateEventDto } from '../../events/dto/create-event-dto';
import { EventEntity } from '../../events/entities/event.entity';
import { EventType } from '@prisma/client';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';
describe('TicketsRepository', () => {
  let repository: TicketsRepository;

  const mockPrismaService = {
    ticket: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  const mockUserId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockPlaceId = '987e4567-e89b-12d3-a456-426614174000';
  const mockEventId = '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d';
  const mockCreateEventDto: CreateEventDto = {
    name: '테스트 이벤트',
    description: '이벤트 설명',
    date: new Date(),
    placeId: mockPlaceId,
    eventType: EventType.STANDING,
    price: 10000,
    quantity: 100,
    image: 'https://example.com/image.jpg',
  };

  const mockCreateStandingDto = {
    eventId: mockEventId,
  } as CreateSeatingDto;

  const mockEvent = {
    ...mockCreateEventDto,
    id: mockEventId,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as EventEntity;

  const mockMappedTickets: MappedTicket[] = [
    {
      eventId: mockEventId,
      price: 10000,
      seatNumber: 1,
      checkInCode: 'mock-uuid',
      image: 'https://example.com/image.jpg',
      eventEntity: mockEvent,
    },
    {
      eventId: mockEventId,
      price: 10000,
      seatNumber: 1,
      checkInCode: 'mock-uuid',
      image: 'https://example.com/image.jpg',
      eventEntity: mockEvent,
    },
  ];

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
  };

  const mockFoundTickets = mockMappedTickets.map((ticket) => {
    return {
      ...mockFoundTicket,
    };
  });

  const createdTickets = mockMappedTickets.map((ticket) => {
    return {
      id: 'mock-uuid',
      eventId: ticket.eventId,
      price: ticket.price,
      seatNumber: ticket.seatNumber,
      checkInCode: ticket.checkInCode,
      image: ticket.image,
      createAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const mockTicketId = '087e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockReservationId = '4c2g1c4f-a709-4d80-b9fb-5d9bdd096eec';
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
        TicketsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TicketsRepository>(TicketsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createTicketsTx', () => {
    it('트랜잭션 내에서 티켓을 생성해야 한다', async () => {
      const mockTx = {
        ticket: {
          createMany: jest.fn().mockResolvedValue(createdTickets),
        },
      };

      const result = await repository.createTicketsTx(
        mockTx as any,
        mockMappedTickets,
      );

      expect(mockTx.ticket.createMany).toHaveBeenCalledWith({
        data: mockMappedTickets,
      });

      expect(result).toEqual(createdTickets);
    });
  });

  describe('findTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 목록을 반환해야 한다', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue(mockFoundTickets);

      const result = await repository.findTicketsByEventId(mockEventId);

      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        where: {
          eventId: mockEventId,
        },
      });
      expect(result).toEqual(mockFoundTickets);
    });
  });

  describe('countTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 수를 반환해야 한다', async () => {
      mockPrismaService.ticket.count.mockResolvedValue(mockFoundTickets.length);

      const result = await repository.countTicketsByEventId(mockEventId);

      expect(mockPrismaService.ticket.count).toHaveBeenCalledWith({
        where: {
          eventId: mockEventId,
        },
      });
      expect(result).toBe(mockFoundTickets.length);
    });
  });

  describe('findTicketByTicketIdTX', () => {
    it('트랜잭션 내에서 티켓을 조회한다', async () => {
      const mockTx = {
        ticket: {
          findFirst: jest.fn().mockResolvedValue(mockFoundTicket),
        },
      };

      const result = await repository.findTicketByTicketIdTX(
        mockTx as any,
        mockCreateSeatingDto,
      );

      expect(result).toEqual(mockFoundTicket);
    });
  });

  describe('reserveSeatingTicketTX', () => {
    it('트랜잭션 내에서 티켓을 예약해야 한다', async () => {
      const mockTx = {
        ticket: {
          update: jest.fn(),
        },
      };

      await repository.reserveSeatingTicketTX({
        tx: mockTx as any,
        createSeatingDto: mockCreateSeatingDto,
        reservation: mockReservation,
      });

      expect(mockTx.ticket.update).toHaveBeenCalledWith({
        where: {
          id: mockTicketId,
        },
        data: {
          isAvailable: false,
          reservation: {
            connect: {
              id: mockReservationId,
            },
          },
        },
      });
    });
  });

  describe('findStandingTicketTX', () => {
    it('트랜잭션 내에서 스탠딩 티켓을 조회해야 한다', async () => {
      const mockTx = {
        ticket: {
          findFirst: jest.fn(),
        },
      };

      await repository.findStandingTicketTX(
        mockTx as any,
        mockCreateStandingDto,
      );

      expect(mockTx.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          eventId: mockEventId,
          isAvailable: true,
        },
      });
    });
  });

  describe('reserveStandingTicketTX', () => {
    it('트랜잭션 내에서 스탠딩 티켓을 예약해야 한다', async () => {
      const mockTx = {
        ticket: {
          update: jest.fn(),
        },
      };

      await repository.reserveStandingTicketTX({
        tx: mockTx as any,
        reservation: mockReservation,
        ticket: mockFoundTicket,
      });

      expect(mockTx.ticket.update).toHaveBeenCalledWith({
        where: {
          id: mockFoundTicket.id,
        },
        data: {
          isAvailable: false,
          reservation: {
            connect: {
              id: mockReservationId,
            },
          },
        },
      });
    });
  });
});
