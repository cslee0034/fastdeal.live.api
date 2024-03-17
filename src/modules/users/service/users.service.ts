import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repository/users.repository';
import { UserEntity } from '../entities/user.entity';
import { EncryptService } from '../../encrypt/service/encrypt.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptService: EncryptService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOneByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ForbiddenException('User already exists');
    }

    try {
      createUserDto.password = await this.encryptService.hash(
        createUserDto.password,
      );

      return new UserEntity(await this.userRepository.create(createUserDto));
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    const existing = await this.userRepository.findOneByEmail(email);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    return new UserEntity(existing);
  }
}
