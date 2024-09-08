import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToGetSellerApplicationError extends HttpException {
  constructor() {
    super('Failed to get seller application', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
