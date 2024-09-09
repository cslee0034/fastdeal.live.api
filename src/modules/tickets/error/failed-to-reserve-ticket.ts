import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToReserveTicketError extends HttpException {
  constructor() {
    super('Failed to reserve ticket', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
