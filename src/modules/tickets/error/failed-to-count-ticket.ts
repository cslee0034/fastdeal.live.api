import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToCountTicketError extends HttpException {
  constructor() {
    super('Failed to count ticket', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
