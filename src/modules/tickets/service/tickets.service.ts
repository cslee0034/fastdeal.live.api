import { Injectable } from '@nestjs/common';
import { TicketsRepository } from '../repository/tickets.repository';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}
}
