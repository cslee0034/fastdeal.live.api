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

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

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

  async reserveStandingTx(
    tx: PrismaService,
    createStandingDto: CreateStandingDto,
    reservation: Reservation,
  ): Promise<TicketEntity> {
    const ticket = await this.findStandingTicketTx(tx, createStandingDto);

    const bookedTicket = await this.reserveStandingTicketTx(
      tx,
      reservation,
      ticket,
    );

    return new TicketEntity(bookedTicket);
  }

  private async findStandingTicketTx(
    tx: PrismaService,
    createStandingDto: CreateStandingDto,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepository
      .findStandingTicketTx(tx, createStandingDto)
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

  private async reserveStandingTicketTx(
    tx: PrismaService,
    reservation: Reservation,
    ticket: Ticket,
  ): Promise<Ticket> {
    const bookedTicket = await this.ticketsRepository
      .reserveStandingTicketTx(tx, reservation, ticket)
      .catch(() => {
        throw new FailedToReserveTicketError();
      });

    return bookedTicket;
  }
}
