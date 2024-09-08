import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PlacesRepository } from './places.repository';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { FindManyPlacesDto } from '../dto/find-many-places-dto';
import { REPOSITORY_CONSTANT } from '../../../common/constant/repository.constant';
import { UpdatePlaceDto } from '../dto/update-place.dto';

describe('PlacesRepository', () => {
  let repository: PlacesRepository;
  let prisma: PrismaService;

  const mockPrismaService = {
    place: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';

  const mockPlace: CreatePlaceDto = {
    city: '서울시',
    district: '강남구',
    street: '봉은사로',
    streetNumber: 10,
  };

  const mockFindPlaceDto: FindManyPlacesDto = {
    city: '서울시',
    district: '강남구',
    street: '봉은사로',
    streetNumber: 10,
    skip: 0,
    take: 10,
  };

  const updatePlaceDto: UpdatePlaceDto = {
    city: '서울시',
    district: '서초구',
  };

  const mockPlaceEntity = {
    ...mockPlace,
    id: mockId,
  };

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
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('PlacesRepository가 정의되어 있어야 한다', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('새로운 위치를 생성해야 한다', async () => {
      mockPrismaService.place.create.mockResolvedValue(mockPlaceEntity);

      const result = await repository.create(mockPlace);

      expect(result).toEqual(mockPlaceEntity);
      expect(prisma.place.create).toHaveBeenCalledWith({
        data: mockPlace,
      });
    });
  });

  describe('find', () => {
    it('조건에 맞는 위치 목록을 찾아야 한다', async () => {
      const expectedPlaces = [mockPlaceEntity];

      mockPrismaService.place.findMany.mockResolvedValue(expectedPlaces);

      const result = await repository.findMany(mockFindPlaceDto);

      expect(result).toEqual(expectedPlaces);
      expect(prisma.place.findMany).toHaveBeenCalledWith({
        where: {
          city: mockFindPlaceDto.city,
          district:
            mockFindPlaceDto.district || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
          street:
            mockFindPlaceDto.street || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
          streetNumber:
            mockFindPlaceDto.streetNumber ||
            REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
        },
        skip: mockFindPlaceDto.skip || REPOSITORY_CONSTANT.DEFAULT_SKIP,
        take: mockFindPlaceDto.take || REPOSITORY_CONSTANT.DEFAULT_TAKE,
      });
    });

    it('skip과 take가 없을 경우 기본값을 사용해야 한다', async () => {
      const expectedPlaces = [mockPlaceEntity];

      mockPrismaService.place.findMany.mockResolvedValue(expectedPlaces);

      const result = await repository.findMany({
        ...mockFindPlaceDto,
        skip: undefined,
        take: undefined,
      });

      expect(result).toEqual(expectedPlaces);
      expect(prisma.place.findMany).toHaveBeenCalledWith({
        where: {
          city: mockFindPlaceDto.city,
          district:
            mockFindPlaceDto.district || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
          street:
            mockFindPlaceDto.street || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
          streetNumber:
            mockFindPlaceDto.streetNumber ||
            REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
        },
        skip: REPOSITORY_CONSTANT.DEFAULT_SKIP,
        take: REPOSITORY_CONSTANT.DEFAULT_TAKE,
      });
    });
  });

  describe('update', () => {
    it('장소 정보를 업데이트해야 한다', async () => {
      mockPrismaService.place.update.mockResolvedValue(mockPlaceEntity);

      const result = await repository.update(mockId, updatePlaceDto);

      expect(result).toEqual(mockPlaceEntity);
      expect(prisma.place.update).toHaveBeenCalledWith({
        where: { id: mockId },
        data: updatePlaceDto,
      });
    });
  });
});
