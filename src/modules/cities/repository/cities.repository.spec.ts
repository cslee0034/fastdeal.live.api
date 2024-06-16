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
    cityScore: {
      create: jest.fn(),
      findFirst: jest.fn(),
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

  describe('createScore', () => {
    it('should be defined', () => {
      expect(repository.createScore).toBeDefined();
    });

    it('should score a city', async () => {
      const scoreCityDto = {
        cityId: 'test_city_id',
        voterId: 'test_voter_id',
        totalScore: 5,
        internetSpeed: 5,
        costOfLiving: 5,
        tourism: 5,
        safety: 5,
      };
      const expectedCity = { ...scoreCityDto };

      mockPrismaService.cityScore.create.mockResolvedValue(expectedCity);

      const result = await repository.createScore(scoreCityDto);

      expect(result).toEqual(expectedCity);
      expect(mockPrismaService.cityScore.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            city: expect.objectContaining({
              connect: expect.objectContaining({
                id: scoreCityDto.cityId,
              }),
            }),
            voter: expect.objectContaining({
              connect: expect.objectContaining({
                id: scoreCityDto.voterId,
              }),
            }),
            totalScore: scoreCityDto.totalScore,
            internetSpeed: scoreCityDto.internetSpeed,
            costOfLiving: scoreCityDto.costOfLiving,
            tourism: scoreCityDto.tourism,
            safety: scoreCityDto.safety,
          }),
        }),
      );
    });
  });

  describe('findCityScoreByVoterId', () => {
    it('should be defined', () => {
      expect(repository.findCityScoreByVoterId).toBeDefined();
    });

    it('should find city score by voter id', async () => {
      const mockVoterId = 'test_voter_id';
      const mockCityId = 'test_city_id';
      const expectedCity = { voterId: mockVoterId, cityId: mockCityId };

      mockPrismaService.cityScore.findFirst.mockResolvedValue(expectedCity);

      const result = await repository.findCityScoreByVoterId(
        mockVoterId,
        mockCityId,
      );

      expect(result).toEqual(expectedCity);
      expect(mockPrismaService.cityScore.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            voterId: mockVoterId,
            cityId: mockCityId,
          }),
        }),
      );
    });
  });
});
