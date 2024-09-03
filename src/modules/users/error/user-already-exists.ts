import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsError extends HttpException {
  constructor() {
    super('User already exists', HttpStatus.CONFLICT);
  }
}
