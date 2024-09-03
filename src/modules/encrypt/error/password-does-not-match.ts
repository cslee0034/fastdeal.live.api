import { HttpException } from '@nestjs/common';

export class PasswordDoesNotMatch extends HttpException {
  constructor() {
    super('Password do not match', 401);
  }
}
