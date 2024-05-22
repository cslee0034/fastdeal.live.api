import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Provider, Role } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
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
        provider: Provider.local,
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'password',
        role: Role.user,
      };
      const expectedUser = { id: 1, ...createUserDto };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await repository.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            provider: Provider.local,
          }),
        }),
      );
    });

    it('should create a user with local provider by default', async () => {
      const createUserDto = {
        email: 'test@email.com',
        provider: null,
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'password',
        role: Role.user,
      };
      const expectedUser = {
        id: 1,
        ...createUserDto,
        provider: Provider.local,
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await repository.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            provider: Provider.local,
          }),
        }),
      );
    });

    it('should create a user with default value', async () => {
      const createUserDto = {
        email: 'test@email.com',
        role: Role.user,
      };
      const expectedUser = {
        id: 1,
        ...createUserDto,
        provider: Provider.local,
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await repository.create(
        createUserDto as unknown as CreateUserDto,
      );

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            provider: Provider.local,
            firstName: null,
            lastName: null,
            password: null,
          }),
        }),
      );
    });
  });

  describe('findOrCreate', () => {
    it('should upsert a user', async () => {
      const createUserDto = {
        email: 'test@email.com',
        provider: Provider.google,
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'password',
        role: Role.user,
      };
      const expectedUser = {
        id: 1,
        ...createUserDto,
        provider: Provider.google,
      };

      mockPrismaService.user.upsert.mockResolvedValue(expectedUser);

      const result = await repository.findOrCreate(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            provider: Provider.google,
          }),
        }),
      );
    });

    it('should upsert a user with default value', async () => {
      const createUserDto = {
        email: 'test@email.com',
        role: Role.user,
      };
      const expectedUser = {
        id: 1,
        ...createUserDto,
        provider: Provider.local,
      };

      mockPrismaService.user.upsert.mockResolvedValue(expectedUser);

      const result = await repository.findOrCreate(
        createUserDto as unknown as CreateUserDto,
      );

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            provider: Provider.local,
            firstName: null,
            lastName: null,
            password: null,
          }),
        }),
      );
    });
  });

  describe('findOneById', () => {
    it('should be defined', () => {
      expect(repository.findOneById).toBeDefined();
    });

    it('should return a user if a user with the id exists', async () => {
      const id = '1';
      const expectedUser = {
        id: id,
        email: 'test@example.com',
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'test_password',
        role: Role.user,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await repository.findOneById(id);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: id },
      });
    });
  });

  it('should return null if no user with the id exists', async () => {
    const id = 'nonexistent-id';
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const result = await repository.findOneById(id);

    expect(result).toBeNull();
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: id },
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if a user with the email exists', async () => {
      const email = 'test@example.com';
      const expectedUser = {
        id: '1',
        email,
        firstName: 'test_first_name',
        lastName: 'test_last_name',
        password: 'test_password',
        role: Role.user,
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
