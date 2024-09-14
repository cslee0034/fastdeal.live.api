import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { FailedToFindTicketError } from '../error/failed-to-find-ticket';
import { FailedToCountTicketError } from '../error/failed-to-count-ticket';
import { TicketNotAvailableError } from '../error/ticket-not-available';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketNotFoundError } from '../error/ticket-not-found';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';
import { Reservation, Ticket } from '@prisma/client';
import { FailedToReserveTicketError } from '../error/failed-to-reserve-ticket';
import { CreateStandingDto } from '../../reservations/dto/create-standing-dto';
import { ObjectWithSuccess } from '../../../common/interface/object-with-success';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly cacheService: RedisService,
    private readonly ticketsRepository: TicketsRepository,
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

  async findTicketByTicketIdTX(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
  ): Promise<ObjectWithSuccess> {
    const isTicketSoldOut = await this.cacheService.getTicketSoldOut(
      createSeatingDto.ticketId,
    );

    if (isTicketSoldOut) {
      return { success: false, message: 'ticket sold out' };
    }

    const ticket = await this.ticketsRepository
      .findTicketByTicketIdTX(tx, createSeatingDto)
      .catch(() => {
        throw new FailedToFindTicketError();
      });

    if (!ticket) {
      return { success: false, message: 'ticket not found' };
    }

    if (!ticket.isAvailable) {
      return { success: false, message: 'ticket not available' };
    }

    await this.cacheService.setTicketSoldOut(ticket.id);

    return { success: true };
  }

  async reserveSeatingTicketTX({
    tx,
    createSeatingDto,
    reservation,
  }: {
    tx: PrismaService;
    createSeatingDto: CreateSeatingDto;
    reservation: Reservation;
  }): Promise<void> {
    await this.ticketsRepository
      .reserveSeatingTicketTX({
        tx,
        createSeatingDto,
        reservation,
      })
      .catch(() => {
        throw new FailedToReserveTicketError();
      });
  }

  async reserveRandomStandingTicketTX({
    tx,
    createStandingDto,
    reservation,
  }: {
    tx: PrismaService;
    createStandingDto: CreateStandingDto;
    reservation: Reservation;
  }): Promise<TicketEntity> {
    const ticket = await this.findStandingTicketTX(tx, createStandingDto);

    const bookedTicket = await this.reserveStandingTicketTX({
      tx,
      reservation,
      ticket,
    });

    return new TicketEntity(bookedTicket);
  }

  private async findStandingTicketTX(
    tx: PrismaService,
    createStandingDto: CreateStandingDto,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepository
      .findStandingTicketTX(tx, createStandingDto)
      .catch(() => {
        throw new FailedToFindTicketError();
      });

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    if (!ticket.isAvailable) {
      throw new TicketNotAvailableError();
    }

    return ticket;
  }

  private async reserveStandingTicketTX({
    tx,
    reservation,
    ticket,
  }: {
    tx: PrismaService;
    reservation: Reservation;
    ticket: Ticket;
  }): Promise<Ticket> {
    const bookedTicket = await this.ticketsRepository
      .reserveStandingTicketTX({
        tx,
        reservation,
        ticket,
      })
      .catch(() => {
        throw new FailedToReserveTicketError();
      });

    return bookedTicket;
  }
}
