import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { TicketsRepository } from '../repository/tickets.repository';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [TicketsRepository],
  exports: [TicketsRepository],
})
export class TicketsModule {}
