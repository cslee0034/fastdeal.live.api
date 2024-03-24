import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getProducerConfig } from '../../../../config/queue/producer/producer';
import { MessageProducer } from '../service/producer.service';

@Module({
  imports: [
    ConfigModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): object =>
        getProducerConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [MessageProducer],
  exports: [MessageProducer],
})
export class ProducerModule {}
