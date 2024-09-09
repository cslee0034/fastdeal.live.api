import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from '../repository/reservations.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { TicketsService } from '../../tickets/service/tickets.service';
import { ReservationEntity } from '../entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async createSeating(userId: string, createSeatingDto: CreateSeatingDto) {
    const result = await this.prisma.$transaction(async (tx: PrismaService) => {
      await this.ticketsService.findTicketWithLockTx(tx, createSeatingDto);

      const reservation = await this.reservationsRepository.createSeatingTx(
        tx,
        createSeatingDto,
        userId,
      );

      await this.ticketsService.reserveSeatingTx(
        tx,
        createSeatingDto,
        reservation,
      );

      return reservation;
    });

    return new ReservationEntity(result);
  }
}
