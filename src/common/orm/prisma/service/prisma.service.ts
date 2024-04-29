import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    super({
      log: isProduction ? ['warn'] : ['info'],
    });
  }
}
