import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { SellerApplication, User } from '@prisma/client';
import { Role } from '@prisma/client';
import { ApplyToSellerDto } from '../dto/apply-to-seller.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        role: Role.CUSTOMER,
      },
    });
  }

  async findOneById(id: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async applyToSeller(
    applyToSellerDto: ApplyToSellerDto,
  ): Promise<SellerApplication> {
    return await this.prisma.sellerApplication.create({
      data: {
        user: {
          connect: {
            id: applyToSellerDto.userId,
          },
        },
        description: applyToSellerDto.description,
      },
    });
  }
}
