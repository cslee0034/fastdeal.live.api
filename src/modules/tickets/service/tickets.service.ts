import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { FailedToFindTicketError } from '../error/failed-to-find-ticket';
import { FailedToCountTicketError } from '../error/failed-to-count-ticket';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async findTicketsByEventId(eventId: string) {
    const tickets = await this.ticketsRepository
      .findTicketsByEventId(eventId)
      .catch(() => {
        throw new FailedToFindTicketError();
      });

    return tickets.map((ticket) => new TicketEntity(ticket));
  }

  async countTicketsByEventId(eventId: string) {
    const ticketCount = await this.ticketsRepository
      .countTicketsByEventId(eventId)
      .catch(() => {
        throw new FailedToCountTicketError();
      });

    return ticketCount;
  }
}
