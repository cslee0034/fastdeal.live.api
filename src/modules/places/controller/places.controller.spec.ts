import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from '../service/places.service';
import { Place } from '@prisma/client';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { PlaceEntity } from '../entities/place.entity';

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return a new place', async () => {
      const result = await controller.create(mockPlace);

      expect(result).toEqual(
        new PlaceEntity({
          id: mockId,
          ...mockPlace,
        }),
      );
    });
  });
});
