import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToUpdateSellerApplicationError extends HttpException {
  constructor() {
    super(
      'Failed to update seller application',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
