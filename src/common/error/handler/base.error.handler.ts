import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Logger } from 'winston';

export class BaseErrorHandler {
  constructor(protected readonly logger: Logger) {}

  public handleThrownError(error: Error): void {
    if (
      error instanceof HttpException ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      throw error;
    }
  }

  public logInputs(inputs: any): void {
    this.logger.error(`\ninputs: ${JSON.stringify(inputs, null, 2)}`);
  }
}
