import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateSeatingDto } from '../dto/create-seating.dto';

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
}
