import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let usersService: any;

  const mockUsersService = {
    create: jest
      .fn()
      .mockImplementation((mockSignUpDto: SignUpDto): Promise<UserEntity> => {
        if (
          mockSignUpDto.email === 'test@email.com' &&
          mockSignUpDto.password === 'test_password' &&
          mockSignUpDto.name === 'test_name'
        ) {
          return Promise.resolve(mockCreateUserResult);
        } else {
          return Promise.reject(new ForbiddenException('User already exists'));
        }
      }),

    findOneByEmail: jest.fn((email: string): Promise<UserEntity> => {
      if (email === 'test@email.com') {
        return Promise.resolve(mockFindOneByEmailResult);
      } else {
        return Promise.reject(new NotFoundException('User not found'));
      }
    }),
  };

  const mockAuthService = {};

  const mockSignUpDto: SignUpDto = {
    email: 'test@email.com',
    name: 'test_name',
    password: 'test_password',
  };

  const mockCreateUserResult: UserEntity = new UserEntity({
    id: 1,
    email: 'test@email.com',
    name: 'test_name',
    password: 'hashed_test_password',
  });

  const mockFindOneByEmailResult: UserEntity = new UserEntity({
    id: 1,
    email: 'test@email.com',
    name: 'test_name',
    password: 'hashed_test_password',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should be defined', () => {
      expect(controller.signup).toBeDefined();
    });

    it('should call userService.create with SignUpDto', async () => {
      await controller.signup(mockSignUpDto as SignUpDto);

      expect(usersService.create).toHaveBeenCalledWith(
        mockSignUpDto as SignUpDto,
      );
    });
  });
});
