import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { RedisService } from '../../cache/service/redis.service';
import { FailedToAddQueue } from '../error/failed-to-add-queue';
import { SECONDS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-seconds';
import { RAW_HOURS } from '../../../common/constant/time/seconds-base/hours';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('reservation') private reservationQueue: Queue,
    private readonly cacheService: RedisService,
  ) {}

  async addReservationJob(data: any) {
    await this.reservationQueue
      .add('reservation', data, {
        attempts: 3, // 작업 실패 시 3번까지 재시도
        backoff: {
          type: 'fixed', // 고정된 시간 간격으로 다시 시도
          delay: 1 * SECONDS, // 1초 간격으로 다시 시도
        },
        removeOnComplete: true, // 작업 완료 시 작업을 삭제
        removeOnFail: {
          age: 24 * RAW_HOURS, // 작업 실패 시 24시간 후 작업을 삭제
        },
      })
      .catch(async () => {
        // 큐에 작업을 추가하는데 실패한 경우 sold out 상태를 해제
        await this.cacheService.deleteTicketSoldOut(
          data.createSeatingDto.ticketId,
        );

        throw new FailedToAddQueue();
      });
  }
}
