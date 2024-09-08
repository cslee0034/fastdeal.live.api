import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../repository/users.repository';
import { UserEntity } from '../entities/user.entity';
import { EncryptService } from '../../../infrastructure/encrypt/service/encrypt.service';
import { UserAlreadyExistsError } from '../error/user-already-exists';
import { FailedToGetUserError } from '../error/failed-to-get-user';
import { UserNotFoundError } from '../error/user-not-found';
import { FailedToCreateUserError } from '../error/failed-to-create-user';
import { FailedToCreateSellerApplicationError } from '../error/failed-to-create-seller-application';
import { SellerApplicationEntity } from '../entities/seller-application.entity';
import { FailedToUpdateSellerApplicationError } from '../error/failed-to-update-seller-application';
import { FailedToGetSellerApplicationError } from '../error/failed-to-get-seller-application';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly encryptService: EncryptService,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.findOneByEmail(createUserDto.email);

    this.assertUserDoesNotExists(user);

    const hashedUser = await this.hashUserPassword(createUserDto);

    const newUser = await this.userRepository.create(hashedUser).catch(() => {
      throw new FailedToCreateUserError();
    });

    return new UserEntity(newUser);
  }

  public async findOneByIdAndThrow(id: string): Promise<UserEntity> {
    const user = await this.findOneById(id);

    this.assertUserExists(user);

    return new UserEntity(user);
  }

  public async findOneById(id: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneById(id).catch(() => {
      throw new FailedToGetUserError();
    });
  }

  public async validateUserPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneByEmail(email).catch(() => {
      throw new FailedToGetUserError();
    });

    this.assertUserExists(user);

    await this.encryptService.compareAndThrow(password, user.password);

    return new UserEntity(user);
  }

  public async applyToSeller(
    id: string,
    description: string,
  ): Promise<SellerApplicationEntity> {
    const user = await this.findOneById(id);

    this.assertUserExists(user);

    const sellerApplication = await this.userRepository
      .applyToSeller(id, description)
      .catch(() => {
        throw new FailedToCreateSellerApplicationError();
      });

    return new SellerApplicationEntity(sellerApplication);
  }

  public async findManySellerApplication(
    skip: number,
    take: number,
  ): Promise<SellerApplicationEntity[]> {
    const sellerApplications = await this.userRepository
      .findManySellerApplication(skip, take)
      .catch(() => {
        throw new FailedToGetSellerApplicationError();
      });

    return sellerApplications.map(
      (sellerApplication) => new SellerApplicationEntity(sellerApplication),
    );
  }

  public async approveToSeller(id: string): Promise<SellerApplicationEntity> {
    const sellerApplication = await this.userRepository
      .approveToSeller(id)
      .catch(() => {
        throw new FailedToUpdateSellerApplicationError();
      });

    return new SellerApplicationEntity(sellerApplication);
  }

  public async rejectToSeller(id: string): Promise<SellerApplicationEntity> {
    const sellerApplication = await this.userRepository
      .rejectToSeller(id)
      .catch(() => {
        throw new FailedToUpdateSellerApplicationError();
      });

    return new SellerApplicationEntity(sellerApplication);
  }

  private async findOneByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOneByEmail(email).catch(() => {
      throw new FailedToGetUserError();
    });
  }

  private assertUserExists(user: UserEntity | null): void {
    if (!user) {
      throw new UserNotFoundError();
    }
  }

  private assertUserDoesNotExists(user: UserEntity | null): void {
    if (user) {
      throw new UserAlreadyExistsError();
    }
  }

  private async hashUserPassword(
    createUserDto: CreateUserDto,
  ): Promise<CreateUserDto> {
    const hashedPassword = await this.encryptService.hash(
      createUserDto.password,
    );

    return { ...createUserDto, password: hashedPassword };
  }
}
