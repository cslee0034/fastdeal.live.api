import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventsRepository } from '../repository/events.repository';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventEntity } from '../entities/event.entity';
import { FailedToCreateEventError } from '../error/failed-to-create-event';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsRepository } from '../../tickets/repository/tickets.repository';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('EventsService', () => {
  let service: EventsService;
  let eventsRepository: EventsRepository;
  let ticketsRepository: TicketsRepository;
  let prisma: PrismaService;

  const mockId = '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d';
  const mockPlaceId = '987e4567-e89b-12d3-a456-426614174000';

  const mockCreateEventDto: CreateEventDto = {
    name: '테스트 이벤트',
    description: '이벤트 설명',
    date: new Date(),
    placeId: mockPlaceId,
    price: 10000,
    quantity: 100,
    image: 'https://example.com/image.jpg',
  };

  const mockEventEntity = new EventEntity({
    id: mockId,
    ...mockCreateEventDto,
  });

  const mockTickets = Array.from(
    { length: mockCreateEventDto.quantity },
    (_, i) => ({
      eventId: mockEventEntity.id,
      price: mockCreateEventDto.price,
      seatNumber: i + 1,
      checkInCode: 'mock-uuid',
      image: mockCreateEventDto.image,
    }),
  );

  const mockEventTicketCreate = {
    event: mockEventEntity,
    tickets: mockTickets,
  };

  const mockEventsRepository = {
    createEvents: jest.fn(),
  };

  const mockTicketsRepository = {
    createTickets: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventsRepository,
          useValue: mockEventsRepository,
        },
        {
          provide: TicketsRepository,
          useValue: mockTicketsRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventsRepository = module.get<EventsRepository>(EventsRepository);
    ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create 이벤트 생성', () => {
    it('이벤트와 티켓을 생성하고 EventTicketCreate를 반환해야 한다', async () => {
      mockEventsRepository.createEvents.mockResolvedValue(mockEventEntity);
      mockTicketsRepository.createTickets.mockResolvedValue(mockTickets);

      mockPrismaService.$transaction.mockImplementation(async (tx: any) => {
        return tx(prisma);
      });

      const result = await service.create(mockCreateEventDto);

      expect(eventsRepository.createEvents).toHaveBeenCalledWith(
        prisma,
        mockCreateEventDto,
      );
      expect(ticketsRepository.createTickets).toHaveBeenCalledWith(
        prisma,
        mockTickets,
      );

      expect(result).toEqual(mockEventTicketCreate);
    });

    it('이벤트 생성 중 오류가 발생하면 FailedToCreateEventError 예외를 반환한다', async () => {
      mockPrismaService.$transaction.mockRejectedValue(new Error('Error'));

      await expect(service.create(mockCreateEventDto)).rejects.toThrow(
        FailedToCreateEventError,
      );
    });

    it('mapTicketData가 티켓 데이터를 생성해야 한다', async () => {
      const mappedTickets = await service['mapTicketData'](
        mockCreateEventDto,
        mockEventEntity,
      );

      expect(mappedTickets).toEqual(mockTickets);
    });
  });
});
