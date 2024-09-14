import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { MappedTicket } from '../interface/mapped-ticket.interface';
import { TicketCount } from '../interface/ticket-count';
import { Reservation, Ticket } from '@prisma/client';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';
import { CreateStandingDto } from '../../reservations/dto/create-standing-dto';

@Injectable()
export class TicketsRepository {
  constructor(private prisma: PrismaService) {}

  async createTicketsTx(
    tx: PrismaService,
    mappedTicket: MappedTicket[],
  ): Promise<TicketCount> {
    const tickets = await tx.ticket.createMany({
      data: mappedTicket,
    });

    return tickets;
  }

  async findTicketsByEventId(eventId: string): Promise<Ticket[]> {
    return await this.prisma.ticket.findMany({
      where: {
        eventId,
      },
    });
  }

  async countTicketsByEventId(eventId: string): Promise<number> {
    return await this.prisma.ticket.count({
      where: {
        eventId,
      },
    });
  }

  async findTicketByTicketId(ticketId: string): Promise<Ticket> {
    return await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
      },
    });
  }

  async findTicketByTicketIdTX(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
  ): Promise<Ticket> {
    return await tx.ticket.findFirst({
      where: {
        id: createSeatingDto.ticketId,
      },
    });
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
    await tx.ticket.update({
      where: {
        id: createSeatingDto.ticketId,
      },
      data: {
        isAvailable: false,
        reservation: {
          connect: {
            id: reservation.id,
          },
        },
      },
    });
  }

  async findStandingTicketTX(
    tx: PrismaService,
    createStandingDto: CreateStandingDto,
  ): Promise<Ticket> {
    const tickets = await tx.ticket.findFirst({
      where: {
        eventId: createStandingDto.eventId,
        isAvailable: true,
      },
    });

    return tickets;
  }

  async reserveStandingTicketTX({
    tx,
    reservation,
    ticket,
  }: {
    tx: PrismaService;
    reservation: Reservation;
    ticket: Ticket;
  }): Promise<Ticket> {
    return await tx.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        isAvailable: false,
        reservation: {
          connect: {
            id: reservation.id,
          },
        },
      },
    });
  }
}
