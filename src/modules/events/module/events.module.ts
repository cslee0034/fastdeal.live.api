import { Module } from '@nestjs/common';
import { EventsController } from '../controller/events.controller';
import { EventsService } from '../service/events.service';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { EventsRepository } from '../repository/events.repository';
import { TicketsModule } from '../../tickets/module/tickets.module';

@Module({
  imports: [PrismaModule, TicketsModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
