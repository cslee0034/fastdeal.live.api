import { HttpException } from '@nestjs/common';

export class FailedToSetRefreshTokenError extends HttpException {
  constructor() {
    super('Failed to set refresh token', 500);
  }
}
