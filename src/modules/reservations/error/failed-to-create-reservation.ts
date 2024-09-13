import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToCreateReservation extends HttpException {
  constructor() {
    super('Failed to create reservation', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
