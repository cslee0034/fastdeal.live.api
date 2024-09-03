import { HttpException } from '@nestjs/common';

export class FailedToCreateTokensError extends HttpException {
  constructor() {
    super('Failed to create tokens', 500);
  }
}
