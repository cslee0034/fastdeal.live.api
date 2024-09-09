import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { FailedToFindTicketError } from '../error/failed-to-find-ticket';
import { FailedToCountTicketError } from '../error/failed-to-count-ticket';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { TicketNotAvailableError } from '../error/ticket-not-available';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketNotFoundError } from '../error/ticket-not-found';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';
import { Reservation } from '@prisma/client';
import { FailedToReserveTicketError } from '../error/failed-to-reserve-ticket';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly cacheService: RedisService,
  ) {}

  async findTicketsByEventId(eventId: string): Promise<TicketEntity[]> {
    const tickets = await this.ticketsRepository
      .findTicketsByEventId(eventId)
      .catch(() => {
        throw new FailedToFindTicketError();
      });

    return tickets.map((ticket) => new TicketEntity(ticket));
  }

  async countTicketsByEventId(eventId: string): Promise<number> {
    const ticketCount = await this.ticketsRepository
      .countTicketsByEventId(eventId)
      .catch(() => {
        throw new FailedToCountTicketError();
      });

    return ticketCount;
  }

  async findTicketWithLockTx(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
  ): Promise<void> {
    const ticket = await this.ticketsRepository
      .findTicketWithLockTx(tx, createSeatingDto)
      .catch(() => {
        throw new FailedToFindTicketError();
      });

    if (ticket.length === 0) {
      throw new TicketNotFoundError();
    }

    if (!ticket[0].isAvailable) {
      throw new TicketNotAvailableError();
    }
  }

  async reserveSeatingTx(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
    reservation: Reservation,
  ): Promise<void> {
    await this.ticketsRepository
      .reserveSeatingTx(tx, createSeatingDto, reservation)
      .catch(() => {
        throw new FailedToReserveTicketError();
      });
  }
}
