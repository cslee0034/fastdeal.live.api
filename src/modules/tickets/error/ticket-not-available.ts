import { HttpException, HttpStatus } from '@nestjs/common';

export class TicketNotAvailableError extends HttpException {
  constructor() {
    super('Ticket not available', HttpStatus.BAD_REQUEST);
  }
}
