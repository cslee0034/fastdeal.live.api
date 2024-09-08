import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToRemovePlaceError extends HttpException {
  constructor() {
    super('Failed to remove place', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
