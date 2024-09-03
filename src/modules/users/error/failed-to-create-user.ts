import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToCreateUserError extends HttpException {
  constructor() {
    super('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
