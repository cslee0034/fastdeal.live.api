import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from '../service/tickets.service';
describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    findTicketsByEventId: jest
      .fn()
      .mockImplementation(async (eventId: string) => {
        return Promise.resolve(mockTickets);
      }),

    countTicketsByEventId: jest
      .fn()
      .mockImplementation(async (eventId: string) => {
        return Promise.resolve(mockTickets.length);
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
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 목록을 반환한다', async () => {
      const result = await controller.findTicketsByEventId(mockEventId);

      expect(service.findTicketsByEventId).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(mockTickets);
    });
  });

  describe('countTicketsByEventId', () => {
    it('이벤트 ID에 해당하는 티켓 수를 반환한다', async () => {
      const result = await controller.countTicketsByEventId(mockEventId);

      expect(service.countTicketsByEventId).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(mockTickets.length);
    });
  });
});
