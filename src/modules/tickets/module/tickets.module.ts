import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { TicketsRepository } from '../repository/tickets.repository';
import { TicketsController } from '../controller/tickets.controller';
import { TicketsService } from '../service/tickets.service';
import { RedisModule } from '../../../infrastructure/cache/module/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository],
  exports: [TicketsService, TicketsRepository],
})
export class TicketsModule {}
