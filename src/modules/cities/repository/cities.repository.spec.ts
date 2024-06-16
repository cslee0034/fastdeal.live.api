import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CitiesRepository } from './cities.repository';

describe('CitiesRepository', () => {
  let repository: CitiesRepository;

  const mockPrismaService = {
    city: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
        id: 'test_city_id',
        cityName: 'test_city_name',
        countryCode: 'test_country_code',
        isAvailable: true,
      };
      const expectedCity = { ...createCityDto };

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

    describe('findMany', () => {
      it('should be defined', () => {
        expect(repository.findMany).toBeDefined();
      });

      it('should find many cities', async () => {
        const mockCityName = 'test_city_name';
        const expectedCities = [{ cityName: mockCityName }];

        mockPrismaService.city.findMany.mockResolvedValue(expectedCities);

        const result = await repository.findMany(mockCityName);

        expect(result).toEqual(expectedCities);
        expect(mockPrismaService.city.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              cityName: expect.objectContaining({
                startsWith: mockCityName,
              }),
            }),
          }),
        );
      });
    });

    describe('update', () => {
      it('should be defined', () => {
        expect(repository.update).toBeDefined();
      });

      it('should update a city', async () => {
        const updateCityDto = {
          id: 'test_city_id',
          cityName: 'test_city_name',
          countryCode: 'test_country_code',
          isAvailable: true,
        };
        const expectedCity = { ...updateCityDto };

        mockPrismaService.city.update.mockResolvedValue(expectedCity);

        const result = await repository.update(updateCityDto);

        expect(result).toEqual(expectedCity);
        expect(mockPrismaService.city.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: updateCityDto.id,
            }),
            data: expect.objectContaining({
              isAvailable: updateCityDto.isAvailable,
            }),
          }),
        );
      });
    });
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(repository.delete).toBeDefined();
    });

    it('should delete a city', async () => {
      const mockDeleteCityId = 'test_city_id';
      const expectedCity = { mockDeleteCityId };

      mockPrismaService.city.delete.mockResolvedValue(expectedCity);

      const result = await repository.delete(mockDeleteCityId);

      expect(result).toEqual(expectedCity);
      expect(mockPrismaService.city.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: mockDeleteCityId,
          }),
        }),
      );
    });
  });
});
