import { Module } from '@nestjs/common';
import { ReservationsController } from '../controller/reservations.controller';
import { ReservationsService } from '../service/reservations.service';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { ReservationsRepository } from '../repository/reservations.repository';
import { TicketsModule } from '../../tickets/module/tickets.module';
import { LockModule } from '../../../infrastructure/lock/module/lock.module';
import { RedisModule } from '../../../infrastructure/cache/module/redis.module';
import { QueueModule } from '../../../infrastructure/queue/module/queue.module';
import { ReservationConsumer } from '../processor/reservation.processor';

@Module({
  imports: [PrismaModule, TicketsModule, LockModule, RedisModule, QueueModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository, ReservationConsumer],
})
export class ReservationsModule {}
