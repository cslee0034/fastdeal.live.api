import { HttpException, HttpStatus } from '@nestjs/common';

export class FailedToAddQueue extends HttpException {
  constructor() {
    super('Failed to add queue', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
