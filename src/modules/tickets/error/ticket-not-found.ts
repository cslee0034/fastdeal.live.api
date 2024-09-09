import { HttpException, HttpStatus } from '@nestjs/common';

export class TicketNotFoundError extends HttpException {
  constructor() {
    super('Ticket not found', HttpStatus.NOT_FOUND);
  }
}
