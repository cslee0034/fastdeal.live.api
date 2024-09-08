import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToCreatePlaceError extends HttpException {
  constructor() {
    super('Failed to create place', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
