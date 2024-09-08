import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { MappedTicket } from '../interface/mapped-ticket.interface';
import { TicketCount } from '../interface/ticket-count';
import { Ticket } from '@prisma/client';

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
}
