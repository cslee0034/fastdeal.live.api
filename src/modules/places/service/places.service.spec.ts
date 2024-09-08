import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { PlacesRepository } from '../repository/places.repository';
import { Place } from '@prisma/client';
import { FailedToCreatePlaceError } from '../error/failed-to-create-place';
import { PlaceEntity } from '../entities/place.entity';

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

  const mockPlacesRepository = {
    create: jest.fn().mockImplementation((place): Promise<Place> => {
      return Promise.resolve(
        new PlaceEntity({
          id: mockId,
          ...place,
        }),
      );
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
});
