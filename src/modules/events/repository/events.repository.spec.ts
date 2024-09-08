import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from '../dto/create-event-dto';
describe('UsersRepository', () => {
  let repository: EventsRepository;

  const mockPrismaService = {
    event: {
      create: jest.fn(),
    },
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
});
