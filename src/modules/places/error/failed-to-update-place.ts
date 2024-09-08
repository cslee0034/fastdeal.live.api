import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToUpdatePlaceError extends HttpException {
  constructor() {
    super('Failed to update place', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
