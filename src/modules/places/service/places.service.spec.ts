import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { PlacesRepository } from '../repository/places.repository';
import { Place } from '@prisma/client';
import { FailedToCreatePlaceError } from '../error/failed-to-create-place';
import { PlaceEntity } from '../entities/place.entity';
import { FindManyPlacesDto } from '../dto/find-many-places-dto';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { FailedToFindPlaceError } from '../error/failed-to-find-place';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { FailedToUpdatePlaceError } from '../error/failed-to-update-place';

describe('PlacesService', () => {
  let service: PlacesService;
  let repository: PlacesRepository;

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockPlace = {
    city: '서울시',
    district: '강남구',
    street: '봉은사로',
    streetNumber: 10,
  } as Place;

  const mockPlaces = [
    {
      id: mockId,
      city: '서울시',
      district: '강남구',
      street: '봉은사로',
      streetNumber: 10,
    },
    {
      id: mockId.replace('6', '7'),
      city: '서울시',
      district: '서초구',
      street: '서초대로',
      streetNumber: 50,
    },
  ] as Place[];

  const mockUpdatedPlace = {
    id: mockId,
    ...mockPlace,
  } as Place;

  const mockPlacesRepository = {
    create: jest
      .fn()
      .mockImplementation((createPlaceDto: CreatePlaceDto): Promise<Place> => {
        return Promise.resolve(
          new PlaceEntity({
            id: mockId,
            ...createPlaceDto,
          }),
        );
      }),

    findMany: jest
      .fn()
      .mockImplementation(
        (findManyPlacesDto: FindManyPlacesDto): Promise<Place[]> => {
          return Promise.resolve(mockPlaces);
        },
      ),

    update: jest
      .fn()
      .mockImplementation(
        (id: string, updatePlaceDto: UpdatePlaceDto): Promise<Place> => {
          return Promise.resolve(mockUpdatedPlace);
        },
      ),

    remove: jest.fn().mockImplementation((id: string): Promise<void> => {
      return Promise.resolve();
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: PlacesRepository,
          useValue: mockPlacesRepository,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    repository = module.get<PlacesRepository>(PlacesRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('장소를 생성하고 반환해야 한다', async () => {
      const result = await service.create(mockPlace);

      expect(result).toEqual(
        new PlaceEntity({
          id: mockId,
          ...mockPlace,
        }),
      );

      expect(mockPlacesRepository.create).toHaveBeenCalledWith(mockPlace);
    });

    it('장소를 생성할 수 없다면 에러를 반환해야 한다', async () => {
      mockPlacesRepository.create.mockRejectedValue(new Error());

      await expect(service.create(mockPlace)).rejects.toThrow(
        FailedToCreatePlaceError,
      );
    });
  });

  describe('findMany', () => {
    it('조건에 맞는 장소들을 찾아서 반환해야 한다', async () => {
      const findManyPlacesDto: FindManyPlacesDto = {
        city: '서울시',
        district: '강남구',
        street: '봉은사로',
        streetNumber: 10,
        skip: 0,
        take: 10,
      };

      const result = await service.findMany(findManyPlacesDto);

      expect(result).toEqual(mockPlaces.map((place) => new PlaceEntity(place)));
      expect(mockPlacesRepository.findMany).toHaveBeenCalledWith(
        findManyPlacesDto,
      );
    });

    it('장소를 찾을 수 없다면 FailedToFindPlaceError 에러를 반환해야 한다', async () => {
      mockPlacesRepository.findMany.mockRejectedValue(new Error());

      const findPlaceDto: FindManyPlacesDto = {
        city: '서울시',
      };

      await expect(service.findMany(findPlaceDto)).rejects.toThrow(
        FailedToFindPlaceError,
      );
    });
  });

  describe('update', () => {
    it('장소 정보를 업데이트하고 반환해야 한다', async () => {
      const updatePlaceDto: UpdatePlaceDto = {
        city: '서울시',
        district: '서초구',
      };

      const result = await service.update(mockId, updatePlaceDto);

      expect(result).toEqual(new PlaceEntity(mockUpdatedPlace));
      expect(mockPlacesRepository.update).toHaveBeenCalledWith(
        mockId,
        updatePlaceDto,
      );
    });

    it('장소 업데이트에 실패하면 FailedToUpdatePlaceError를 반환해야 한다', async () => {
      mockPlacesRepository.update.mockRejectedValueOnce(new Error());

      const updatePlaceDto: UpdatePlaceDto = {
        city: '서울시',
        district: '서초구',
      };

      await expect(service.update(mockId, updatePlaceDto)).rejects.toThrow(
        FailedToUpdatePlaceError,
      );
    });
  });

  describe('remove', () => {
    it('장소를 삭제해야 한다', async () => {
      const result = await service.remove(mockId);

      expect(repository.remove).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(true);
    });

    it('장소를 삭제할 수 없다면 에러를 반환해야 한다', async () => {
      mockPlacesRepository.remove.mockRejectedValue(new Error());

      await expect(service.remove(mockId)).rejects.toThrow();
    });
  });
});
