import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from '../service/places.service';
import { Place } from '@prisma/client';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { PlaceEntity } from '../entities/place.entity';
import { FindManyPlacesDto } from '../dto/find-many-places-dto';

describe('PlacesController', () => {
  let controller: PlacesController;
  let service: PlacesService;

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
      id: 'another-id',
      city: '서울시',
      district: '서초구',
      street: '서초대로',
      streetNumber: 50,
    },
  ] as Place[];

  const updatePlaceDto = {
    city: '서울시',
    district: '강남구',
    street: '봉은사로',
    streetNumber: 10,
  };

  const mockPlacesService = {
    create: jest
      .fn()
      .mockImplementation((createPlaceDto: CreatePlaceDto): Promise<Place> => {
        return Promise.resolve(
          new PlaceEntity({
            id: mockId,
            ...mockPlace,
          }),
        );
      }),

    findMany: jest
      .fn()
      .mockImplementation(
        (findManyPlacesDto: FindManyPlacesDto): Promise<Place[]> => {
          return Promise.resolve(
            mockPlaces.map((place) => new PlaceEntity(place)),
          );
        },
      ),

    update: jest.fn().mockImplementation((id: string, updatePlaceDto: any) => {
      return Promise.resolve({
        id,
        ...updatePlaceDto,
      });
    }),

    remove: jest.fn().mockImplementation((id: string): Promise<boolean> => {
      return Promise.resolve(true);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: mockPlacesService,
        },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
    service = module.get<PlacesService>(PlacesService);

    jest.clearAllMocks();
  });

  it('PlacesController가 정의되어 있어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('생성한 장소를 반환해야 한다', async () => {
      const result = await controller.create(mockPlace);

      expect(result).toEqual(
        new PlaceEntity({
          id: mockId,
          ...mockPlace,
        }),
      );
      expect(mockPlacesService.create).toHaveBeenCalledWith(mockPlace);
    });
  });

  describe('findMany', () => {
    it('조건에 맞는 장소 목록을 반환해야 한다', async () => {
      const findManyDto: FindManyPlacesDto = {
        city: '서울시',
        district: '강남구',
        street: '봉은사로',
        streetNumber: 10,
      };

      const result = await controller.findMany(findManyDto);

      expect(result).toEqual(mockPlaces.map((place) => new PlaceEntity(place)));
      expect(mockPlacesService.findMany).toHaveBeenCalledWith(findManyDto);
    });
  });

  describe('update', () => {
    it('장소를 업데이트하고 반환해야 한다', async () => {
      const updatePlaceDto = {
        city: '서울시',
        district: '강남구',
        street: '봉은사로',
        streetNumber: 10,
      };

      const result = await controller.update(mockId, updatePlaceDto);

      expect(result).toEqual({
        id: mockId,
        ...updatePlaceDto,
      });
      expect(mockPlacesService.update).toHaveBeenCalledWith(
        mockId,
        updatePlaceDto,
      );
    });
  });

  describe('remove', () => {
    it('장소를 삭제해야 한다', async () => {
      const result = await controller.remove(mockId);

      expect(result).toEqual(true);
      expect(mockPlacesService.remove).toHaveBeenCalledWith(mockId);
    });
  });
});
