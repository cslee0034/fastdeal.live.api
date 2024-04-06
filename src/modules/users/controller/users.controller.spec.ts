import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../service/users.service';
import { UsersRepository } from '../repository/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const email = 'test@email.com' as string;
  const provider = 'local' as string;
  const firstName = 'test_first_name' as string;
  const lastName = 'test_last_name' as string;
  const password = 'test_password' as string;

  const mockUserService = {
    findOneByEmail: jest.fn(async (email: string) => {
      const createdAt = new Date();
      const updatedAt = new Date();

      return Promise.resolve(
        new UserEntity({ email, firstName, lastName, createdAt, updatedAt }),
      );
    }),

    createLocal: jest.fn(async (createUserDto: CreateUserDto) => {
      const email = createUserDto.email;
      const firstName = createUserDto.firstName;
      const lastName = createUserDto.lastName;
      const createdAt = new Date();
      const updatedAt = new Date();

      return Promise.resolve(
        new UserEntity({ email, firstName, lastName, createdAt, updatedAt }),
      );
    }),
  };

  const mockUserRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: UsersRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should be defined', () => {
      expect(controller.findOneByEmail).toBeDefined();
    });

    it('should called with email', async () => {
      await controller.findOneByEmail(email);

      expect(service.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return instance of UserEntity', async () => {
      const newUser = await controller.findOneByEmail(email);

      expect(newUser).toBeInstanceOf(UserEntity);
    });
  });

  describe('create user', () => {
    const mockCreateUserDto: CreateUserDto = {
      email,
      provider,
      firstName,
      lastName,
      password,
    };

    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should called with CreateUserDto', async () => {
      await controller.create(mockCreateUserDto as CreateUserDto);

      expect(service.createLocal).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should return instance of UserEntity', async () => {
      const newUser = await controller.create(mockCreateUserDto);

      expect(newUser).toBeInstanceOf(UserEntity);
    });
  });
});
