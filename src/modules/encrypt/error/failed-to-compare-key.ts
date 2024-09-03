import { HttpException } from '@nestjs/common';

export class FailedToCompareKey extends HttpException {
  constructor() {
    super('Failed to compare key', 500);
  }
}
