import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from '../service/queue.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getQueueConfig } from '../../../config/queue/queue';
import { RedisModule } from '../../cache/module/redis.module';
import { ReservationQueueListener } from '../event/queue.event';
import { LoggerModule } from '../../logger/logger.module';
import { SlackWebHookModule } from '../../webhook/slack.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<any> =>
        getQueueConfig(configService),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'reservation',
    }),
    RedisModule,
    LoggerModule,
    SlackWebHookModule,
  ],
  providers: [QueueService, ReservationQueueListener],
  exports: [QueueService],
})
export class QueueModule {}
