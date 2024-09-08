import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { FailedToFindTicketError } from '../error/failed-to-find-ticket';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: TicketsRepository;

  const mockTicketsRepository = {
    findTicketsByEventId: jest.fn(async (eventId: string) => {
      if (eventId === 'not-exists') {
        return Promise.resolve([]);
      }

      return Promise.resolve(mockTickets);
    }),
  };

  const mockEventId = '9a7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5b';
  const mockTickets = [
    {
      id: '9a7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5b',
      eventId: '9a7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5b',
      price: 100000,
    },
    {
      id: '4d7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5c',
      eventId: '9a7b5b9e-1b7b-4b3b-8e0e-1b0b5b9e7b5b',
      price: 100000,
    },
  ];

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
});
