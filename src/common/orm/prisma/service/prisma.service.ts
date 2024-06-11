import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { isDevEnv } from '../../../util/is-dev-env';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const isDevelopment = isDevEnv();

    super({
      log: isDevelopment ? ['info', 'warn', 'error'] : ['warn', 'error'],
    });
  }
}
