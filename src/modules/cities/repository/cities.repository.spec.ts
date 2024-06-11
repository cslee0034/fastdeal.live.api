import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CitiesRepository } from './cities.repository';

describe('CitiesRepository', () => {
  let repository: CitiesRepository;

  const mockPrismaService = {
    city: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CitiesRepository>(CitiesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(repository.create).toBeDefined();
    });

    it('should create a new city', async () => {
      const createCityDto = {
        cityName: 'test_city_name',
        countryCode: 'test_country_code',
      };
      const expectedCity = { id: 1, ...createCityDto };

      mockPrismaService.city.create.mockResolvedValue(expectedCity);

      const result = await repository.create(createCityDto);

      expect(result).toEqual(expectedCity);
      expect(mockPrismaService.city.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cityName: createCityDto.cityName,
          }),
        }),
      );
    });

    describe('update', () => {
      it('should be defined', () => {
        expect(repository.update).toBeDefined();
      });

      it('should update a city', async () => {
        const updateCityDto = {
          cityName: 'test_city_name',
          countryCode: 'test_country_code',
          isAvailable: true,
        };
        const expectedCity = { id: 1, ...updateCityDto };

        mockPrismaService.city.update.mockResolvedValue(expectedCity);

        const result = await repository.update(updateCityDto);

        expect(result).toEqual(expectedCity);
        expect(mockPrismaService.city.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              cityName: updateCityDto.cityName,
            }),
            data: expect.objectContaining({
              isAvailable: updateCityDto.isAvailable,
            }),
          }),
        );
      });
    });
  });
});
