import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToCreateEventError extends HttpException {
  constructor() {
    super('Failed to create event', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
