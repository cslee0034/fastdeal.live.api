import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './users.repository';
import { PrismaService } from '../../../config/orm/prisma/service/prisma.service';

describe('UsersRepository', () => {
  let repository: UserRepository;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@email.com',
        name: 'test_user',
        password: 'password',
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
        name: 'test_user',
        password: 'test_password',
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
