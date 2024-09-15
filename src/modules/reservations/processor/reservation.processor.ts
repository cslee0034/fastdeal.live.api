import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsService } from '../../tickets/service/tickets.service';
import { ReservationsService } from '../service/reservations.service';
import { SECONDS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-seconds';

/**
 * @description
 * @Processor: BullMQ 프로세서 데코레이터
 * - 동시에(concurrency) 1개의 프로세서만 동작함
 * - 1초 동안(duration) 최대 1개의 작업만(max) 처리할 수 있도록 제한
 */
@Processor('reservation', {
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 1 * SECONDS,
  },
})
export class ReservationConsumer extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly reservationService: ReservationsService,
  ) {
    super();
  }

  /**
   * @description
   * - reservation 큐를 처리하는 프로세서
   *
   * @throws
   * - QueueEventsListener에서 에러를 처리하기 떄문에 별도로 catch할 필요가 없음
   */
  async process(job: Job<any, any, string>): Promise<void> {
    const { userId, createSeatingDto } = job.data;

    return await this.prisma.$transaction(async (tx: PrismaService) => {
      const reservation =
        await this.reservationService.createSeatingReservationTX({
          tx,
          createSeatingDto,
          userId,
        });

      await this.ticketsService.reserveSeatingTicketTX({
        tx,
        createSeatingDto,
        reservation,
      });
    });
  }
}
