import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApplicationStatus, SellerApplication, User } from '@prisma/client';
import { Role } from '@prisma/client';

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
    id: string,
    description: string,
  ): Promise<SellerApplication> {
    return await this.prisma.sellerApplication.create({
      data: {
        user: {
          connect: {
            id: id,
          },
        },
        description: description,
      },
    });
  }

  async findManySellerApplication(
    skip: number,
    take: number,
  ): Promise<SellerApplication[]> {
    return await this.prisma.sellerApplication.findMany({
      skip,
      take,
    });
  }

  async approveToSeller(id: string): Promise<SellerApplication> {
    return await this.prisma.sellerApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.APPROVED,
      },
    });
  }

  async rejectToSeller(id: string): Promise<SellerApplication> {
    return await this.prisma.sellerApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
      },
    });
  }
}
