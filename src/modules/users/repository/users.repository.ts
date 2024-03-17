import { PrismaService } from '../../../config/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, password } = createUserDto;

    return await this.prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }
}
