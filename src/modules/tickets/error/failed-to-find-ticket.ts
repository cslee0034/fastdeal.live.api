import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToFindTicketError extends HttpException {
  constructor() {
    super('Failed to find ticket', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
