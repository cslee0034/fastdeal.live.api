import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { MappedTicket } from '../interface/mapped-ticket.interface';
import { TicketCount } from '../interface/ticket-count';

@Injectable()
export class TicketsRepository {
  constructor(private prisma: PrismaService) {}

  async createTickets(
    tx: PrismaService,
    mappedTicket: MappedTicket[],
  ): Promise<TicketCount> {
    const tickets = await tx.ticket.createMany({
      data: mappedTicket,
    });

    return tickets;
  }
}
