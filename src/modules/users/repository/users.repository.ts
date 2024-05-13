import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '@prisma/client';
import { Provider, Role } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      provider = 'local',
      password = null,
      firstName = null,
      lastName = null,
    } = createUserDto;

    const enumProvider = this.mapProvider(provider);

    return await this.prisma.user.create({
      data: {
        email,
        provider: enumProvider,
        password,
        firstName,
        lastName,
        role: Role.user,
      },
    });
  }

  async findOrCreate(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      provider,
      password = null,
      firstName = null,
      lastName = null,
    } = createUserDto;

    const enumProvider = this.mapProvider(provider);

    return await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        provider: enumProvider,
        password,
        firstName,
        lastName,
        role: Role.user,
      },
    });
  }

  private mapProvider(provider: string): Provider {
    return provider === 'google' ? Provider.google : Provider.local;
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }
}
