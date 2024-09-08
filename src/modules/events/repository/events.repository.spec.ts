import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from '../dto/create-event-dto';
describe('UsersRepository', () => {
  let repository: EventsRepository;

  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

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

  const mockEvent = {
    id: '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d',
    ...mockCreateEventDto,
  };

  const mockEventPlace = {
    city: '서울시',
    district: '강남구',
    street: '봉은사로',
    streetNumber: 10,
    eventName: '테스트 이벤트',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<EventsRepository>(EventsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('이벤트를 생성해야 한다', async () => {
      await repository.create(mockCreateEventDto);

      expect(mockPrismaService.event.create).toHaveBeenCalledWith({
        data: {
          name: mockCreateEventDto.name,
          description: mockCreateEventDto.description,
          date: mockCreateEventDto.date,
          place: {
            connect: {
              id: mockCreateEventDto.placeId,
            },
          },
        },
      });
    });
  });

  describe('createEventTx', () => {
    it('트랜잭션 내에서 이벤트를 생성해야 한다', async () => {
      const mockTx = {
        event: { create: jest.fn().mockResolvedValue(mockEvent) },
      };

      const result = await repository.createEventTx(
        mockTx as any,
        mockCreateEventDto,
      );

      expect(mockTx.event.create).toHaveBeenCalledWith({
        data: {
          name: mockCreateEventDto.name,
          description: mockCreateEventDto.description,
          date: mockCreateEventDto.date,
          place: {
            connect: {
              id: mockCreateEventDto.placeId,
            },
          },
        },
      });

      expect(result).toEqual(mockEvent);
    });
  });

  describe('findEventsByPlace', () => {
    it('장소에 해당하는 이벤트를 반환해야 한다', async () => {
      await repository.findEventsByPlace(mockEventPlace);

      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          place: {
            city: mockEventPlace.city,
            district: mockEventPlace.district,
            street: mockEventPlace.street,
            streetNumber: mockEventPlace.streetNumber,
          },
          name: mockEventPlace.eventName,
        },
      });
    });
  });
});
