import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Role } from '../entities/user.entity';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
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
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@email.com',
        provider: 'local',
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'password',
        role: Role.USER,
      };
      const expectedUser = { id: 1, ...createUserDto };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await repository.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if a user with the email exists', async () => {
      const email = 'test@example.com';
      const expectedUser = {
        id: 1,
        email,
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'test_password',
        role: Role.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await repository.findOneByEmail(email);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
      });
    });

    it('should return null if no user with the email exists', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneByEmail(email);

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
      });
    });
  });
});
