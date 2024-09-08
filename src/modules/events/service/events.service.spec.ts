import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventsRepository } from '../repository/events.repository';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventEntity } from '../entities/event.entity';
import { FailedToCreateEventError } from '../error/failed-to-create-event';

describe('EventsService', () => {
  let service: EventsService;
  let repository: EventsRepository;

  const mockEventsRepository = {
    create: jest.fn().mockImplementation((createEventDto: CreateEventDto) => {
      return Promise.resolve(
        new EventEntity({
          id: mockId,
          ...createEventDto,
        }),
      );
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
      providers: [
        EventsService,
        {
          provide: EventsRepository,
          useValue: mockEventsRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<EventsRepository>(EventsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('이벤트를 생성하고 EventEntity를 반환해야 한다', async () => {
      const result = await service.create(mockCreateEventDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreateEventDto);
      expect(result).toEqual(mockEventEntity);
    });

    it('이벤트 생성 중 에러가 발생하면 FailedToCreateEventError를 반환한다', () => {
      repository.create = jest.fn().mockRejectedValue(new Error());

      expect(service.create(mockCreateEventDto)).rejects.toThrow(
        FailedToCreateEventError,
      );
    });
  });
});
