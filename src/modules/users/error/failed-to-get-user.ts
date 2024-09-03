import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToGetUserError extends HttpException {
  constructor() {
    super('Failed to get user', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
