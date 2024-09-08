import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsRepository } from './tickets.repository';
import { MappedTicket } from '../interface/mapped-ticket.interface';
import { CreateEventDto } from '../../events/dto/create-event-dto';
import { EventEntity } from '../../events/entities/event.entity';
describe('TicketsRepository', () => {
  let repository: TicketsRepository;

  const mockPrismaService = {
    ticket: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockPlaceId = '987e4567-e89b-12d3-a456-426614174000';
  const mockEventId = '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d';
  const mockCreateEventDto: CreateEventDto = {
    name: '테스트 이벤트',
    description: '이벤트 설명',
    date: new Date(),
    placeId: mockPlaceId,
    price: 10000,
    quantity: 100,
    image: 'https://example.com/image.jpg',
  };

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

  const mockFoundTickets = mockMappedTickets.map((ticket) => {
    return {
      eventId: ticket.eventId,
      price: ticket.price,
      seatNumber: ticket.seatNumber,
      checkInCode: ticket.checkInCode,
      image: ticket.image,
      createAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const createdTickets = mockMappedTickets.map((ticket) => {
    return {
      eventId: ticket.eventId,
      price: ticket.price,
      seatNumber: ticket.seatNumber,
      checkInCode: ticket.checkInCode,
      image: ticket.image,
      createAt: new Date(),
      updatedAt: new Date(),
    };
  });

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
});
