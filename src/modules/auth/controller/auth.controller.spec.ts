import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';
import { Tokens } from '../types/tokens.type';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

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

  const mockAuthService = {
    generateToken: jest
      .fn()
      .mockImplementation((userId: number, email: string): Promise<Tokens> => {
        if (userId && email) {
          return Promise.resolve(mockTokenResult);
        } else {
          return Promise.reject(
            new InternalServerErrorException('Failed to create token'),
          );
        }
      }),
  };

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

  const mockTokenResult: Tokens = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

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

    it('should call generateToken with created user information', async () => {
      await controller.signup(mockSignUpDto as SignUpDto);

      expect(authService.generateToken).toHaveBeenCalledWith(
        mockCreateUserResult.id as number,
        mockCreateUserResult.email as string,
      );
    });
  });
});
