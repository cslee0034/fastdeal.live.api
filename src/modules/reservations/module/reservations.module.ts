import { Module } from '@nestjs/common';
import { ReservationsController } from '../controller/reservations.controller';
import { ReservationsService } from '../service/reservations.service';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { ReservationsRepository } from '../repository/reservations.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
