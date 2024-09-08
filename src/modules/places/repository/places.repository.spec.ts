import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PlacesRepository } from './places.repository';
import { CreatePlaceDto } from '../dto/create-place.dto';

describe('PlacesRepository', () => {
  let repository: PlacesRepository;

  const mockPrismaService = {
    place: {
      create: jest.fn(),
    },
  };

  const mockPlace: CreatePlaceDto = {
    city: '서울시',
    district: '강남구',
    street: '봉은사로',
    streetNumber: 10,
  };

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PlacesRepository>(PlacesRepository);
  });

  it('UsersRepository가 정의되어 있어야 한다', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('새로운 위치를 생성해야 한다', async () => {
      const expectedUser = {
        ...mockPlace,
        id: '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec',
      };

      mockPrismaService.place.create.mockResolvedValue(expectedUser);

      const result = await repository.create(expectedUser);

      expect(result).toEqual(expectedUser);
    });
  });
});
