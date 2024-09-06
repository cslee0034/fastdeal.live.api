import { HttpException } from '@nestjs/common';

export class FailedToHashKey extends HttpException {
  constructor() {
    super('Failed to hash key', 500);
  }
}
