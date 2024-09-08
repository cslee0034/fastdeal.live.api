import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from '../service/events.service';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventEntity } from '../entities/event.entity';
describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    create: jest.fn().mockImplementation((createEventDto: CreateEventDto) => {
      return Promise.resolve({
        id: mockId,
        ...mockCreateEventDto,
      });
    }),
  };

  const mockId = '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d';
  const mockPlaceId = '987e4567-e89b-12d3-a456-426614174000';
  const mockCreateEventDto: CreateEventDto = {
    name: '테스트 이벤트',
    description: '이벤트 설명',
    date: new Date(),
    placeId: mockPlaceId,
  };
  const mockEventEntity = new EventEntity({
    id: mockId,
    ...mockCreateEventDto,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('이벤트를 생성하고 반환한다', async () => {
      const result = await controller.create(mockCreateEventDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateEventDto);
      expect(result).toEqual(mockEventEntity);
    });
  });
});
