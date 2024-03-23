import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../service/users.service';
import { UserRepository } from '../repository/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserService = {
    create: jest.fn(async (createUserDto: CreateUserDto) => {
      const email = createUserDto.email;
      const name = createUserDto.name;
      const createdAt = new Date();
      const updatedAt = new Date();

      return Promise.resolve(
        new UserEntity({ email, name, createdAt, updatedAt }),
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
          provide: UserRepository,
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

  describe('create user', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@email.com',
      name: 'test_name',
      password: 'test_password',
    };

    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should called with CreateUserDto', async () => {
      await controller.create(mockCreateUserDto as CreateUserDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should return instance of UserEntity', async () => {
      const newUser = await controller.create(mockCreateUserDto);

      expect(newUser).toBeInstanceOf(UserEntity);
    });
  });
});
