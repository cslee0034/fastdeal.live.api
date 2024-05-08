import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../repository/users.repository';
import { UserEntity } from '../entities/user.entity';
import { EncryptService } from '../../encrypt/service/encrypt.service';
import { UsersManager } from '../manager/users.manager';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly usersManager: UsersManager,
    private readonly encryptService: EncryptService,
  ) {}

  async createLocal(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOneByEmail(
      createUserDto.email,
    );

    this.usersManager.validateLocalUser(existingUser);

    try {
      createUserDto.password = await this.encryptService.hash(
        createUserDto.password,
      );

      return new UserEntity(await this.userRepository.create(createUserDto));
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findOneById(id: string): Promise<UserEntity | null> {
    const existingUser = await this.userRepository.findOneById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return new UserEntity(existingUser);
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    const existingUser = await this.userRepository.findOneByEmail(email);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return new UserEntity(existingUser);
  }

  async findOrCreateOauth(
    createOauthUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOneByEmail(
      createOauthUserDto.email,
    );

    this.usersManager.validateOauthUser(existingUser);

    return new UserEntity(await this.userRepository.create(createOauthUserDto));
  }
}
