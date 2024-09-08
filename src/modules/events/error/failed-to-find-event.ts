import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToFindEventError extends HttpException {
  constructor() {
    super('Failed to find event', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
