import { HttpException } from '@nestjs/common';

export class FailedToGetRefreshTokenError extends HttpException {
  constructor() {
    super('Failed to get refresh token', 500);
  }
}
