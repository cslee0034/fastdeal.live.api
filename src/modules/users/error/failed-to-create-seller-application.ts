import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToCreateSellerApplicationError extends HttpException {
  constructor() {
    super(
      'Failed to create seller application',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
