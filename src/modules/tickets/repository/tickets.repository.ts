import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { MappedTicket } from '../interface/mapped-ticket.interface';
import { TicketCount } from '../interface/ticket-count';
import { Reservation, Ticket } from '@prisma/client';
import { CreateSeatingDto } from '../../reservations/dto/create-seating.dto';

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

  async findTicketWithLockTx(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
  ): Promise<Ticket[]> {
    return await tx.$queryRaw`
      SELECT 
        *
      FROM 
        Ticket
      WHERE 
        id = ${createSeatingDto.ticketId} AND
        eventId = ${createSeatingDto.eventId}
      FOR UPDATE
    `;
  }

  async reserveSeatingTx(
    tx: PrismaService,
    createSeatingDto: CreateSeatingDto,
    reservation: Reservation,
  ): Promise<void> {
    await tx.ticket.update({
      where: {
        id: createSeatingDto.ticketId,
        eventId: createSeatingDto.eventId,
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
