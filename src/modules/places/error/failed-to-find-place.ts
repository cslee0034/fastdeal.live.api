import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToFindPlaceError extends HttpException {
  constructor() {
    super('Failed to find place', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
