import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { ApplicationStatus, Role } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    sellerApplication: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockUser: CreateUserDto = {
    email: 'test@email.com',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
    password: 'password',
  };

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';

  const mockExpectedUser = {
    ...mockUser,
    id: mockId,
    role: Role.CUSTOMER,
  };

  const mockDescription = '판매자 신청합니다';

  const mockSellerApplication = {
    id: mockId.replace('6', '7'),
    userId: mockId,
    description: mockDescription,
    status: ApplicationStatus.PENDING,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('새로운 유저를 생성해야 한다', async () => {
      const expectedUser = {
        ...mockUser,
        id: '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec',
        role: Role.CUSTOMER,
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await repository.create(mockUser);

      expect(result).toEqual(expectedUser);
    });
  });

  describe('findOneById', () => {
    it('findOneById가 정의되어 있어야 한다', () => {
      expect(repository.findOneById).toBeDefined();
    });

    it('주어진 ID로 유저를 찾아 반환해야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExpectedUser);

      const result = await repository.findOneById(mockId);

      expect(result).toEqual(mockExpectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
      });
    });

    it('유저가 존재하지 않을 경우 null을 반환해야 한다', async () => {
      const id = 'nonexistent-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneById(id);

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: id },
      });
    });
  });

  describe('findOneByEmail', () => {
    it('주어진 이메일로 유저를 찾아 반환해야 한다', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(mockExpectedUser);

      const result = await repository.findOneByEmail(email);

      expect(result).toEqual(mockExpectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
      });
    });

    it('유저가 존재하지 않을 경우 null을 반환해야 한다', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneByEmail(email);

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
      });
    });
  });

  describe('applyToSeller', () => {
    it('판매자 신청을 생성해야 한다', async () => {
      mockPrismaService.sellerApplication.create.mockResolvedValue(
        mockSellerApplication,
      );

      const result = await repository.applyToSeller(mockId, mockDescription);

      expect(result).toEqual(mockSellerApplication);
      expect(mockPrismaService.sellerApplication.create).toHaveBeenCalledWith({
        data: {
          user: {
            connect: {
              id: mockId,
            },
          },
          description: mockDescription,
        },
      });
    });
  });

  describe('findManySellerApplication', () => {
    it('판매자 신청 목록을 찾아 반환해야 한다', async () => {
      mockPrismaService.sellerApplication.findMany.mockResolvedValue([
        mockSellerApplication,
      ]);

      const result = await repository.findManySellerApplication(0, 10);

      expect(result).toEqual([mockSellerApplication]);
      expect(mockPrismaService.sellerApplication.findMany).toHaveBeenCalledWith(
        {
          skip: 0,
          take: 10,
        },
      );
    });
  });

  describe('approveToSeller', () => {
    it('판매자 신청을 승인해야 한다', async () => {
      mockPrismaService.sellerApplication.update.mockResolvedValue(
        mockSellerApplication,
      );

      const result = await repository.approveToSeller(mockId);

      expect(result).toEqual(mockSellerApplication);
      expect(mockPrismaService.sellerApplication.update).toHaveBeenCalledWith({
        where: { id: mockId },
        data: {
          status: ApplicationStatus.APPROVED,
        },
      });
    });
  });

  describe('rejectToSeller', () => {
    it('판매자 신청을 거절해야 한다', async () => {
      mockPrismaService.sellerApplication.update.mockResolvedValue(
        mockSellerApplication,
      );

      const result = await repository.rejectToSeller(mockId);

      expect(result).toEqual(mockSellerApplication);
      expect(mockPrismaService.sellerApplication.update).toHaveBeenCalledWith({
        where: { id: mockId },
        data: {
          status: ApplicationStatus.REJECTED,
        },
      });
    });
  });
});
