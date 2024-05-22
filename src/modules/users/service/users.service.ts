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
import { USERS_ERROR } from '../error/users.error';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly usersManager: UsersManager,
    private readonly encryptService: EncryptService,
    private readonly configService: ConfigService,
  ) {}

  public async createLocal(createUserDto: CreateUserDto): Promise<UserEntity> {
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
      throw new InternalServerErrorException(USERS_ERROR.FAILED_TO_CREATE_USER);
    }
  }

  public async findOneById(id: string): Promise<UserEntity | null> {
    const existingUser = await this.userRepository.findOneById(id);

    if (!existingUser) {
      throw new NotFoundException(USERS_ERROR.USER_NOT_FOUND);
    }

    return new UserEntity(existingUser);
  }

  public async findOneByEmail(email: string): Promise<UserEntity | null> {
    const existingUser = await this.userRepository.findOneByEmail(email);

    if (!existingUser) {
      throw new NotFoundException(USERS_ERROR.USER_NOT_FOUND);
    }

    return new UserEntity(existingUser);
  }

  public async findOrCreateOauth(
    createOauthUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOneByEmail(
      createOauthUserDto.email,
    );

    this.usersManager.validateOauthUser(
      existingUser,
      createOauthUserDto.provider,
    );

    return new UserEntity(
      await this.userRepository.findOrCreate(createOauthUserDto),
    );
  }

  /**
   * 토큰을 내보내기 위해 res.json()을 사용하면
   * class-serializer와 transform-interceptor가 동작하지 않기 때문에
   * 별도의 사용자 응답 변환 메서드를 만들어 사용한다
   */
  public convertUserResponse(user: UserEntity) {
    return {
      success: true,
      id: user?.id,
      email: user?.email,
      provider: user?.provider || 'local',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      // milliseconds가 기본 값이므로 초로 변환
      expiresIn: this.configService.get('jwt.refresh.expiresIn') / 1000,
    };
  }
}
