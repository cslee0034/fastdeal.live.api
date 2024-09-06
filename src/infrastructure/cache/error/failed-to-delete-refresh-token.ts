import { HttpException } from '@nestjs/common';

export class FailedToDeleteRefreshTokenError extends HttpException {
  constructor() {
    super('Failed to delete refresh token', 500);
  }
}
