import { Prisma } from '@prisma/client';
import { Logger } from 'winston';

export class PrismaErrorHandler {
  constructor(protected readonly logger: Logger) {}

  public handlePrismaError(error: Error): void {
    if (
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
