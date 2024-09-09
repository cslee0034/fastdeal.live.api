import { Module } from '@nestjs/common';
import { ReservationsController } from '../controller/reservations.controller';
import { ReservationsService } from '../service/reservations.service';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { ReservationsRepository } from '../repository/reservations.repository';
import { TicketsModule } from '../../tickets/module/tickets.module';
import { LockModule } from '../../../infrastructure/lock/module/lock.module';

@Module({
  imports: [PrismaModule, TicketsModule, LockModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
