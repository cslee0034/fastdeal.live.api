import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { CreateStandingDto } from '../dto/create-standing-dto';

@Injectable()
export class ReservationsRepository {
  constructor(private prisma: PrismaService) {}

  async createSeatingTx(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
    userId: string,
  ) {
    return await tx.reservation.create({
      data: {
        event: {
          connect: {
            id: createSeatingDto.eventId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async createStandingTx(
    tx: PrismaService,
    createStandingDto: CreateStandingDto,
    userId: string,
  ) {
    return await tx.reservation.create({
      data: {
        event: {
          connect: {
            id: createStandingDto.eventId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
